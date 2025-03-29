import LSYTokenABI from "../abis/LSYToken.json";
import StakingABI from "../abis/Staking.json";

export const LSYTokenContractConfig = {
  address: process.env.NEXT_PUBLIC_LSYTOKEN_ADDRESS as `0x${string}`,
  abi: LSYTokenABI.abi,
};

export const StakingContractConfig = {
  address: process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`,
  abi: StakingABI.abi,
};

