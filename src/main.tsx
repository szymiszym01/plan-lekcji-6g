import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import './styles.css'
import { registerSW } from 'virtual:pwa-register'
import App from './App'

// Gdy pobierze się nowa wersja, aplikacja przeładuje się sama (bez zamykania jej na iPhonie).
// Na iPhonie aplikacja z ekranu początkowego często tylko wraca z tła, więc wtedy też sprawdzamy aktualizacje.
registerSW({
  immediate: true,
  onRegisteredSW(_url, rejestracja) {
    if (!rejestracja) return
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) rejestracja.update().catch(() => {})
    })
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
