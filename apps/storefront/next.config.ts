import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Tự động load file .env từ thư mục gốc của Monorepo nếu chưa được khai báo
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), "../../.env"));
loadEnvFile(path.resolve(process.cwd(), "../../.env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_STOREFRONT_API_URL: process.env.NEXT_PUBLIC_STOREFRONT_API_URL || "/api",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "/api",
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  },
  async rewrites() {
    const backendUrl =
      process.env.STOREFRONT_INTERNAL_API_URL ??
      process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      throw new Error(
        '[next.config] Missing env: STOREFRONT_INTERNAL_API_URL, INTERNAL_API_URL, or NEXT_PUBLIC_API_URL must be set.'
      );
    }
    return [
      {
        source: '/api/:path*',
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
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '172.17.0.1',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

