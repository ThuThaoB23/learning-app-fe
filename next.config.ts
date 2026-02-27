import type { NextConfig } from "next";

const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL ?? "http://app:8080";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${internalApiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
