import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PortalSettingsProvider } from './context/PortalSettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PortalSettingsProvider>
      <App />
    </PortalSettingsProvider>
  </StrictMode>,
)
