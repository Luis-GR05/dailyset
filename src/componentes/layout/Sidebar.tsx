import { Link, useLocation } from "react-router-dom";
import Logo from "../shared/Logo";

interface SidebarProps {
  abierto: boolean;
  onCerrar: () => void;
}

export default function Sidebar({ abierto, onCerrar }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { nombre: "Dashboard", ruta: "/dashboard" },
    { nombre: "Mis rutinas", ruta: "/mis-rutinas" },
    { nombre: "Historial", ruta: "/historial" },
    { nombre: "Ejercicios", ruta: "/ejercicios" },
    { nombre: "Estadísticas", ruta: "/estadisticas" },
    { nombre: "Perfil", ruta: "/perfil" },
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
          fixed top-0 left-0 h-full w-72 bg-black p-6 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${abierto ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:z-auto
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" onClick={onCerrar}>
            <Logo size="lg" />
          </Link>
          <button
            onClick={onCerrar}
            className="md:hidden text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.ruta}
              to={item.ruta}
              onClick={onCerrar}
              className={`block py-2 px-3 rounded-lg text-lg font-medium transition-all ${
                location.pathname === item.ruta || location.pathname.startsWith(item.ruta + "/")
                  ? "bg-[#DBF059] text-black"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.nombre}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
