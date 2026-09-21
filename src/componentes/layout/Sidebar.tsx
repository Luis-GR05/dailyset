import { Link, useLocation } from "react-router-dom";
import Logo from "../shared/Logo";
import { useI18n } from "../../context/I18nContext";
import {
  LayoutDashboard,
  Dumbbell,
  ListFilter,
  Calendar,
  BarChart2,
  Timer,
  User,
  Users,
} from "lucide-react";

interface SidebarProps {
  abierto: boolean;
  onCerrar: () => void;
}

export default function Sidebar({ abierto, onCerrar }: SidebarProps) {
  const location = useLocation();
  const { t, locale } = useI18n();

  const menuItems = [
    { nombre: t.nav.dashboard, ruta: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { nombre: t.nav.myRoutines, ruta: "/mis-rutinas", icon: <Dumbbell size={18} /> },
    { nombre: locale === 'es' ? 'Social' : 'Social', ruta: "/social", icon: <Users size={18} /> },
    { nombre: t.nav.exercises, ruta: "/ejercicios", icon: <ListFilter size={18} /> },
    { nombre: t.nav.history, ruta: "/historial", icon: <Calendar size={18} /> },
    { nombre: t.nav.statistics, ruta: "/estadisticas", icon: <BarChart2 size={18} /> },
    { nombre: locale === 'es' ? 'Utilidades' : 'Utilities', ruta: "/utilidades", icon: <Timer size={18} /> },
    { nombre: t.nav.profile, ruta: "/perfil", icon: <User size={18} /> },
  ];

  return (
    <>
      {abierto && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onCerrar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 sm:w-72 p-5 sm:p-6 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${abierto ? "translate-x-0" : "-translate-x-full"}
          md:sticky md:top-0 md:h-dvh md:self-start md:shrink-0 md:translate-x-0 md:z-30 md:overflow-y-auto scrollbar-hide
        `}
        style={{ backgroundColor: 'var(--color-black)', borderRight: '1px solid var(--color-neutral-800)' }}
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" onClick={onCerrar} className="pl-1">
            <Logo size="lg" />
          </Link>
          <button
            onClick={onCerrar}
            aria-label="Cerrar menú"
            className="md:hidden transition-colors"
            style={{ color: 'var(--color-neutral-2000)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1" aria-label="Navegación principal">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.ruta || location.pathname.startsWith(item.ruta + "/");
            return (
              <Link
                key={item.ruta}
                to={item.ruta}
                onClick={onCerrar}
                className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-sm sm:text-base font-bold transition-all"
                aria-current={isActive ? 'page' : undefined}
                style={
                  isActive
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-black)' }
                    : { color: 'var(--color-neutral-2000)' }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-white)';
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-neutral-2000)';
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.nombre}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
