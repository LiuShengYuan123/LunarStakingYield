import React, { use, useEffect, useState } from "react";

import { useReadContract, useWriteContract ,useAccount, useAccountEffect } from "wagmi";
import { holesky } from "wagmi/chains"
import { LSYTokenContractConfig,StakingContractConfig } from "@/lib/contracts/wagmiContractConfig";

const AccountContext = React.createContext("AccountContext");

export const AccountProvider = ({children}: {children: React.ReactNode}) => {
  const account = useAccount();
  const { writeContract } = useWriteContract()
  const [accountAddress, setAccountAddress] = useState<string | undefined>(undefined);

  const { data , error , isPending} : any =  useReadContract({
    address:StakingContractConfig.address,
    abi:StakingContractConfig.abi,
    functionName: "getStakingPoolDetails",
  }) 


  // const { data , error , isPending} : any =  useReadContract({
  //   address:LSYTokenContractConfig.address,
  //   abi:LSYTokenContractConfig.abi,
  //   functionName: "balanceOf",
  //   args: ["0xD32315d3B2e29338aeb0687B6961f3180bc14a2A"],
  // }) 

  if(!isPending){
    console.log('pending结束了...✔')
  }
  if(error){
    console.log('报错了...❌',error)
  }else{
    console.log('data✔',data)
  }

  useEffect(() => {
    if (account.status != "connected") return;
    setAccountAddress(account?.address);
    // console.log('合约要开始执行了😈')
  }, [account]);



  return (
    <AccountContext.Provider value={accountAddress}>
      {children}
    </AccountContext.Provider>
  );
};
