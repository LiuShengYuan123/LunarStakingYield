import LSYTokenABI from "../abis/LSYToken.json";
import StakingABI from "../abis/Staking.json";

export const LSYTokenContractConfig = {
  address: process.env.NEXT_PUBLIC_LSYTOKEN_ADDRESS,
  abi: LSYTokenABI.abi,
};

export const StakingContractConfig = {
  address: process.env.NEXT_PUBLIC_STAKING_ADDRESS,
  abi: StakingABI.abi,
};

