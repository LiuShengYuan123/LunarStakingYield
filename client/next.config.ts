import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  output: 'export', // 必须启用静态导出
  distDir: 'out',   // 保持默认或与你实际目录一致
  // 如果使用图片优化需要添加以下配置
  images: {
    unoptimized: true
  }
};

export default nextConfig;
