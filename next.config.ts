import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/opplevelser/:path*',
        destination: '/vr-opplevelser/:path*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/mixed-reality',
        destination: '/vr-opplevelser/rask-action',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/mixed-reality/:slug*',
        destination: '/vr-opplevelser/rask-action/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/zombie',
        destination: '/vr-opplevelser/rask-action',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/zombie/:slug*',
        destination: '/vr-opplevelser/rask-action/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/archer',
        destination: '/vr-opplevelser/familie',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/archer/:slug*',
        destination: '/vr-opplevelser/familie/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/familiepakke',
        destination: '/vr-opplevelser/familie',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/familiepakke/:slug*',
        destination: '/vr-opplevelser/familie/:slug*',
        permanent: true,
      },
      // Arrangementer redirects
      {
        source: '/arrangementer/firmaevent',
        destination: '/arrangementer/vr-teambuilding',
        permanent: true,
      },
      {
        source: '/arrangementer/private-fester',
        destination: '/arrangementer/vr-bursdag',
        permanent: true,
      },
      {
        source: '/arrangementer/bursdag',
        destination: '/arrangementer/vr-bursdag',
        permanent: true,
      },
      {
        source: '/arrangementer/utdrikningslag',
        destination: '/arrangementer/vr-utdrikningslag',
        permanent: true,
      },
      {
        source: '/arrangementer/bachelor-party',
        destination: '/arrangementer/vr-utdrikningslag',
        permanent: true,
      },
      {
        source: '/arrangementer/bachelorette-party',
        destination: '/arrangementer/vr-utdrikningslag',
        permanent: true,
      },
      {
        source: '/arrangementer/teambuilding',
        destination: '/arrangementer/vr-teambuilding',
        permanent: true,
      },
      {
        source: '/arrangementer/firmafest',
        destination: '/arrangementer/vr-teambuilding',
        permanent: true,
      },
      {
        source: '/arrangementer/julebord',
        destination: '/arrangementer/vr-teambuilding',
        permanent: true,
      },
      {
        source: '/arrangementer/kickoff',
        destination: '/arrangementer/vr-teambuilding',
        permanent: true,
      },
      {
        source: '/arrangementer/on-site',
        destination: '/arrangementer/vr-on-site',
        permanent: true,
      },
      {
        source: '/arrangementer/vi-kommer-til-deg',
        destination: '/arrangementer/vr-on-site',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
