import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from './store/configStore'
import { ToastProvider } from './components/Toast'
import { I18nProvider } from './i18n/I18nProvider'
import { ThemeProvider } from './themes/ThemeProvider'
import App from './App'
import './index.css'

createRoot( document.getElementById( 'root' )! ).render(
  <StrictMode>
    <ConfigProvider>
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </ConfigProvider>
  </StrictMode>,
)
