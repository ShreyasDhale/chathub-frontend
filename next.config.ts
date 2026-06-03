import type { NextConfig } from "next";

/**
 * Backend origin for server-side rewrites.
 * Browser calls same-origin /api and /hubs/* — Next.js proxies to Render,
 * avoiding CORS on any localhost port.
 */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ??
  "https://chathubapplication-4mr7.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
      {
        source: "/hubs/:path*",
        destination: `${API_PROXY_TARGET}/hubs/:path*`,
      },
    ];
  },
};

export default nextConfig;
