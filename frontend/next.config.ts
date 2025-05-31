import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable output standalone for Docker deployment
  output: 'standalone',
  
  // Configure transpilation of dependencies
  transpilePackages: ['@supabase/ssr', '@supabase/supabase-js', 'ioredis'],
  
  // Configure environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
