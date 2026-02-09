import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
<<<<<<< HEAD
import BarraLateral from './componentes/BarraLateral'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BarraLateral />
=======
import { Login } from './paginas/Login'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Login />
>>>>>>> 9e3abd4cde766766c1e3c04d4dcfb76e5a0ab021
  </StrictMode>,
)
