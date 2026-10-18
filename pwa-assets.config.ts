import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Ikona ma własne tło i marginesy, więc bez dodatkowego paddingu.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: '#F5DEE2' } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#F5DEE2' } },
  },
  images: ['public/icon.svg'],
})
