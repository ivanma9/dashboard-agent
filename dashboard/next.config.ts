import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/dashboard' : '',
};

export default nextConfig;