import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Na GitHub Pages aplikacja działa pod /<nazwa-repozytorium>/.
// Workflow ustawia BASE_PATH automatycznie; lokalnie używamy "/".
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  define: {
    // np. „1.0.0 · 18.10 21:40” — widać w Ustawieniach, która wersja jest na telefonie
    __WERSJA__: JSON.stringify(
      `${process.env.npm_package_version ?? 'dev'} · ${new Date().toLocaleString('pl-PL', {
        timeZone: 'Europe/Warsaw',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    ),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // rejestracja w src/main.tsx (z automatycznym przeładowaniem)
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Plan lekcji 6G',
        short_name: 'Plan 6G',
        description: 'Plan lekcji klasy 6G z kalendarzem sprawdzianów, wycieczek i dni wolnych.',
        lang: 'pl',
        dir: 'ltr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F5DEE2',
        theme_color: '#F5DEE2',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Obrazy źródłowe ikony nie są potrzebne offline.
        globIgnores: ['**/icon.png', '**/kot-rycerz.png'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
