import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental:{
    optimizePackageImports: ["@chakra-ui/react","framer-motion"]
   },
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vrasevfzuwjcqhdaiwjq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
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
