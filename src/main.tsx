import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Logo from './componentes/Logo'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Logo />
  </StrictMode>,
)
