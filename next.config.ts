import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  experimental: {
     serverActions: {
        bodySizeLimit: '10mb',
        allowedOrigins: ['unarriving-francis-prospectless.ngrok-free.dev', 'localhost:3000']
     }
  },
  // Allow Ngrok to access Next.js dev resources (like HMR)
  allowedDevOrigins: [
    'unarriving-francis-prospectless.ngrok-free.dev',
    'localhost:3000'
  ]
};

export default nextConfig;