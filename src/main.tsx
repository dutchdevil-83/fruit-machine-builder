import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from './store/configStore'
import { ToastProvider } from './components/Toast'
import App from './App'
import './index.css'

createRoot( document.getElementById( 'root' )! ).render(
  <StrictMode>
    <ConfigProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ConfigProvider>
  </StrictMode>,
)
