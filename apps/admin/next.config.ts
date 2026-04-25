import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Tối ưu hóa bundle
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Nén tài nguyên
  compress: true,
  // Tắt x-powered-by để bảo mật và giảm header size
  poweredByHeader: false,
  // Cấu hình cache cho static assets
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  }
};

export default nextConfig;
