import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './paginas/LoginPage';
import RegistroPage from './paginas/RegistroPage';
import DashboardPage from './paginas/DashboardPage';
import EjerciciosPage from './paginas/EjerciciosPage';
import ProgresoPage from './paginas/ProgresoPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        <Route path="/" element={<DashboardPage />} />
        <Route path="/ejercicios" element={<EjerciciosPage />} />
        <Route path="/progreso" element={<ProgresoPage />} />
      </Routes>
    </Router>
  );
}

export default App;