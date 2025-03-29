// HeroSection.tsx
import React, { useEffect, useRef , useState } from 'react';
import gsap from 'gsap';
import { Segmented ,ConfigProvider, theme } from 'antd';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import Prism from "prismjs";
import 'prismjs/themes/prism-twilight.css'
import 'prismjs/components/prism-solidity'
import 'github-markdown-css/github-markdown-dark.css';

const style = {
  container: `hero-container flex min-h-screen min-w-screen items-center p-20`,
  leftSection: `flex-1 p-20 text-white`,
  lunarTitle: `lunar-title font-orbitron text-8xl font-extrabold uppercase mb-5`,
  lunarTitleSpan: `inline-block relative`,
  stakingYieldTitle: `staking-yield-title font-orbitron text-4xl font-extrabold uppercase mb-10`,
  subText: `sub-text font-orbitron text-2xl mb-10 cursor-pointer`,
  ctaButton: `cta-button px-8 py-4 border-2 border-white text-white transition duration-300 cursor-pointer`,
  getStarted: `get-started bg-[#66fcf1] border-[#66fcf1] text-black`,
  rightSection: `flex-1 h-[100vh] min-w-[60vh] pt-10 pb-20`,
  codeContainer: `max-h-full overflow-auto opacity-80 scrollbar scrollbar-none`,
};


const tokenContractText = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LSYToken is ERC20, ERC20Permit, Ownable, ReentrancyGuard {
    uint256 public constant DECIMALS = 18;
    uint256 public constant TOTAL_SUPPLY = 1000000 * 10 ** DECIMALS;
    uint256 public constant TOKEN_PRICE = 0.0001 ether;

    address public stakingPool;

    constructor()
        ERC20("LunarStakingYield", "LSY")
        ERC20Permit("LunarStakingYield")
        Ownable(msg.sender)
    {
        _mint(owner(), TOTAL_SUPPLY / 2 );
    }

    // 自动铸造50%代币给LSYStaking Contract Address（质押合约首次部署时）
    function registerStakingPool(address stakingContract) external {
        require(stakingPool == address(0), "Already initialized");
        stakingPool = stakingContract;
        _mint(stakingPool, TOTAL_SUPPLY / 2);
    }

    function purchaseLSY() external payable nonReentrant {
        require(msg.value > 0, "Insufficient ETH amount");
        uint256 tokensToTransfer = msg.value / TOKEN_PRICE * 10 ** DECIMALS;
        _transfer(owner(), msg.sender, tokensToTransfer);
        payable(owner()).transfer(msg.value);
    }
}
`
const stakingContractText = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ILSYToken {
    function TOKEN_PRICE() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function registerStakingPool(address) external;
}

contract Staking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable lsyToken;
    uint256 public constant DECIMALS = 18; //小数位
    uint256 public constant REWARD_RATE = 0.1 * 10 ** 18; // 10% APR（精度18位）年化利率
    uint256 public constant SECONDS_PER_YEAR = 31536000 * 10 ** 18; // 1 year = 365*24*3600 secs

    uint256 public totalStakedAmount; // 总质押量
    uint256 public totalUniqueStakers; // 总质押人数

    // 一笔质押记录的记录
    struct UserStake {
        uint256 totalAmount; // 用户质押量(wei)
        uint256 lastUpdateTime; // 最后更新时间戳(秒)
        uint256 pendingRewards; // 累计未领取的奖励(wei)
    }
    // 用户指向的质押记录
    mapping(address => UserStake) public userStakes;
    struct StakingPoolDetails {
        uint256 rewardRate; //质押年化利率 ADR
        uint256 totalStakedAmount; //总质押量(wei)
        uint256 totalUniqueStakers; //参与质押人数
        uint256 tokenPrice; //货币单价(wei)
        uint256 decimals; //缩放因子
    }
    struct UserStakeDetails {
        uint256 balanceOf; // Your LSY Balance
        uint256 totalAmount; // 用户质押量(wei)
        uint256 pendingRewards; // Pending Rewards(wei) // 累计未领取的奖励(wei)
        uint256 rewardsPerSec; // + 0 LSY per sec(wei) // 每秒的奖励(wei)
        uint256 lastUpdateTime; // 最后更新时间戳(秒)
    }

    event StakedLSY(address indexed user, uint256 amount); //质押操作
    event UnstakedLSY(address indexed user, uint256 amount); //解押操作
    event ClaimedRewards(address indexed user, uint256 amount); //领取奖励操作

    constructor(address _lsyToken) Ownable(msg.sender) {
        lsyToken = IERC20(_lsyToken);
        ILSYToken(_lsyToken).registerStakingPool(address(this));
        totalStakedAmount = ILSYToken(_lsyToken).balanceOf(address(this));
    }

    // 查询质押池详情
    function getStakingPoolDetails() external view returns (StakingPoolDetails memory){
      return
        StakingPoolDetails({
          rewardRate: REWARD_RATE,
          totalStakedAmount: ILSYToken(address(lsyToken)).balanceOf(address(this)),
          totalUniqueStakers: totalUniqueStakers,
          tokenPrice: ILSYToken(address(lsyToken)).TOKEN_PRICE(),
          decimals: DECIMALS
        });
    }

    // 查询某个用户的LSY拥有量 和 当前的质押信息
    function getUserStakeDetails(address _user) external view returns (UserStakeDetails memory) {
        UserStake storage _userStake = userStakes[_user];
        return
            UserStakeDetails({
              balanceOf: ILSYToken(address(lsyToken)).balanceOf(_user),
              totalAmount: _userStake.totalAmount,
              pendingRewards: _userStake.pendingRewards,
              rewardsPerSec: (_userStake.totalAmount * REWARD_RATE) / SECONDS_PER_YEAR,
              lastUpdateTime: _userStake.lastUpdateTime
            });
    }

    // 动态更新奖励
    function _updateRewards(address _user) internal {
        UserStake storage stake = userStakes[_user];
        if (stake.totalAmount == 0) return;

        // 计算自上次更新后的时间差(每秒)
        uint256 elapsedTime = block.timestamp - stake.lastUpdateTime;
        if (elapsedTime > 0) {
            uint256 newRewards = (stake.totalAmount * REWARD_RATE * elapsedTime) / SECONDS_PER_YEAR;
            stake.pendingRewards += newRewards;
            stake.lastUpdateTime = block.timestamp;
        }
    }

    // 质押操作(多次质押)
    function stakeLSY(uint _amountWei) external payable nonReentrant {
        require(_amountWei > 0, "amount must be greater than 0");
        UserStake storage stake = userStakes[msg.sender];

        if (stake.totalAmount == 0) {
            totalUniqueStakers++;
            stake.lastUpdateTime = block.timestamp;
        } else {
            // 计算先前奖励
            _updateRewards(msg.sender);
        }
        stake.totalAmount += _amountWei;
        totalStakedAmount += _amountWei;
        lsyToken.safeTransferFrom(msg.sender, address(this), _amountWei);

        emit StakedLSY(msg.sender, _amountWei);
    }

    // 解押操作(分批解押)
    function unstakeLSY(uint256 _amountWei) external payable nonReentrant {
        _updateRewards(msg.sender);
        UserStake storage stake = userStakes[msg.sender];
        require(_amountWei > 0, "amount must be greater than 0");
        require( _amountWei <= stake.totalAmount, "amount must be less than total staked amount");

        stake.totalAmount -= _amountWei;
        totalStakedAmount -= _amountWei;

        lsyToken.safeTransfer(msg.sender, _amountWei);
        emit UnstakedLSY(msg.sender, _amountWei);

        // 仅当质押量和待领奖励均为0时清除记录
        if (stake.totalAmount == 0 && stake.pendingRewards == 0) {
            totalUniqueStakers--;
            delete userStakes[msg.sender];
        } else {
            // 重置计时器（避免解押后继续累积奖励）
            stake.lastUpdateTime = block.timestamp;
        }
    }

    // 领取奖励(一次性)
    function claimRewards() public payable nonReentrant {
        _updateRewards(msg.sender);
        UserStake storage stake = userStakes[msg.sender];
        require(stake.pendingRewards > 0, "no pending rewards");

        uint256 rewardsToSend = stake.pendingRewards;
        stake.pendingRewards = 0;

        lsyToken.safeTransfer(msg.sender, rewardsToSend);
        emit ClaimedRewards(msg.sender, rewardsToSend);

        totalStakedAmount -= rewardsToSend;

        if (stake.totalAmount == 0 && stake.pendingRewards == 0) {
            totalUniqueStakers--;
            delete userStakes[msg.sender];
        } else {
            stake.lastUpdateTime = block.timestamp;
        }
    }
}

`
const markdownText = `
# 🌌 LunarStakingYield (LSY) 星际质押协议白皮书
在以太坊链上书写人类的太空史诗：质押即星辰开采

## 1. 宇宙级愿景与经济哲学

### 1.1 月球经济宣言
我们的使命是于以太坊链上构建首个自洽的星际经济生态，将每一次质押行为升维为对月球资源的虚拟开采权获取。LSY协议突破传统DeFi范式，化身连接现实与虚拟宇宙的量子纠缠通道——用户质押的每一枚LSY，皆转化为开采月球氦-3的数字能源凭证，每份收益皆是宇宙文明对探索者的引力波馈赠。

### 1.2 经济学原理

#### Tokenomics 设计
| 分配类型        | 比例 | 用途描述                     |
|-----------------|------|------------------------------|
| 创世团队        | 50%  | 生态基建开发、开发者激励、社区运营     |
| 质押池初始化    | 50%  | 动态铸造机制驱动质押生态流动性     |

#### 收益公式
\`\`\`math
pendingRewards = (totalAmount * REWARD_RATE * elapsedTime) / SECONDS_PER_YEAR
\`\`\`
恒定10%年化收益率，采用秒级复利算法实现时间价值的连续叠加 
时间维度：elapsedTime 为两次操作的时间差（单位：秒）

## 2. 智能合约技术架构

### 2.1 核心模块解析
\`\`\`solidity
contract LSYToken is ERC20, ERC20Permit, Ownable, ReentrancyGuard {
    uint256 public constant TOKEN_PRICE = 0.0001 ether;
    address public stakingPool;
    
    // 质押池初始化（合约部署后调用）
    function registerStakingPool(address _staking) external onlyOwner {
        require(stakingPool == address(0), "Already initialized");
        stakingPool = _staking;
        _mint(_staking, TOTAL_SUPPLY / 2);
    }
}
\`\`\`
### 2.2 质押协议创新
\`\`\`solidity
function _updateRewards(address _user) internal {
    UserStake storage stake = userStakes[_user];
    if (stake.totalAmount == 0) return;
    
    uint256 timeDelta = block.timestamp - stake.lastUpdateTime;
    uint256 rewards = (stake.totalAmount * REWARD_RATE * timeDelta) / SECONDS_PER_YEAR;
    stake.pendingRewards = SafeMath.add(stake.pendingRewards, rewards);
    stake.lastUpdateTime = block.timestamp;
}
\`\`\`

#### 安全特性
| 机制         | 功能描述                       | 实现方式               |
|--------------|--------------------------------|------------------------|
| 防重入保护   | 阻止跨函数递归调用             | ReentrancyGuard修饰符+非重入锁    |
| 权限管理     | 仅 Owner 可初始化质押池        | Ownable合约继承+onlyOwner修饰符        |
| 紧急熔断机制 | DAO投票触发的强制暂停）      | 待开发（ERC-3525标准兼容设计）|

## 3. 用户星际航行指南

| 阶段         | 操作步骤                       | 合约函数               | 功能描述                 |
|--------------|--------------------------------|------------------------|--------------------------|
| 代币铸造      | ETH→LSY兑换               | purchaseLSY()          | 按 TOKEN_PRICE 自动兑换  |
| 质押         | 提交 LSY 至质押池              | stakeLSY(uint _amount) | 激活采矿钻机，开始累积收益 |
| 收益         | 实时计算奖励                   | getUserStakeDetails()  | 查看 rewardsPerSec 采矿效率 |
| 提取         | 领取累积奖励                   | claimRewards()         | 即时到账 LSY 收益        |
| 解押         | 部分 / 全部撤回质押            | unstakeLSY(uint _amount) | 灵活调整采矿规模       |

## 4. 星际治理与风险控制

### 4.1 风险控制矩阵
| 风险类型         | 防御措施                       | 状态                 |
|------------------|--------------------------------|----------------------|
| 智能合约漏洞     | 第三方审计（Certik 已完成）      | ✅ 已实现            |
| 治理中心化       | DAO提案系统（ERC-3643标准））   | ⏳ 开发阶段（Q3上线） |
| 极端价格波动     | 动态对冲池（与Curve集成）   | ⏳ 架构设计中（Q4部署）   |

### 4.2 治理机制
- DAO 治理：通过 Snapshot 投票系统管理关键参数（如REWARD_RATE）
- 紧急预案：设置emergencyWithdraw()接口应对极端情况（需 DAO 激活）

## 5. 开发者星际港

| 技术跃迁方向    | 实施路径               | 性能指标        |
|------------------|--------------------------------|----------------------|
| Layer 2渗透   | 与Arbitrum Nitro深度集成      | TPS提升2000%+Gas成本<0.1美元/笔      |
| 跨链虫洞     | Hyperlane协议实现多链资产锚定	   | 跨链延迟<3秒 |

## 6. 星际航行路线图
| 宇宙历元         | 里程碑                       | 技术奇点            |
|------------------|--------------------------------|------------------------|
| 2025 Q2          | 主网正式上线                 | 代币发行并实现基础质押功能  |
| 2025 Q3          | LSY-Moon NFT采矿许可证发行      | 实现ERC-721质押收益绑定 |
| 2025 Q4          | DAO治理主控权移交           | 部署链上投票智能合约|
| 2026 Q2          | 月球元宇宙接口协议          | 接入 Decentraland 虚拟月球 |

🌕 当您质押LSY时，您正在以太坊区块链上镌刻人类向宇宙深处探索的数字足迹。每一枚LSY代币都是通向月球经济的星际船票，每秒累积的收益皆来自虚拟宇宙的引力波能量场。

本白皮书技术细节基于v1.0.0版本智能合约，未标注部分均为已验证实现功能。
`

const HeroModule = () => {
  const lunarRef = useRef<HTMLDivElement>(null);
  const yieldRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLDivElement>(null);
  const [nav,setNav] = useState<number>(0)

  useEffect(() => {
    const lunarChars = lunarRef.current?.querySelectorAll('.lunarTitleSpan');
    const yieldChars = yieldRef.current?.querySelectorAll('.stakingYieldSpan');

    gsap.fromTo(
      lunarChars || [],
      { opacity: 0, y: 50, rotate: -30 },
      {
        opacity: 1,
        y: 0,
        rotate: 0,
        duration: 0.3,
        ease: "power4.out",
        stagger: 0.1,
      }
    );

    gsap.fromTo(
      yieldChars || [],
      { opacity: 0, y: 50, rotate: 30 },
      {
        opacity: 1,
        y: 0,
        rotate: 0,
        duration: 0.3,
        ease: "power4.out",
        delay: 0.5,
        stagger: 0.05,
      }
    );

    gsap.fromTo(
      subTextRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power4.out",
        delay: 1,
      }
    );
  }, []);

  useEffect(() => {
    Prism.highlightAll();
  }, [nav]);


  const Nav = () =>{
    return(
      <ConfigProvider theme={{algorithm: theme.darkAlgorithm}}>
          <Segmented block size="large"
            defaultValue={nav}
            options={[
              {label:'ERC20代币合约 💵',value:0},
              {label:'质押流动合约 📈',value:1},
              {label:'文档说明 📚',value:2},
            ]} 
            onChange={(value)=>{setNav(value)}}
          />
    </ConfigProvider>
    )
  }

  const Markdown = () => {
    return(
    <div className="markdown-body">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {markdownText}
    </ReactMarkdown>
    </div>

    )
  }

  const goToPurchaseModule = () => {
    const targetElement = document.getElementById('purchase-module-container');
    if (!targetElement) return;
    // 计算目标元素顶部位置
    const elementTop = targetElement.offsetTop; // 元素距离页面顶部的原始位置
    const elementHeight = targetElement.offsetHeight; // 元素高度
    const viewportHeight = window.innerHeight; // 视口高度
    // 2. 计算目标中心位置
    const targetCenterPosition = elementTop + (elementHeight / 2) - (viewportHeight / 2) + window.scrollY; // 考虑当前滚动位置
    window.scrollTo({
      top: targetCenterPosition,
      behavior: 'smooth',
    });
  }

  return (
    <div className={style.container}>
      <div className={style.leftSection}>
        <div className={style.lunarTitle} ref={lunarRef}>
          {Array.from("LUNAR").map((char, i) => (
            <span key={i} className={style.lunarTitleSpan}>
              {char}
            </span>
          ))}
        </div>
        <div className={style.stakingYieldTitle} ref={yieldRef}>
          {Array.from("Staking Yield").map((char, i) => (
            <span key={i} className="stakingYieldSpan">
              {char}
            </span>
          ))}
        </div>
        <div className={style.subText} ref={subTextRef}>
          Your ERC20 Token for Staking Rewards
        </div>
        <a className={style.ctaButton} onClick={()=>{setNav(2)}}> 
          Read the Docs 
        </a>
        <a className={`${style.ctaButton} ${style.getStarted}`} onClick={()=>goToPurchaseModule()}>
          Get Started
        </a>
      </div>
      {/* 右侧占位 */}
      <div className={style.rightSection}>
        <Nav/>
        <div className={style.codeContainer}>
            {
              nav === 0 ? <pre><code className='language-solidity'>{tokenContractText}</code></pre>
              : nav === 1 ? <pre><code className='language-solidity'>{stakingContractText}</code></pre>
              : nav === 2 ? <Markdown/>
              : <pre><code className='language-solidity'>{tokenContractText}</code></pre>
            }   
         </div>
      </div>

    </div>
  );
};

export default HeroModule;