import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Ikona (public/icon.png, tworzona przez scripts/ikona.mjs) ma własne tło.
// Maskowalna dostaje margines, bo Android przycina ją do koła.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, padding: 0.14, resizeOptions: { background: '#F5DFE2' } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#F5DFE2' } },
  },
  images: ['public/icon.png'],
})
