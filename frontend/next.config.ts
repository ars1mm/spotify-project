import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental:{
    optimizePackageImports: ["@chakra-ui/react","framer-motion"]
   },
   async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
