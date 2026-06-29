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
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Cấu hình cache cho static assets và cho phép remote domains tải ảnh
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;
