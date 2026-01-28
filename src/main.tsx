import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BarraLateral from './componentes/BarraLateral'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BarraLateral />
  </StrictMode>,
)
