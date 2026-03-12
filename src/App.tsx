import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HistorialProvider } from './context/HistorialContext';
import { EjerciciosProvider } from './context/EjerciciosContext';
import { RutinasProvider } from './context/RutinasContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <HistorialProvider>
        <EjerciciosProvider>
          <RutinasProvider>
            <Router>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroPage />} />

                {/* Rutas privadas */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/mis-rutinas" element={<ProtectedRoute><MisRutinasPage /></ProtectedRoute>} />
                <Route path="/mis-rutinas/entrenamiento" element={<ProtectedRoute><EntrenamientoPage /></ProtectedRoute>} />
                <Route path="/historial" element={<ProtectedRoute><HistorialPage /></ProtectedRoute>} />
                <Route path="/historial/:fecha" element={<ProtectedRoute><HistorialDiaPage /></ProtectedRoute>} />
                <Route path="/ejercicios" element={<ProtectedRoute><EjerciciosPage /></ProtectedRoute>} />
                <Route path="/ejercicios/:id" element={<ProtectedRoute><EjercicioDetallePage /></ProtectedRoute>} />
                <Route path="/estadisticas" element={<ProtectedRoute><EstadisticasPage /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
                <Route path="/perfil/configuracion" element={<ProtectedRoute><PerfilConfigPage /></ProtectedRoute>} />
              </Routes>
            </Router>
          </RutinasProvider>
        </EjerciciosProvider>
      </HistorialProvider>
    </AuthProvider>
  );
}

export default App;