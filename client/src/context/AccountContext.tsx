import React, { useEffect, useState } from "react";
import { Decimal } from 'decimal.js'
import { Address, formatUnits } from "viem";
import { useConfig,useReadContract, useWriteContract , useAccount,useAccountEffect } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { LSYTokenContractConfig,StakingContractConfig } from "@/lib/contracts/wagmiContractConfig";

export const AccountContext = React.createContext<any>("AccountContext");

export const AccountProvider = ({children}: {children: React.ReactNode}) => {
  const account = useAccount();
  const wagmiConfig = useConfig()
  const { writeContractAsync } = useWriteContract()
  const [accountAddress, setAccountAddress] = useState<string | undefined>(undefined);
  const [refreshKey,setRefreshKey] = useState(0)
  const [loadingStates,setLoadingStates] = useState({
    purchaseLSY:false,
    approveStakeLSY:false,
    stakeLSY:false,
    unStakeLSY:false,
    claimRewards:false,
  })
  const [stakingPoolDetails,setStakingPoolDetails] = useState<any|undefined>({
    lsy_price : 0,
    _apy : 0,
    total_staked : 0,
    total_stakers : 0,
  })
  const [userStakeDetails,setUserStakeDetails] = useState<any|undefined>({
    balanceOfLSY: 0,
    balanceOfETH: 0,
    balanceOfStakedLSY: 0,
    balanceOfStakedETH: 0,
    pendingRewards: 0,
    rewardsPerSec: 0,
    lastUpdateTime: 0,
  })
  const decimals = 18;
  


  useAccountEffect({
    onConnect(data) {
      console.log('钱包连接了!')
    },
    onDisconnect() {
      setAccountAddress(undefined)
      console.log('钱包断开了!',accountAddress)
    },
  })

  const getStakingPoolDetails : any =  useReadContract({
    address:StakingContractConfig.address,
    abi:StakingContractConfig.abi,
    functionName: "getStakingPoolDetails",
  }) 

  const getUserStakeDetails : any =  useReadContract({
    address:StakingContractConfig.address ,
    abi:StakingContractConfig.abi,
    functionName: "getUserStakeDetails",
    args:[accountAddress!],
    query:{
      enabled:Boolean(accountAddress),//当有地址时才执行
      gcTime:0
    }
  }) 

  // 封装等待交易上链函数（触发交易成功刷新数据）
  const useWaitForTransactionReceipt = async (txHash:Address) => {
    const receipt = await waitForTransactionReceipt(wagmiConfig,{hash:txHash})
    if (receipt.status == 'success'){
      setRefreshKey(prev => prev + 1)
    }
    return receipt
  }

  // 购买 LSY
  const purchaseLSY = async(amount:number) =>{
    const value = BigInt(amount * 10**18)
    setLoadingStates(prev => ({...prev,purchaseLSY:true}))
    try {
      const txHash = await writeContractAsync({
        address:LSYTokenContractConfig.address,
        abi:LSYTokenContractConfig.abi,
        functionName: "purchaseLSY",
        value:value
      })
      //钱包未通过授权
      if(!txHash){
        console.log('购买失败')
        setLoadingStates(prev => ({...prev,purchaseLSY:false}))
        return
      }
      const {transactionHash,status}  = await useWaitForTransactionReceipt(txHash)
      if (status == 'success') {
        console.log('purchaseLSY已被区块链确认，txHash：',transactionHash)
        setLoadingStates(prev => ({...prev,purchaseLSY:false}))
      } else {
        console.log('purchaseLSY未被区块链确认，txHash：:',transactionHash)
        setLoadingStates(prev => ({...prev,purchaseLSY:false}))
      }
    } catch (error) {
      console.log('购买失败:',error)
      setLoadingStates(prev => ({...prev,purchaseLSY:false}))
    } finally {
      setLoadingStates(prev => ({...prev,purchaseLSY:false}))
    }
}
  // 授权 合约池操作当前用户的 ETH
  const approveStakeLSY = async (value:bigint) =>{
    setLoadingStates(prev => ({...prev,approveStakeLSY:true}))
    try {
      const txHash = await writeContractAsync({
        address:LSYTokenContractConfig.address,
        abi:LSYTokenContractConfig.abi,
        functionName: "approve",
        args:[StakingContractConfig.address,value]
      })

      if (!txHash) {
        console.log('批准失败')
        setLoadingStates(prev => ({...prev,approveStakeLSY:false}))
        return false
      }

      const {transactionHash,status}  = await useWaitForTransactionReceipt(txHash)    
      console.log('status',status)

      if (status == 'success') {
        console.log('approveStakeLSY函数执行完毕，txHash：',transactionHash)
        setLoadingStates(prev => ({...prev,approveStakeLSY:false}))
        return true
      } else {
        console.log('approveStakeLSY交易未被区块链确认:',transactionHash)
        setLoadingStates(prev => ({...prev,approveStakeLSY:false}))
        return false
      }

    } catch (error) {
      console.log('批准失败:',error)
      setLoadingStates(prev => ({...prev,approveStakeLSY:false}))
    } finally {
      setLoadingStates(prev => ({...prev,approveStakeLSY:false}))
    }
  }
  // 质押 LSY
  const stakeLSY = async(amount:number) =>{
    const value = BigInt(amount * 10**18);
    setLoadingStates(prev => ({...prev,stakeLSY:true}))
    try {
      const isApprove = await approveStakeLSY(value)
      if(!isApprove){
        setLoadingStates(prev => ({...prev,stakeLSY:false}))
        console.log('批准未通过，无法质押')
        return
      }
      const txHash = await writeContractAsync({
        address:StakingContractConfig.address,
        abi:StakingContractConfig.abi,
        functionName: "stakeLSY",
        args:[value]
      })
      if(!txHash){
        console.log('批准失败')
        setLoadingStates(prev => ({...prev,stakeLSY:false}))
        return false
      }
      const {transactionHash,status}  = await useWaitForTransactionReceipt(txHash)    
      console.log('status',status)

      if (status == 'success') {
        console.log('stakeLSY函数执行完毕，txHash：',transactionHash)
        setLoadingStates(prev => ({...prev,stakeLSY:false}))
      } else {
        console.log('stakeLSY交易未被区块链确认:',transactionHash)
        setLoadingStates(prev => ({...prev,stakeLSY:false}))
      }

      console.log('质押成功,txHash:',txHash)
    } catch (error) {
      console.log('质押失败:',error)
      setLoadingStates(prev => ({...prev,stakeLSY:false}))
    }finally {
      setLoadingStates(prev => ({...prev,stakeLSY:false}))
    }
  }
  // 解押 LSY
  const unStakeLSY = async(amount:number) => {
    const amountWei = BigInt(amount * 10**18);
    setLoadingStates(prev => ({...prev,unStakeLSY:true}))
    try {
      const txHash = await writeContractAsync({
        address:StakingContractConfig.address,
        abi:StakingContractConfig.abi,
        functionName: "unstakeLSY",
        args:[amountWei]
      })
      if(!txHash){
        console.log('解押失败')
        setLoadingStates(prev => ({...prev,unStakeLSY:false}))
        return
      }
      const {transactionHash,status}  = await useWaitForTransactionReceipt(txHash)

      if(status == 'success'){
        console.log('解押成功,txHash:',transactionHash)
        setLoadingStates(prev => ({...prev,unStakeLSY:false}))
      }else{
        console.log('解押失败,txHash:',transactionHash)
        setLoadingStates(prev => ({...prev,unStakeLSY:false}))
      }

    } catch (error) {
      console.log('解押失败:',error)
      setLoadingStates(prev => ({...prev,unStakeLSY:false}))
    } finally {
      setLoadingStates(prev => ({...prev,unStakeLSY:false}))
    }
  }

  const claimRewards = async() => {
    setLoadingStates(prev => ({...prev,claimRewards:true}))
    try {
      const txHash = await writeContractAsync({
        address:StakingContractConfig.address,
        abi:StakingContractConfig.abi,
        functionName: "claimRewards",
      })
      if(!txHash){
        console.log('领取失败')
        setLoadingStates(prev => ({...prev,claimRewards:false}))
        return
      }
      const {transactionHash,status}  = await useWaitForTransactionReceipt(txHash)
      if(status == 'success'){
        console.log('领取成功,txHash:',transactionHash)
        setLoadingStates(prev => ({...prev,claimRewards:false}))
      }else{
        console.log('领取失败,txHash:',transactionHash)
        setLoadingStates(prev => ({...prev,claimRewards:false}))
      }
    } catch (error) {
      console.log('领取失败:',error)
      setLoadingStates(prev => ({...prev,claimRewards:false}))
    } finally {
      setLoadingStates(prev => ({...prev,claimRewards:false}))
    }

  }

  //链接账户
  useEffect(() => {
    const { status, address } = account
    if (status === "connected" && address !== accountAddress) {
      console.log('账户连接了')
      setAccountAddress(address)
    }
  }, [account.status,account.address,accountAddress]);

  //获取质押池信息
  useEffect(()=>{
    const { data,isSuccess} = getStakingPoolDetails
    if(!isSuccess) return;
      const _stakingPoolDetails = data
      setStakingPoolDetails({
        lsy_price : Number(formatUnits(_stakingPoolDetails.tokenPrice,decimals)), // LSY单价(wei)  
        _apy : Number(formatUnits(_stakingPoolDetails.rewardRate,decimals)) * 100,
        total_staked : formatUnits(_stakingPoolDetails.totalStakedAmount,decimals),
        total_stakers : Number(_stakingPoolDetails.totalUniqueStakers),
      })

  },[getStakingPoolDetails.data,getStakingPoolDetails.isSuccess,loadingStates])

  // 获取用户质押信息
  useEffect(()=>{
    if(accountAddress == undefined) return;
    const { data , isPending ,isSuccess } = getUserStakeDetails
    if(isPending) return;
    if(isSuccess){      
    const _userStakeDetails = data
    setUserStakeDetails({
      balanceOfLSY: formatUnits(_userStakeDetails.balanceOf,decimals).toString(),
      balanceOfETH: (new Decimal(Number(formatUnits(_userStakeDetails.balanceOf,decimals))).mul(stakingPoolDetails?.lsy_price)).toString(),
      balanceOfStakedLSY: formatUnits(_userStakeDetails.totalAmount,decimals).toString(),
      balanceOfStakedETH: (new Decimal(Number(formatUnits(_userStakeDetails.totalAmount,decimals))).mul(stakingPoolDetails?.lsy_price)).toString(),
      pendingRewards: formatUnits(_userStakeDetails.pendingRewards,decimals).toString(),
      rewardsPerSec: formatUnits(_userStakeDetails.rewardsPerSec,decimals).toString(),
      lastUpdateTime: Number(_userStakeDetails.lastUpdateTime).toString(),
    })
    }
  },[getUserStakeDetails.data,getUserStakeDetails.isSuccess,loadingStates])

  // 交易成功后刷新数据
  useEffect(()=>{
    getStakingPoolDetails.refetch?.()
    getUserStakeDetails.refetch?.()
  },[refreshKey])

  return (
    <AccountContext.Provider 
      value={{
        accountAddress,
        stakingPoolDetails,
        userStakeDetails,
        purchaseLSY,
        stakeLSY,
        unStakeLSY,
        claimRewards,
        loadingStates,
        refreshKey
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
