import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // /ko → 삿갓 specimen 페이지 (삿갓 specimen 정적 페이지, 한국화 override 적용)
      // /ko/new, /ko/preview 등은 React app router로 그대로 라우팅됨
      { source: '/ko', destination: '/satgat/satgat-ko.html' },
    ];
  },
};

export default nextConfig;
