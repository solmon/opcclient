import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Tell webpack to handle Node.js modules properly
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to import these Node.js modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
