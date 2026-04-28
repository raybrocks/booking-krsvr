import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Krs VR Arena Admin',
    short_name: 'VR Admin',
    description: 'Manage bookings and experiences for Krs VR Arena',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#9C39FF',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      }
    ],
  }
}