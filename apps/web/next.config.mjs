/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile local workspace packages so Next.js processes their TypeScript
  transpilePackages: ['@deadlink-sentinel/db', '@deadlink-sentinel/shared'],

  experimental: {
    // Required for Server Actions
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  // Strict headers — defence in depth
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
