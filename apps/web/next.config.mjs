import { withPayload } from '@payloadcms/next/withPayload';

const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const coolifyUrl = process.env.COOLIFY_URL;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const resolvedUrl = vercelProdUrl
  ? `https://${vercelProdUrl}`
  : serverUrl || coolifyUrl || 'http://localhost:3000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      ...[resolvedUrl].map((item) => {
        const url = new URL(item);

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        };
      }),
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  output: coolifyUrl ? 'standalone' : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb', // Vercel Hobby plan maximum request body size
    },
  },
};

export default withPayload(nextConfig);
