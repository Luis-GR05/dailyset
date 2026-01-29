import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Logo from './componentes/Logo'
import { Landing } from './paginas/Landing'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
)
