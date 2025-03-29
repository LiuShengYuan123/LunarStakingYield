'use client'
import React, { useEffect } from 'react'
import { ConnectButton as WalletConnectButton }  from '@rainbow-me/rainbowkit';
import { Affix,Alert } from 'antd';
import Marquee from 'react-fast-marquee';
const Header = () => {
  const addTokenToWallet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) throw new Error("MetaMask未安装");
  
      const tokenAddress = process.env.NEXT_PUBLIC_LSYTOKEN_ADDRESS;
      const symbol = "LSY"; // 替换为实际代币符号
      const decimals = 18; // 替代为实际代币精度
  
      const added = await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol,
            decimals,
          }
        }
      });
  
      if (added) {
        console.log("代币添加成功");
      } else {
        console.log("用户拒绝添加代币");
      }
    } catch (error) {
      console.error("添加代币失败:", error);
    }
  }


  return (
  <Affix offsetTop={0} style={{position:'fixed',top:0,width:'100%',zIndex:999}}>
    <Alert closable banner style={{backgroundColor:'transparent',color:'#f0f0f0'}}
    message={
      <Marquee pauseOnHover gradient={false} speed={200}>
        💧目前此项目只支持Holesky测试网,点击 
        <a href="https://holesky-faucet.pk910.de/#/" target="_blank" rel="noopener noreferrer" className='mx-2'>这里</a>
        领取测试币💧
        <span className='ml-50'></span>
        💵另外请确保将LSY代币
        <span className='mx-2 text-blue-400 cursor-pointer' onClick={()=>{addTokenToWallet()}}>添加</span> 
        到您的钱包中,💵代币合约地址: 
        <span className='mx-2'>{process.env.NEXT_PUBLIC_LSYTOKEN_ADDRESS}</span> 💵
      </Marquee>
    }
  />
    <div className='w-full px-2 h-16 flex justify-between items-center'>
      <div className='ml-8'>
        <WalletConnectButton/>
      </div>
      <div></div>
    </div>
  </Affix>
  )
}

export default Header