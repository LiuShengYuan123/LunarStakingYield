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
        _mint(owner(), TOTAL_SUPPLY / 2);
    }

    // 自动铸造50%代币给LSYStaking Contract Address（质押合约首次部署时）
    function registerStakingPool(address stakingContract) external {
        require(stakingPool == address(0), "Already initialized");
        stakingPool = stakingContract;
        _mint(stakingPool, TOTAL_SUPPLY / 2);
    }

    function purchaseLSY() external payable nonReentrant {
        require(msg.value > 0, "Insufficient ETH amount");
        uint256 tokensToTransfer = (msg.value / TOKEN_PRICE) * 10 ** DECIMALS;
        _transfer(owner(), msg.sender, tokensToTransfer);
        payable(owner()).transfer(msg.value);
    }
}
