'use client'
import React from 'react'
import { ConnectButton as WalletConnectButton }  from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <div className='w-full px-2 h-16 flex justify-between items-center bg-[#F0F2F5]'>
      <div>Header</div>
      <WalletConnectButton/>
    </div>
    
  )
}

export default Header