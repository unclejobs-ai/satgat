import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  // Bundle the @sparticuz/chromium binary into the PDF export serverless function.
  outputFileTracingIncludes: {
    '/api/export': ['./node_modules/@sparticuz/chromium/**'],
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
