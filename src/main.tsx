import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Login } from './paginas/Login.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Login/>
  </StrictMode>,
)
