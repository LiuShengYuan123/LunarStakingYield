'use client'
import React, { useContext, useEffect, useRef } from "react";
import gsap from "gsap";
import { AccountContext } from "@/context/AccountContext";
import Image from "next/image";
import price from "@/assets/price.png"
import apy from "@/assets/apy.png"
import transaction from "@/assets/transaction.png"
import user from "@/assets/user.png"


const style = {
  areaCommon: `min-w-[400px] max-w-[300px] min-h-[230px] max-h-[230px] m-2 flex flex-col justify-between rounded-2xl p-10 `,
  stakingPoolModule_container: `min-w-[1400px] h-[80vh] my-[20vh] mx-[10vw] p-[5vw] flex flex-row bg-gradient-to-r from-[#03070eb3] to-[#07101fb3] shadow-3lg rounded-2xl`,
  stakingPoolModule_info:`flex-1/2 min-w-[35vw] mr-4 flex flex-col justify-around `,
  stakingPoolModule_info_title:`text-5xl font-extrabold text-white mt-16`,
  stakingPoolModule_info_desc:`text-xl text-white mb-8`,
  stakingPoolModule_details:`flex-1/2 ml-4`,
  stakingPoolModule_details_container:`w-full h-full m-auto p-auto flex flex-col`
};

const StakingPoolDetails = ({ title, describe, img }:any) => {
  return (
    <div className={style.areaCommon}>
      <div className="metric-title text-2xl font-orbitron text-white uppercase tracking-wider flex flex-row items-center">
        {describe}
        <Image src={img} alt="image" width={30} height={30}/>
      </div>
      <div className="metric-value text-4xl font-bold text-white mb">
        {title}
      </div>
    </div>
  );
};

const StakingPoolModule = () => {
    
  const {stakingPoolDetails} = useContext(AccountContext);
  const {lsy_price,_apy,total_staked,total_stakers} = stakingPoolDetails;
  const container = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const rightSectionRef = useRef(null);

  //动画效果
  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top 100%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });
  
      timeline
        .fromTo(container.current,
          { opacity: 0, y: 100, x: 100 },
          { opacity: 1, y: 0, x: 0, duration: 0.5 }, 0)
        .fromTo(titleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.5 }, 0.5)
        .fromTo(descRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 }, 1)
        .fromTo(rightSectionRef.current,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 0.5 }, 1.5);
  
    }, container);
  
    return () => ctx.revert();
  }, []);

  return (
    <div id="stakingPoolModule_container" className={style.stakingPoolModule_container} ref={container}>
      {/* 左侧内容 */}
      <div id="stakingPoolModule_info" className={style.stakingPoolModule_info}>
        <div id="stakingPoolModule_info_title" className={style.stakingPoolModule_info_title} ref={titleRef}>
          功能全面的质押池，开启收益新征程
        </div>
        <div className={style.stakingPoolModule_info_desc} ref={descRef}>
          我们的质押池提供安全、高效、灵活的质押服务。支持多种热门资产质押，实时计算收益，让你的资产稳定增值。在去中心化的浪潮中，我们的质押池采用先进的智能合约技术，确保每一笔交易都公开透明、不可篡改。通过深度集成跨链协议，打破资产壁垒，实现多链资产的自由流通与质押，为你解锁更多潜在价值。
        </div>
      </div>
      {/* 右侧内容 */}
      <div id="stakingPoolModule_details" className={style.stakingPoolModule_details} ref={rightSectionRef}>
        {/* 标题部分 */}
        <div id="stakingPoolModule_details_container" className={style.stakingPoolModule_details_container}>
          <div className="flex flex-row">
            <StakingPoolDetails title={`${lsy_price} ETH`} describe="LSY PRICE" img={price} />
            <StakingPoolDetails title={`${_apy} %`} describe="APY" img={apy} />
          </div>
          <div className="flex flex-row">
            <StakingPoolDetails title={`${Number(total_staked).toFixed(0)} LSY`} describe="Total Staked" img={transaction} />
            <StakingPoolDetails title={total_stakers} describe="Total Stakers" img={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingPoolModule;
