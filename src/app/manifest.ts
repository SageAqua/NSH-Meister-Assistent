import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NSH Meister-Assistent',
    short_name: 'NSH Assist',
    start_url: '/heute',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#dc2626',
    lang: 'de',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  };
}
