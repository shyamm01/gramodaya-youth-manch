import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/super-admin',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/super-admin/:path*',
        destination: '/admin/:path*',
        permanent: false,
      },
      {
        source: '/admin/security',
        destination: '/admin/audit',
        permanent: false,
      },
      {
        source: '/admin/permissions/modules',
        destination: '/admin/modules',
        permanent: false,
      },
      {
        source: '/admin/permissions/roles',
        destination: '/admin/roles',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'unload=*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
