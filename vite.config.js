import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'fonts/*.woff2'],
      manifest: {
        id: '/',
        name: 'Calendário Litúrgico Perpétuo',
        short_name: 'Calendário Lit.',
        description:
          'Calendário Litúrgico Perpétuo — celebrações e leituras de cada dia, com funcionamento offline.',
        lang: 'pt-PT',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#0e1120',
        background_color: '#0e1120',
        categories: ['education', 'books', 'lifestyle'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/data\/index\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'clp-index',
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/data\/clp-.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'clp-meses',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 24,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
            },
          },
        ],
      },
    }),
  ],
})
