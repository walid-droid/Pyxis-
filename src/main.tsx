
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
import { PlanProvider } from './pages/shared/plan/PlanProvider'

applyTheme(getInitialTheme())
applyLanguage(getInitialLanguage())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <PlanProvider>
          <App />
        </PlanProvider>
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
)
