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
      // Specific experience redirects (Tactical Arena)
      {
        source: '/vr-opplevelser/rask-action/mixed-reality-shooter',
        destination: '/vr-opplevelser/action-strategi/tactical-arena',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/action/mixed-reality-shooter',
        destination: '/vr-opplevelser/action-strategi/tactical-arena',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/action/tactical-arena',
        destination: '/vr-opplevelser/action-strategi/tactical-arena',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/rask-action/tactical-arena',
        destination: '/vr-opplevelser/action-strategi/tactical-arena',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/mixed-reality/mixed-reality-shooter',
        destination: '/vr-opplevelser/action-strategi/tactical-arena',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/shooter/mixed-reality-shooter',
        destination: '/vr-opplevelser/action-strategi/tactical-arena',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/shooter/tactical-arena',
        destination: '/vr-opplevelser/action-strategi/tactical-arena',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/shooter/zombie-shooter-18',
        destination: '/vr-opplevelser/action-strategi/zombie-shooter-18',
        permanent: true,
      },
      // Category redirects (Action Strategi / legacy aliases)
      {
        source: '/vr-opplevelser/shooter',
        destination: '/vr-opplevelser/action-strategi',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/shooter/:slug*',
        destination: '/vr-opplevelser/action-strategi/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/skytespill',
        destination: '/vr-opplevelser/action-strategi',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/skytespill/:slug*',
        destination: '/vr-opplevelser/action-strategi/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/lasertag',
        destination: '/vr-opplevelser/action-strategi',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/lasertag/:slug*',
        destination: '/vr-opplevelser/action-strategi/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/laser-tag',
        destination: '/vr-opplevelser/action-strategi',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/laser-tag/:slug*',
        destination: '/vr-opplevelser/action-strategi/:slug*',
        permanent: true,
      },
      // Category redirects (Action Strategi / legacy aliases)
      {
        source: '/vr-opplevelser/action',
        destination: '/vr-opplevelser/action-strategi',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/action/:slug*',
        destination: '/vr-opplevelser/action-strategi/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/rask-action',
        destination: '/vr-opplevelser/action-strategi',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/rask-action/:slug*',
        destination: '/vr-opplevelser/action-strategi/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/mixed-reality',
        destination: '/vr-opplevelser/action-strategi',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/mixed-reality/:slug*',
        destination: '/vr-opplevelser/action-strategi/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/zombie',
        destination: '/vr-opplevelser/action-strategi',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/zombie/:slug*',
        destination: '/vr-opplevelser/action-strategi/:slug*',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/fast-action',
        destination: '/vr-opplevelser/action-strategi',
        permanent: true,
      },
      {
        source: '/vr-opplevelser/fast-action/:slug*',
        destination: '/vr-opplevelser/action-strategi/:slug*',
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
