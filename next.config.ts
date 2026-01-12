import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Enable for Docker deployment
  turbopack: {},
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@aws-sdk/client-s3': 'commonjs @aws-sdk/client-s3',
        '@aws-sdk/s3-request-presigner': 'commonjs @aws-sdk/s3-request-presigner',
        '@aws-sdk/client-dynamodb': 'commonjs @aws-sdk/client-dynamodb',
        '@aws-sdk/lib-dynamodb': 'commonjs @aws-sdk/lib-dynamodb',
        '@aws-sdk/client-cognito-identity-provider': 'commonjs @aws-sdk/client-cognito-identity-provider',
      });
    }
    return config;
  },
};

export default nextConfig;
