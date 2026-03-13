import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importación de Providers de dominio privado
import { HistorialProvider } from './context/HistorialContext';
import { EjerciciosProvider } from './context/EjerciciosContext';
import { RutinasProvider } from './context/RutinasContext';

// Lazy Loading: Dividiendo el bundle principal en fragmentos pequeños
const LandingPage = lazy(() => import('./paginas/LandingPage'));
const LoginPage = lazy(() => import('./paginas/LoginPage'));
const RegistroPage = lazy(() => import('./paginas/RegistroPage'));
const DashboardPage = lazy(() => import('./paginas/DashboardPage'));
const MisRutinasPage = lazy(() => import('./paginas/MisRutinasPage'));
const EntrenamientoPage = lazy(() => import('./paginas/EntrenamientoPage'));
const HistorialPage = lazy(() => import('./paginas/HistorialPage'));
const HistorialDiaPage = lazy(() => import('./paginas/HistorialDiaPage'));
const EjerciciosPage = lazy(() => import('./paginas/EjerciciosPage'));
const EjercicioDetallePage = lazy(() => import('./paginas/EjercicioDetallePage'));
const EstadisticasPage = lazy(() => import('./paginas/EstadisticasPage'));
const PerfilPage = lazy(() => import('./paginas/PerfilPage'));
const PerfilConfigPage = lazy(() => import('./paginas/PerfilConfig'));

// Pantalla de carga genérica para Suspense
const PantallaCarga = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
      style={{ borderTopColor: 'var(--color-primary)' }}
    />
  </div>
);

// Wrapper para proteger rutas y aislar contextos pesados
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <PantallaCarga />;
  if (!user) return <Navigate to="/login" replace />;

  // Los providers pesados SOLO se renderizan si el usuario está autenticado
  return (
    <HistorialProvider>
      <EjerciciosProvider>
        <RutinasProvider>
          {children}
        </RutinasProvider>
      </EjerciciosProvider>
    </HistorialProvider>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PantallaCarga />}>
        <Routes>
          {/* Rutas públicas: Ligeras, sin dependencias innecesarias */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          {/* Rutas privadas: Protegidas y con estado global inyectado */}
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
      </Suspense>
    </Router>
  );
}

export default App;