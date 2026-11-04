import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["[::1]"],
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
};

export default nextConfig;
