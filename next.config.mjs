// next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/pdf-to-scanned',
        destination: '/pdf-to-scanned-document',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap-core.xml',
        destination: '/sitemap-[id].xml?id=core',
      },
      {
        source: '/sitemap-:id.xml',
        destination: '/sitemap-[id].xml?id=:id',
      },
    ];
  },
};

export default nextConfig;