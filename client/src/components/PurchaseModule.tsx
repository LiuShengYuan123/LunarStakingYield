import {  Input, Row, Col } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { AccountContext } from '@/context/AccountContext';
import { useConnectModal } from "@rainbow-me/rainbowkit"
import Decimal from 'decimal.js';
import Modal from './Modal'
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 注册 GSAP 插件
gsap.registerPlugin(ScrollTrigger);

const style = {
    wrapper: `min-w-[100vw] h-[80vh] mx-auto flex flex-col justify-center items-center relative overflow-hidden`,
    title: `text-[20] font-normal`,
    areaCommon:`w-[40vw] rounded-2xl p-6 bg-gradient-to-r from-[#03070eb3] to-[#07101fb3] m-1 text-[#f0f0f0] cursor-pointer border border-[#0a182f] transition-all duration-300`,
    areaHover: `w-[40vw] rounded-2xl p-6 bg-gradient-to-r from-[#03070eb3] to-[#0a182fb3] m-1 text-[#f0f0f0] cursor-pointer border border-[#0a182f]  transition-all duration-300 hover:scale-[1.02] hover:shadow-xl transform-gpu will-change-transform`,
    areaBlur:  `w-[40vw] rounded-2xl p-6 bg-gradient-to-r from-[#03070eb3] to-[#03070eb3] m-1 text-[#f0f0f0] cursor-pointer border border-[#0a182f]  transition-all duration-300 [&:active]:scale-95`,
    submitButtonCommon:`w-[40vw] rounded-2xl p-3 bg-gradient-to-br from-[#0a182f] via-[#2d1a45cc] via-45% to-[#fade8e] m-1 text-[#f0f0f0] cursor-pointer border border-[#0a182f] transition-all duration-300 [&:active]:scale-95`,
    submitButtonHover:`w-[40vw] rounded-2xl p-3 bg-gradient-to-r from-[#0a182fb3] to-[#fade8e] m-1 text-[#f0f0f0] cursor-pointer border border-[#0a182f] transition-all duration-300 [&:active]:scale-95 hover:scale-[1.02] hover:shadow-xl transform-gpuwill-change-transform`,
    submitButtonText:`flex justify-center items-center text-[20px] text-white`,
  }


const PurchaseModule = () => {
  const {openConnectModal}:any = useConnectModal()
  const {accountAddress,stakingPoolDetails,purchaseLSY,loadingStates,refreshKey} = useContext(AccountContext);
  const purchaseModuleContainerRef = useRef(null)
  const [areaState,setAreaState] = useState<any>({
    hoverArea:null,
    activeArea:'sell'
  })
  const [inputValue,setInputValue] = useState<any>({
    ethValue:'',
    lsyValue:''
  })

  const {lsy_price} = stakingPoolDetails;
  const {purchaseLSY:isLoading} = loadingStates;
// 处理区域样式
  const getAreaClass = (areaType:string) => {
    let className = style.areaCommon ;
    if(areaState.activeArea == areaType){
        className = style.areaBlur
    }else if(areaState.hoverArea == areaType){
        className = style.areaHover
    }
    return `${className}`
  };
// 处理区域交互状态
  const handleAreaInteraction = (areaType:string,eventType:string) => {
    switch(eventType){
        case 'hover' : setAreaState((prev:any)=>({...prev,hoverArea:areaType})); break;
        case 'leave' : setAreaState((prev:any)=>({...prev,hoverArea:null})); break;
        case 'click' : setAreaState((prev:any)=>({...prev,activeArea:areaType})); break;
    }
  }
  const handleInputChange = (e:any,type:string) => {
    const _inputValue:any = e.target.value;
    if (_inputValue === '') {
      setInputValue({
        ethValue: '',
        lsyValue: '',
      });
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
      if(type == 'eth'){
        setInputValue({
          ethValue:normalizedValue,
          lsyValue:normalizedValue ? new Decimal(normalizedValue).dividedBy(lsy_price).toString() : ''
        });
      }else if(type == 'lsy'){
        setInputValue({
          ethValue:normalizedValue ? new Decimal(normalizedValue).mul(lsy_price).toString() : '',
          lsyValue:normalizedValue,
        });
      }
      
    }
  }
  const submitPurchaseLSY = () => {
    purchaseLSY(inputValue.ethValue)
  }

  // 交易成功后刷新输入框
  useEffect(()=>{
    setInputValue({
      ethValue:'',
      lsyValue:''
    })
  },[refreshKey])

  // 动画效果
  useEffect(()=>{
    const element = purchaseModuleContainerRef.current;
    if(!element) return
    const ctx = gsap.context(()=>{
      gsap.from(element, {
        duration: 1.5,
        opacity: 0,
        scale: 0.8,
        ease: "power4.out",
        scrollTrigger: {
          trigger: element, // 触发元素
          start: "top 40%", // 当元素顶部进入视口80%时开始
          end: "bottom 20%", // 当元素底部离开视口20%时结束
          toggleActions: "play none none reverse", // 触发逻辑：进入视口播放，离开不暂停，重入不重播，反向回滚
        }
      });
    })
    return ()=> ctx.revert()
  },[])


  return (<>
    <div className={style.wrapper} id="purchase-module-container" ref={purchaseModuleContainerRef}>     

      <h1 className='text-5xl font-bold mr-10 my-20  bg-gradient-to-l from-[#f0f0f0] to-[#fade8e] text-transparent bg-clip-text'>Join the Staking Revolution – Get Your First LSY Token!</h1>

      <div className={getAreaClass('sell')}
        onClick={()=>{handleAreaInteraction('sell','click')}}
        onMouseEnter={()=>{handleAreaInteraction('sell','hover')}}
        onMouseLeave={()=>{handleAreaInteraction('sell','leave')}}
      >
        <p className={style.title}>Sell</p>        
        <Row justify="space-between" align="middle" style={{marginBottom:'8px'}}>
          <Col span={20}>
            <Input value={inputValue.ethValue} variant='borderless' style={{fontSize: 36, fontWeight: 500,color:'#fff'}}
              onChange={(e)=>{handleInputChange(e,'eth')}}
            />
          </Col>
          <Col span={4}><Input value="ETH" disabled style={{ fontSize: 20, fontWeight: 500,borderRadius:16,color:'#fff' }}/></Col>
        </Row>
      </div>

      
      <div className={getAreaClass('buy')}
        onClick={()=>{handleAreaInteraction('buy','click')}}
        onMouseEnter={()=>{handleAreaInteraction('buy','hover')}}
        onMouseLeave={()=>{handleAreaInteraction('buy','leave')}}
      >
        <p className={style.title}>Buy</p>        
        <Row justify="space-between" align="middle" style={{marginBottom:'8px'}}>
          <Col span={20}>
            <Input value={inputValue.lsyValue} variant='borderless' style={{ fontSize: 36, fontWeight: 500,color:'#fff'}}
              onChange={(e)=>{handleInputChange(e,'lsy')}}
            />
          </Col>
          <Col span={4}><Input value="LSY" style={{ fontSize: 20, fontWeight: 500,borderRadius:16,color:'#fff' }} disabled/></Col>
        </Row>
      </div>

        {/* 兑换按钮 */}
      <div className={style.submitButtonCommon}>
        <div className={style.submitButtonText} 
          onClick={()=>{
            if(accountAddress==undefined){
              openConnectModal()
              return
            }else if(accountAddress!=undefined && inputValue.ethValue != 0){
              submitPurchaseLSY()
            }else {
              return
            }
          }}
        >
          { 
            accountAddress==undefined ? <p>Connect Wallet</p>
             : inputValue.ethValue != 0 ? <p>Submit</p>
             : <p>Enter amount</p>
          }
        </div>
      </div>
    </div>
    <Modal isLoading={isLoading} parentRef={purchaseModuleContainerRef}/>
  </>);
};


export default PurchaseModule


