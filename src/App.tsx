import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HistorialProvider } from './context/HistorialContext';
import LandingPage from './paginas/LandingPage';
import LoginPage from './paginas/LoginPage';
import DashboardPage from './paginas/DashboardPage';
import MisRutinasPage from './paginas/MisRutinasPage';
import EntrenamientoPage from './paginas/EntrenamientoPage';
import HistorialPage from './paginas/HistorialPage';
import HistorialDiaPage from './paginas/HistorialDiaPage';
import EjerciciosPage from './paginas/EjerciciosPage';
import EjercicioDetallePage from './paginas/EjercicioDetallePage';
import EstadisticasPage from './paginas/EstadisticasPage';
import PerfilPage from './paginas/PerfilPage';
import PerfilConfigPage from './paginas/PerfilConfig';
import RegistroPage from './paginas/RegistroPage';

function App() {
  return (
    <HistorialProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mis-rutinas" element={<MisRutinasPage />} />
          <Route path="/mis-rutinas/entrenamiento" element={<EntrenamientoPage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/historial/:fecha" element={<HistorialDiaPage />} />
          <Route path="/ejercicios" element={<EjerciciosPage />} />
          <Route path="/ejercicios/:id" element={<EjercicioDetallePage />} />
          <Route path="/estadisticas" element={<EstadisticasPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/perfil/configuracion" element={<PerfilConfigPage />} />
        </Routes>
      </Router>
    </HistorialProvider>
  );
}

export default App;