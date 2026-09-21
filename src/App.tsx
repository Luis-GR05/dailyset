import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HistorialProvider } from './context/HistorialContext';
import { EjerciciosProvider } from './context/EjerciciosContext';
import { RutinasProvider } from './context/RutinasContext';
import { SocialProvider } from './context/SocialContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const LandingPage = lazy(() => import('./paginas/LandingPage'));
const LoginPage = lazy(() => import('./paginas/LoginPage'));
const RegistroPage = lazy(() => import('./paginas/RegistroPage'));
const RegistroConfirmacionPage = lazy(() => import('./paginas/RegistroConfirmacionPage'));
const PoliticaPrivacidadPage = lazy(() => import('./paginas/PoliticaPrivacidadPage'));
const TerminosCondicionesPage = lazy(() => import('./paginas/TerminosCondicionesPage'));

const DashboardPage = lazy(() => import('./paginas/DashboardPage'));
const MisRutinasPage = lazy(() => import('./paginas/MisRutinasPage'));
const EntrenamientoPage = lazy(() => import('./paginas/EntrenamientoPage'));
const SocialPage = lazy(() => import('./paginas/SocialPage'));
const HistorialPage = lazy(() => import('./paginas/HistorialPage'));
const HistorialDiaPage = lazy(() => import('./paginas/HistorialDiaPage'));
const EjerciciosPage = lazy(() => import('./paginas/EjerciciosPage'));
const EjercicioDetallePage = lazy(() => import('./paginas/EjercicioDetallePage'));
const EstadisticasPage = lazy(() => import('./paginas/EstadisticasPage'));
const PerfilPage = lazy(() => import('./paginas/PerfilPage'));
const PerfilConfigPage = lazy(() => import('./paginas/PerfilConfig'));
const SoporteChatPage = lazy(() => import('./paginas/SoporteChatPage'));
const UtilidadesPage = lazy(() => import('./paginas/UtilidadesPage'));

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
            <SocialProvider>
              <Router>
                <Suspense
                  fallback={
                    <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                        style={{ borderTopColor: 'var(--color-primary)' }}
                      />
                    </div>
                  }
                >
                  <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegistroPage />} />
                    <Route path="/privacidad" element={<PoliticaPrivacidadPage />} />
                    <Route path="/politica-privacidad" element={<Navigate to="/privacidad" replace />} />
                    <Route path="/terminos" element={<TerminosCondicionesPage />} />
                    <Route path="/terminos-condiciones" element={<Navigate to="/terminos" replace />} />
                    <Route path="/terminos-y-condiciones" element={<Navigate to="/terminos" replace />} />

                    {/* Rutas privadas */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/mis-rutinas" element={<ProtectedRoute><MisRutinasPage /></ProtectedRoute>} />
                    <Route path="/mis-rutinas/entrenamiento" element={<ProtectedRoute><EntrenamientoPage /></ProtectedRoute>} />
                    <Route path="/entrenamiento" element={<Navigate to="/mis-rutinas/entrenamiento" replace />} />
                    <Route path="/social" element={<ProtectedRoute><SocialPage /></ProtectedRoute>} />
                    <Route path="/historial" element={<ProtectedRoute><HistorialPage /></ProtectedRoute>} />
                    <Route path="/historial/:fecha" element={<ProtectedRoute><HistorialDiaPage /></ProtectedRoute>} />
                    <Route path="/ejercicios" element={<ProtectedRoute><EjerciciosPage /></ProtectedRoute>} />
                    <Route path="/ejercicios/:id" element={<ProtectedRoute><EjercicioDetallePage /></ProtectedRoute>} />
                    <Route path="/estadisticas" element={<ProtectedRoute><EstadisticasPage /></ProtectedRoute>} />
                    <Route path="/perfil" element={<PerfilPage />} />
                    <Route path="/perfil/racha" element={<PerfilPage />} />
                    <Route path="/perfil/configuracion" element={<PerfilConfigPage />} />
                    <Route path="/perfil/datos" element={<PerfilConfigPage />} />
                    <Route path="/perfil/soporte" element={<SoporteChatPage />} />
                    <Route path="/soporte" element={<Navigate to="/perfil/soporte" replace />} />
                    <Route path="/utilidades" element={<UtilidadesPage />} />

                    {/* Confirmación de registro */}
                    <Route path="/registro-confirmacion" element={<RegistroConfirmacionPage />} />

                    {/* Redirección para rutas no encontradas (evita pantalla en negro) */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Router>
            </SocialProvider>
          </RutinasProvider>
        </EjerciciosProvider>
      </HistorialProvider>
    </AuthProvider>
  );
}

export default App;