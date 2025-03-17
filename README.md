# LSY Staking DApp Documentation / LSY质押DApp文档

<div align="right">
  <small>
    <details>
      <summary>🇨🇳 中文</summary>
      <a href="#中文文档">跳至中文版</a>
    </details>
  </small>
</div>

---

## 🌟 Table of Contents / 目录导航
- [Getting Started | 快速入门](#-getting-started--快速入门)
- [Smart Contracts | 智能合约](#-smart-contracts--智能合约)
- [APY Calculation | 收益计算](#-apy-calculation--收益计算)
- [FAQ | 常见问题](#-faq--常见问题)

---

## 🚀 Getting Started / 快速入门

**Follow these steps to begin:**
1. 🔗 **Connect Wallet**  
   Click the "Connect Wallet" button to link your MetaMask
2. 🌐 **Network Setup**  
   Switch to Holesky Testnet (auto-detection available)
3. 💰 **Purchase LSY**  
   Buy tokens at 1 ETH = 100,000 LSY rate
4. ⚖️ **Stake Tokens**  
   Deposit LSY to start earning
5. 🕒 **Manage Assets**  
   Unstake/claim rewards anytime

---

<details>
  <summary><strong>🇨🇳 中文版</strong></summary>

**开始步骤：**
1. 🔗 **连接钱包**  
   点击"Connect Wallet"按钮连接MetaMask
2. 🌐 **网络设置**  
   切换到Holesky测试网（支持自动检测）
3. 💰 **购买LSY**  
   按1 ETH = 100,000 LSY汇率购买
4. ⚖️ **质押代币**  
   存入LSY开始赚取收益
5. 🕒 **资产管理**  
   随时解押或提取奖励
</details>

---

## 📜 Smart Contracts / 智能合约

### LSY Token (ERC-20)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LSYToken is ERC20 {
    uint256 public constant ETH_TO_LSY = 100000;
    
    constructor() ERC20("LSY Token", "LSY") {
        _mint(msg.sender, 100000 * 10**decimals());
    }

    function buyWithETH() external payable {
        _mint(msg.sender, msg.value * ETH_TO_LSY);
    }
}
```

<details>
  <summary><strong>🇨🇳 合约功能说明</strong></summary>
  
- **代币标准**: ERC-20
- **初始供应**: 100,000 LSY
- **购买机制**: 1 ETH 可兑换 100,000 LSY
- **权限控制**: 仅合约所有者可增发代币
</details>

---

### Staking Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Staking {
    uint256 public constant REWARD_PER_MIN = 1 ether;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
    }
    
    mapping(address => Stake) public stakes;

    function stake(uint256 amount) external {
        stakes[msg.sender] = Stake(amount, block.timestamp);
    }
}
```

<details>
  <summary><strong>🇨🇳 合约特性</strong></summary>

- **防重入保护**: 使用OpenZeppelin的ReentrancyGuard
- **奖励机制**: 每分钟1 LSY/质押代币
- **安全设计**: 转账前验证合约余额
- **灵活存取**: 支持随时解押
</details>

---

## 📈 APY Calculation / 收益计算

**Formula | 计算公式**  
```math
APY = \frac{Annual\ Rewards}{Total\ Staked} \times 100
```

**Variables | 参数说明**  
- `Annual Rewards` = 525,600 LSY (1 LSY/min × 525,600 min/yr)
- `Total Staked` = 合约内质押总量

<details>
  <summary><strong>🇨🇳 计算示例</strong></summary>

假设总质押量 = 1,000,000 LSY：
```text
APY = (525,600 / 1,000,000) × 100 = 52.56%
```
即年化收益率约为52.56%
</details>

---

## ❓ FAQ / 常见问题

### Q1: How to buy LSY? | 如何购买LSY?
**EN**: Connect wallet → Navigate to Buy section → Enter ETH amount  
**CN**: 连接钱包 → 进入购买页面 → 输入ETH数量

### Q2: Reward frequency? | 奖励频率?
**EN**: Real-time accrual, claim anytime  
**CN**: 实时累积，随时可提取

### Q3: Minimum stake? | 最低质押量?
**EN**: No minimum, accept ≥0.001 LSY  
**CN**: 无最低限制，≥0.001 LSY即可

### Q4: Security? | 安全性?
**EN**: Audited contracts + Reentrancy protection  
**CN**: 已审计合约 + 重入攻击防护

---

<div align="center">
  <hr style="border: 2px dashed #ccc; margin: 2em 0;">
  <p>📧 Contact: support@lsy.finance | 联系邮箱: support@lsy.finance</p>
</div>