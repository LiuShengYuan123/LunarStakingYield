'use client'
import React from 'react'
import Image from 'next/image'

import price from "@/assets/price.png"
import apy from "@/assets/apy.png"
import transaction from "@/assets/transaction.png"
import user from "@/assets/user.png"


// detail_items_container
// detail_item

// dashboard_container
// dashboard_title_items_container
// dashboard_title_item
// dashboard_detail_items_container
// dashboard_detail_item

const DetailItem = ({image,title,number}) => {
  return (
    <div className='p-3 min-w-1/5 bg-[#F0F2F5] rounded-xl shadow-lg'>
    <div className="flex items-center">
      <div className="w-8 h-8  rounded">
        <Image src={image} alt="image" width={32} height={32} />
      </div>
        <div className="ml-3">
          <p className="text-sm text-gray-900">{title}</p>
          <p className="text-lg font-bold text-black">{number}</p>
        </div>
    </div>
  </div>
  )
}

const DashboardTitleItem=({title,LSYAmount,LSYPendingRewards})=>{
  return(
    <div className="p-4 max-w-1/4 min-w-1/4 bg-[#FFFFFF] rounded-xl">
    <p className="text-sm">{title}</p>
    <p className="text-2xl font-bold">{LSYAmount | LSYPendingRewards}<span className='text-sm m-1'>LSY</span></p>
    {
      LSYAmount != undefined ? (
        <p className="text-sm">≈ {(LSYAmount * 0.00001).toFixed(5)} ETH</p>
      ) : (
        <p className="text-sm">+ {LSYPendingRewards} LSY per sec</p>
      )
    }
  </div>
  )
}

const DashboardDetailItem=()=>{

}


const Body = () => {
  return (
    <div className='w-full max-h-10/12 min-h-10/12 flex flex-col bg-[#FFFFFF]'>

      <div className='w-full max-h-2/12 min-h-2/12 flex flex-row justify-between items-center bg-[#FFFFFF]'>
        <DetailItem image={price} title="LSY Price" number="0.00001 ETH"/>
        <DetailItem image={apy} title="APY" number="0%"/>
        <DetailItem image={transaction} title="Total Staked" number="5000000 LSY"/>
        <DetailItem image={user} title="Total Stakers" number="1"/>
      </div>


      <div className="w-full max-h-10/12 min-h-10/12 mb-2 flex flex-col justify-around items-center rounded-xl bg-[#F0F2F5] shadow-lg">

        <div className='w-full max-h-1/3 min-h-1/3 flex flex-row justify-around items-center'>
          <DashboardTitleItem title="Your LSY Balance" LSYAmount={0} />
          <DashboardTitleItem title="Your Staked LSY" LSYAmount={0} />
          <DashboardTitleItem title="Pending Rewards" LSYPendingRewards={0} />
        </div>

        <div className='w-full max-h-2/3 min-h-2/3 flex flex-row justify-around items-center bg-[#F0F2F5]'>
          {/* 买LSY卡片 */}
          <div className="p-4 max-w-1/4 min-w-1/4 h-3/4 bg-[#FFFFFF] rounded-xl  ">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-[#5e6dff] rounded"></div>
              <h3 className="ml-2 text-xl font-bold">Buy LSY</h3>
            </div>
            <p className="text-sm mb-4">Purchase LSY tokens with ETH at a rate of 10,000 LSY per ETH.</p>
            <div className="flex items-center mb-4">
              <span className="w-full mr-2 p-2 bg-[#E4E7EB] rounded">
                <input type="text" placeholder="0.0" className="w-full h-full" />
              </span>
              
              <span className="w-16 p-2 bg-[#E4E7EB] rounded">ETH</span>
            </div>
            <p className="text-sm mb-4">You will receive: 0 LSY</p>
            <button className="w-full p-2 bg-[#5e6dff] rounded">Buy LSY</button>
          </div>
          {/* 质押LSY卡片 */}
          <div className="p-4 max-w-1/4 min-w-1/4 h-3/4 bg-[#FFFFFF] rounded-xl  ">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-[#5e6dff] rounded"></div>
              <h3 className="ml-2 text-xl font-bold">Stake LSY</h3>
            </div>
            <p className="text-sm mb-4">Stake your LSY to earn rewards at 1 LSY per sec.</p>
            <div className="flex items-center mb-4">
              <span className="w-full mr-2 p-2 bg-[#E4E7EB] rounded">
                <input type="text" placeholder="0.0" className="w-2/3 h-full" />
                <span className="w-2/3 text-sm text-[#5e6dff] rounded">MAX</span>
              </span>
              <span className="w-16 p-2 bg-[#E4E7EB] rounded">LSY</span>
            </div>
            <p className="text-sm mb-4">Available: 0 LSY</p>
            <button className="w-full p-2 bg-[#5e6dff] rounded">Stake LSY</button>
          </div>
          {/* 领取LSY卡片 */}
          <div className="p-4 max-w-1/4 min-w-1/4 h-3/4 bg-[#FFFFFF] rounded-xl  ">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-[#5e6dff] rounded"></div>
              <h3 className="ml-2 text-xl font-bold">Stake LSY</h3>
            </div>
            <p className="text-sm mb-4">Stake your LSY to earn rewards at 1 LSY per sec.</p>
            <div className="flex items-center mb-4">
              <span className="w-full mr-2 p-2 bg-[#E4E7EB] rounded">
                <input type="text" placeholder="0.0" className="w-2/3 h-full" />
                <span className="w-2/3 text-sm text-[#5e6dff] rounded">MAX</span>
              </span>
              <span className="w-16 p-2 bg-[#E4E7EB] rounded">LSY</span>
            </div>
            <p className="text-sm mb-4">Available: 0 LSY</p>
              <button className="w-3/7 p-2 m-2 bg-[#5e6dff] rounded">Unstake</button>
              <button className="w-3/7 p-2 m-2 bg-[#E4E7EB] rounded">Claim Only</button>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Body