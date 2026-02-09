import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Importamos la página de Login  tu carpeta de páginas
import { Login } from './paginas/Login'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Login />
  </StrictMode>,
)