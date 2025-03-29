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
