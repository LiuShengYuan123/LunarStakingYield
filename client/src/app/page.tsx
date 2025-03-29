"use client";
import React, { Suspense } from "react";
// 同步导入首屏必要组件
import Header from "@/components/Header";
import HeroModule from "@/components/HeroModule";
import StarryBackground from "@/components/StarryBackground";

// 懒加载非首屏组件
const PurchaseModule = React.lazy(() => import("@/components/PurchaseModule"))
const StakingPoolModule = React.lazy(() => import("@/components/StakingPoolModule"))
const StakeModule = React.lazy(() => import("@/components/StakeModule"))

const Main = () => {
  return (
    <div className="app-container">
      <StarryBackground />  {/* 星星背景 */}
      <Header />            {/* 钱包 */}
      <HeroModule />        {/* 首页展示 */}


      <Suspense fallback={<div className="text-[#f0f0f0]">Loading...</div>}>
        <PurchaseModule />    {/* 购买模块 */}
        <StakingPoolModule /> {/* 质押池详情模块 */}
        <StakeModule />       {/* 质押模块 */}
      </Suspense>
      
    </div>
  );
};
export default Main;
