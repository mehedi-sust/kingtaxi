import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack configuration for Next.js 16+
  turbopack: {},
  async rewrites() {
    const isDev = process.env.NODE_ENV !== "production";
    const rawApiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (isDev ? "http://localhost:8000" : "https://kingtaxi-webapp-backend.onrender.com");
    const apiUrl = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
