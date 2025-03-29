import React from 'react'


const style = {
  star:`absolute w-[2px] h-[2px] bg-white/80`,
  starryBackground:`fixed top-0 left-0 w-full h-full -z-10 pointer-events-none`
}

const StarryBackground = () => {
  return (
    <div className={style.starryBackground}>
    {/* 用CSS生成星星 */}
    {[...Array(200)].map((_, i) => (
      <div
        key={i}
        className={style.star}
        style={{
          animation:`twinkle 1s infinite alternate`,
          left: `${Math.random() * 200}vw`,
          top: `${Math.random() * 200}vh`,
          animationDelay: `${Math.random() * 1}s`,
        }}
      />
    ))}
  </div>
  )
}

export default StarryBackground