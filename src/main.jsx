import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { NextUIProvider } from '@nextui-org/react'
import './styles/global.css'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <NextUIProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </NextUIProvider>
)
