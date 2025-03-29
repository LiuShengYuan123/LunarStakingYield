import Image from 'next/image'
import React ,{ useContext, useEffect, useRef, useState } from 'react'
import { useConnectModal } from "@rainbow-me/rainbowkit"
import {Input} from "antd"
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Modal from './Modal'
import { AccountContext } from '@/context/AccountContext'
import lock from "@/assets/lock.png"
import unlock from "@/assets/unlock.png"


// 注册 GSAP 插件
gsap.registerPlugin(ScrollTrigger);

const style = {
  wrapper:`w-[100vw] h-[100vh] flex flex-row justify-center items-center`,
  container:`min-w-[600px] max-w-[40vw] h-[80vh] my-[10vh] mx-[5vw] p-[5vw] flex flex-col bg-gradient-to-r from-[#03070eb3] to-[#07101fb3] shadow-3lg rounded-2xl relative overflow-hidden`,
  title: `text-[30px] font-normal ml-[1vw]`,
  areaBlur:  `w-full h-1/2 mt-16 rounded-2xl p-6 bg-gradient-to-r from-[#03070eb3] to-[#07101fb3] m-1 text-[#f0f0f0] cursor-pointer border border-[#0a182f]  transition-all duration-300 [&:active]:scale-95`,
  title_detail:`text-[25px] font-normal text-stone-400 my-6`,
  submitButtonCommon:`w-full my-4 rounded-2xl p-3 bg-gradient-to-br from-[#0a182f] via-[#2d1a45cc] via-45% to-[#fade8e] text-[#f0f0f0] cursor-pointer border border-[#0a182f] transition-all duration-300 [&:active]:scale-95`,
  submitButtonHover:`w-full my-4 ml-4 rounded-2xl p-3 bg-gradient-to-r from-[#0a182fb3] to-[#fade8e] m-1 text-[#f0f0f0] cursor-pointer border border-[#0a182f] transition-all duration-300 [&:active]:scale-95 hover:scale-[1.02] hover:shadow-xl transform-gpuwill-change-transform`,
  submitButtonText:`flex justify-center items-center text-[20px] text-white`,
}

const DashboardTitleItem=({title,LSYAmount,ETHAmount,LSYPendingRewards,RewardsPerSec}:any)=>{
  return(
    <div className="max-w-full min-w-full mb-[4vh] rounded-xl text-amber-50">
    <p className="text-xl">{title}</p>
    {
      LSYAmount != undefined ? (
        <p className="text-7xl font-bold mr-10 my-4  text-[#76f3ec]">{Number(LSYAmount).toFixed(4)}<span className='text-sm ml-2 font-normal text-[#fff] opacity-50'>LSY</span></p>
      ) : (
        <p className="text-7xl font-bold mr-10 my-4  bg-gradient-to-l from-[#f0f0f0] to-[#fade8e] text-transparent bg-clip-text">{Number(LSYPendingRewards).toFixed(8)}<span className='text-sm ml-2 font-normal text-[#fff] opacity-50'>LSY</span></p>
      )
    }
    
    {
      LSYAmount != undefined ? (
        <p className="text-sm text-[#fff] opacity-50"> ≈ {ETHAmount} ETH</p>
      ) : (
        <p className="text-sm text-[#fff] opacity-50"> + {RewardsPerSec} LSY per sec</p>
      )
    }
  </div>
  )
}

const StakeModule = () => {
  const {openConnectModal}:any = useConnectModal()
  const {accountAddress,userStakeDetails,stakeLSY,unStakeLSY,claimRewards,loadingStates,refreshKey} = useContext(AccountContext)
  const {balanceOfLSY,balanceOfStakedLSY,balanceOfStakedETH,pendingRewards,rewardsPerSec} = userStakeDetails
  const {approveStakeLSY:approveLoading,stakeLSY:stakeLoading,unStakeLSY:unStakeLoading,claimRewards:claimLoading,} = loadingStates

  const stakeContainerRef = useRef(null)
  const unStakeContainerRef = useRef(null)
  const stakeInputRef = useRef(null)
  const unStakeInputRef = useRef(null)
  const [stakeValue,setStakeValue] = useState<any>()
  const [unStakeValue,setUnStakeValue] = useState<any>()
  const [focusedInput,setFocusedInput] = useState<any>(null)

  useEffect(()=>{
    //确保input框不会在组件更新后丢失焦点
    if(stakeInputRef.current && focusedInput == 'stake'){
      // @ts-ignore
      stakeInputRef.current.focus()
    }
    if(unStakeInputRef.current && focusedInput == 'unStake'){
      // @ts-ignore
      unStakeInputRef.current.focus()
    }
  },[stakeValue,unStakeValue,focusedInput])

  // 交易成功后刷新输入框
  useEffect(()=>{
    setStakeValue('')
    setUnStakeValue('')
  },[refreshKey])

  // GSAP动画效果
  useEffect(()=>{
    const stakeContainer = stakeContainerRef.current
    const unStakeContainer = unStakeContainerRef.current
    const windowWidth = window.innerWidth

    if(!stakeContainer || !unStakeContainer) return;
    // 初始化位置（移动到屏幕外）
    gsap.set(stakeContainer,{x:-windowWidth,opacity:0})
    gsap.set(unStakeContainer,{x:windowWidth,opacity:0})
    // 创建时间轴
    const stakeTimeline = gsap.timeline({
      scrollTrigger:{
        trigger:stakeContainer,
        start:'top 80%',
        end:'bottom 20%',
        toggleActions:'play none none reverse'
      }
    })

    const unStakeTimeline = gsap.timeline({
      scrollTrigger:{
        trigger:unStakeContainer,
        start:'top 80%',
        end:'bottom 20%',
        toggleActions:'play none none reverse'
      }
    })

    stakeTimeline
      .to(stakeContainer,{x:windowWidth*0.005,opacity:1,duration:0.8,ease:'power4.out'})
      .to(stakeContainer,{x:0,duration:0.5,ease:'elastic.out(1,0.3)'})
    unStakeTimeline
      .to(unStakeContainer,{x:-windowWidth*0.005,opacity:1,duration:0.8,ease:'power4.out'})
      .to(unStakeContainer,{x:0,duration:0.5,ease:'elastic.out(1,0.3)'})

    return ()=>{
      stakeTimeline.killTweensOf(stakeContainer)
      unStakeTimeline.kill()
    }
  },[])

  const handleStakeInputChange = (e:any) => {
    const _inputValue:any = e.target.value;
    if (_inputValue === '') {
      setStakeValue('');
      return;
    }
    if (/^\d*\.?\d*$/.test(_inputValue)) {
      let normalizedValue = _inputValue;
      if (/^0\d+$/.test(normalizedValue)) {
        normalizedValue = `0.${normalizedValue.slice(1)}`;
      }
      // 限制小数位数（最多 8 位小数）
      if (normalizedValue.length > 8) {
        normalizedValue = normalizedValue.slice(0,10);
      }
      if (Number(normalizedValue) > Number(balanceOfLSY)){
        setStakeValue(balanceOfLSY)
        return
      }
      setStakeValue(normalizedValue)
    }
  }

  const handleUnStakeInputChange = (e:any) => {
    const _inputValue:any = e.target.value;
    if (_inputValue === '') {
      setUnStakeValue('');
      return;
    }
    if (/^\d*\.?\d*$/.test(_inputValue)) {
      let normalizedValue = _inputValue;
      if (/^0\d+$/.test(normalizedValue)) {
        normalizedValue = `0.${normalizedValue.slice(1)}`;
      }
      // 限制小数位数（最多 8 位小数）
      if (normalizedValue.length > 8) {
        normalizedValue = normalizedValue.slice(0,10);
      }
      if (Number(normalizedValue) > Number(balanceOfStakedLSY)){
        setUnStakeValue(balanceOfStakedLSY)
        return
      }
      setUnStakeValue(normalizedValue)
    }
  }

  const submitStake = () =>{
    if(accountAddress==undefined){
      openConnectModal()
      return
    }else if(accountAddress!=undefined && stakeValue != 0){
      if(!stakeValue) return;
      stakeLSY(stakeValue)
    }
  }

  const submitUnStake = () =>{
    if(accountAddress==undefined){
      openConnectModal()
      return
    }else if(accountAddress!=undefined && unStakeValue != 0){
      if(!unStakeValue) return;
      unStakeLSY(unStakeValue)
    }
  }
  const submitClaim = () =>{
    if(accountAddress==undefined){
      openConnectModal()
      return
    }else if(accountAddress!=undefined){
      claimRewards()
    }
  }


const Stake = () =>{
  return(<>
    <div className={style.areaBlur}>
      <div className='flex items-center'>
        <Image src={lock} alt='image' width={30} height={30} className='inline center'/>
        <p className={style.title}>Stake LSY</p>   
      </div>
      <div className='flex flex-row my-10'>
        <Input style={{fontSize: 40, fontWeight: 500,color:'#fff',border:'1px solid #fff',borderRadius:16}} variant='borderless' 
          ref={stakeInputRef}
          value={stakeValue} 
          onChange={(e)=>{handleStakeInputChange(e)}}
          onFocus={()=>{setFocusedInput('stake')}}
        />
        <Input value="LSY" disabled style={{ width:90,marginLeft:'50px',fontSize: 30, fontWeight: 500,borderRadius:16,color:'#fff' }}/>
      </div>
      <p className={style.title_detail}>Available：
        <span className='text-[#fff] mr-2'>{balanceOfLSY}</span> 
        LSY
      </p>
    </div>
    <div className={style.submitButtonCommon} onClick={()=>{submitStake()}}>
      <div className={style.submitButtonText}>
        { 
        accountAddress==undefined ? <p>Connect Wallet</p>
          : stakeValue != 0 ? <p>Stake</p>
          : <p>Enter amount</p>
        }
      </div>
    </div>
  </>)
}

const Unstake = () =>{
  return(<>
    <div className={style.areaBlur}>
      <div className='flex items-center'>
        <Image src={unlock} alt='image' width={30} height={30} className='inline center'/>
        <p className={style.title}>Unstake & Claim</p>   
      </div>
      <div className='flex flex-row my-10'>
        <Input variant='borderless' style={{fontSize: 40, fontWeight: 500,color:'#fff',border:'1px solid #fff',borderRadius:16}}
          ref={unStakeInputRef}
          value={unStakeValue}  
          onChange={(e)=>{handleUnStakeInputChange(e)}}
          onFocus={()=>{setFocusedInput('unStake')}}
        />
        <Input value="LSY" disabled style={{ width:90,marginLeft:'50px',fontSize: 30, fontWeight: 500,borderRadius:16,color:'#fff' }}/>
      </div>
      <p className={style.title_detail}>Staked：
        <span className='text-[#fff] mr-2'>{balanceOfStakedLSY}</span>
        LSY
      </p>
    </div>
    <div className='flex flex-row'>
    <div className={style.submitButtonCommon} onClick={()=>{submitUnStake()}}>
      <div className={style.submitButtonText}>
        { 
        accountAddress==undefined ? <p>Connect Wallet</p>
          : unStakeValue != 0 ? <p>UnStake</p>
          : <p>Enter amount</p>
        }
      </div>
    </div>
    <div className={style.submitButtonHover} onClick={()=>{submitClaim()}}>
      <div className={style.submitButtonText}>
        { accountAddress==undefined ? <p>Connect Wallet</p> : <p>Claim</p> }
      </div>
    </div>
    </div>
  </>)
}
  
  return (<>
    <div className={style.wrapper}>
      <div className={style.container} ref={stakeContainerRef}>
        <DashboardTitleItem title="Your Staked LSY" LSYAmount={balanceOfStakedLSY} ETHAmount={balanceOfStakedETH}/>
        <Stake/>

      </div>
      <div className={style.container} ref={unStakeContainerRef}>
        <DashboardTitleItem title="Pending Rewards" LSYPendingRewards={pendingRewards} RewardsPerSec={rewardsPerSec}/>
        <Unstake/>
      </div>
    </div>

  <Modal isLoading={approveLoading || stakeLoading} parentRef={stakeContainerRef}/>  
  <Modal isLoading={unStakeLoading || claimLoading} parentRef={unStakeContainerRef}/>  
  </>)
}

export default StakeModule