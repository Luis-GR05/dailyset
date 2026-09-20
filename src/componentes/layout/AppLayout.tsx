import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BannerEntrenamientoActivo from '../entrenamiento/BannerEntrenamientoActivo';
import { Home, Dumbbell, User as UserIcon, Activity, Users } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface AppLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  fondoClaro?: boolean;
}

export default function AppLayout({ children, fullWidth = false, fondoClaro = false }: AppLayoutProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
  const { locale } = useI18n();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:m-4 focus:px-4 focus:py-2 focus:rounded-lg"
        style={{
          backgroundColor: fondoClaro ? '#F1F5F9' : 'var(--color-neutral-800)',
          color: fondoClaro ? '#0F172A' : 'var(--color-white)',
          border: fondoClaro ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)'
        }}
      >
        Skip to content
      </a>
      <div
        className="flex min-h-dvh w-full relative transition-colors duration-200"
        style={{
          backgroundColor: fondoClaro ? '#FFFFFF' : 'var(--color-black)',
          color: fondoClaro ? '#0F172A' : 'var(--color-white)',
          overflowX: 'hidden'
        }}
      >
        {/* Fondo limpio y uniforme solo en modo oscuro */}
        {!fondoClaro && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] blur-[120px] pointer-events-none -z-10" />
        )}

        <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

        <div className="flex-1 flex flex-col min-w-0" style={fondoClaro ? { backgroundColor: '#FFFFFF' } : undefined}>
          <Header onAbrirMenu={() => setMenuAbierto(true)} fondoClaro={fondoClaro} />
          <main
            id="main"
            role="main"
            className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8"
          >
            <div className={fullWidth ? "w-full" : "max-w-5xl mx-auto"}>
              <BannerEntrenamientoActivo />
              {children}
            </div>
          </main>
        </div>

        {/* Barra de navegación inferior flotante para móvil */}
        <nav
          aria-label="Navegación móvil"
          className={`md:hidden fixed bottom-3 left-3 right-3 z-40 backdrop-blur-2xl rounded-full px-4 py-2 flex items-center justify-around shadow-2xl transition-colors ${
            fondoClaro
              ? 'bg-white/95 border border-neutral-200 shadow-lg text-neutral-800'
              : 'bg-black/85 border border-white/10 text-white'
          }`}
        >
          <Link to="/dashboard" className="flex flex-col items-center gap-1">
            <Home
              size={18}
              style={{ color: location.pathname === '/dashboard' ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            />
            <span
              className="text-[9px] font-bold"
              style={{ color: location.pathname === '/dashboard' ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            >
              {locale === 'es' ? 'Inicio' : 'Home'}
            </span>
          </Link>
          <Link to="/mis-rutinas" className="flex flex-col items-center gap-1">
            <Dumbbell
              size={18}
              style={{ color: location.pathname.startsWith('/mis-rutinas') ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            />
            <span
              className="text-[9px] font-bold"
              style={{ color: location.pathname.startsWith('/mis-rutinas') ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            >
              {locale === 'es' ? 'Rutinas' : 'Workout'}
            </span>
          </Link>
          <Link to="/social" className="flex flex-col items-center gap-1">
            <Users
              size={18}
              style={{ color: location.pathname.startsWith('/social') ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            />
            <span
              className="text-[9px] font-bold"
              style={{ color: location.pathname.startsWith('/social') ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            >
              Social
            </span>
          </Link>
          <Link to="/estadisticas" className="flex flex-col items-center gap-1">
            <Activity
              size={18}
              style={{ color: location.pathname === '/estadisticas' ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            />
            <span
              className="text-[9px] font-bold"
              style={{ color: location.pathname === '/estadisticas' ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            >
              {locale === 'es' ? 'Progreso' : 'Activity'}
            </span>
          </Link>
          <Link to="/perfil" className="flex flex-col items-center gap-1">
            <UserIcon
              size={18}
              style={{ color: location.pathname === '/perfil' ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            />
            <span
              className="text-[9px] font-bold"
              style={{ color: location.pathname === '/perfil' ? 'var(--color-primary)' : (fondoClaro ? '#64748B' : 'var(--color-neutral-3000)') }}
            >
              {locale === 'es' ? 'Perfil' : 'Profile'}
            </span>
          </Link>
        </nav>
      </div>
    </>
  );
}