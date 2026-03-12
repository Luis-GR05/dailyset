import { Link, useLocation } from "react-router-dom";
import Logo from "../shared/Logo";
import { useI18n } from "../../context/I18nContext";

interface SidebarProps {
  abierto: boolean;
  onCerrar: () => void;
}

export default function Sidebar({ abierto, onCerrar }: SidebarProps) {
  const location = useLocation();
  const { t } = useI18n();

  const menuItems = [
    { nombre: t.nav.dashboard, ruta: "/dashboard" },
    { nombre: t.nav.myRoutines, ruta: "/mis-rutinas" },
    { nombre: t.nav.history, ruta: "/historial" },
    { nombre: t.nav.exercises, ruta: "/ejercicios" },
    { nombre: t.nav.statistics, ruta: "/estadisticas" },
    { nombre: t.nav.profile, ruta: "/perfil" },
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
          fixed top-0 left-0 h-full w-72 p-6 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${abierto ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:z-auto
        `}
        style={{ backgroundColor: 'var(--color-black)', borderRight: '1px solid var(--color-neutral-800)' }}
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" onClick={onCerrar}>
            <Logo size="lg" />
          </Link>
          <button
            onClick={onCerrar}
            className="md:hidden transition-colors"
            style={{ color: 'var(--color-neutral-2000)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.ruta || location.pathname.startsWith(item.ruta + "/");
            return (
              <Link
                key={item.ruta}
                to={item.ruta}
                onClick={onCerrar}
                className="block py-2 px-3 rounded-lg text-lg font-medium transition-all"
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
                {item.nombre}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
