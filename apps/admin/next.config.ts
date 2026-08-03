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
  async rewrites() {
    const rawEnv = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
    const backendUrl = (rawEnv && rawEnv.startsWith('http')) ? rawEnv : 'http://localhost:9090/api';
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;
