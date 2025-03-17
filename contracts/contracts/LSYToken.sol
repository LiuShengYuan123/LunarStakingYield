// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LSYToken is ERC20, ERC20Permit, Ownable, ReentrancyGuard {
    uint256 public constant TOTAL_SUPPLY = 10000000 * 10 ** 18;
    uint256 public constant TOKEN_PRICE = 0.00001 * 10 ** 18;

    address public stakingPool;

    constructor()
        ERC20("LuckyStakingYield", "LSY")
        ERC20Permit("LuckyStakingYield")
        Ownable(msg.sender)
    {
        _mint(owner(), TOTAL_SUPPLY / 2);
    }

    // 自动铸造50%代币给LSYStaking Contract Address（质押合约首次部署时）
    function registerStakingPool(address stakingContract) external {
        require(stakingPool == address(0), "Already initialized");
        stakingPool = stakingContract;
        _mint(stakingPool, TOTAL_SUPPLY / 2); // 铸造剩余50%
    }

    function purchaseLSY() external payable nonReentrant {
        require(msg.value > 0, "Insufficient ETH amount");
        _transfer(owner(), msg.sender, msg.value);
        payable(owner()).transfer(msg.value);
    }
}
