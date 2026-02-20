import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from './store/configStore'
import App from './App'
import './index.css'

createRoot( document.getElementById( 'root' )! ).render(
  <StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
