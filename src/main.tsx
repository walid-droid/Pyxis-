
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import './dark.css'
import './rtl.css'
import { applyTheme, getInitialTheme } from './theme'
import { applyLanguage, getInitialLanguage } from './i18n'
import I18nProvider from './i18n/provider'
import { AssignmentsProvider } from './lib/assignments'
import { NotificationsProvider } from './lib/notifications'
import { OrsecOpsProvider } from './lib/orsecOps'
import { PlanProvider } from './pages/shared/plan/PlanProvider'

applyTheme(getInitialTheme())
applyLanguage(getInitialLanguage())

// Hors ligne : l'application est servie par le service worker en production.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Enregistrement impossible (contexte non sécurisé, etc.) : on continue en ligne.
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <AssignmentsProvider>
            <OrsecOpsProvider>
              <PlanProvider>
                <App />
              </PlanProvider>
            </OrsecOpsProvider>
          </AssignmentsProvider>
        </BrowserRouter>
      </NotificationsProvider>
    </I18nProvider>
  </StrictMode>,
)
