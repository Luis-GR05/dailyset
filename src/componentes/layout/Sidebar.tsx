import { Link, useLocation } from "react-router-dom";
import Logo from "../shared/Logo";

export default function Sidebar() {
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
    <aside className="w-72 bg-black p-6 flex flex-col h-full">
      <div className="mb-8">
        <Link to="/dashboard">
          <Logo size="lg" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.ruta}
            to={item.ruta}
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
  );
}
