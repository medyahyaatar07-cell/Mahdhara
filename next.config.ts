import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  outputFileTracingIncludes: {
    "/*": ["./node_modules/@sparticuz/chromium/**/*"],
  },
};

export default nextConfig;
