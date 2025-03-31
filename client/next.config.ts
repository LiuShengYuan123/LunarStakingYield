import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  // output: "export", // 启用静态导出模式
  
  // // 必需配置：禁用图片优化
  // images: {
  //   unoptimized: true
  // },

  // 可选配置：自定义构建目录（默认就是 out）
  distDir: "out", // 默认值，无需显式声明
};

export default nextConfig;
