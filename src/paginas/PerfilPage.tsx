import { Link } from 'react-router-dom';
import { AppLayout } from "../componentes";

export default function PerfilPage() {
  const usuario = {
    nombre: "Juan Pérez",
    nivel: "Nivel 15 - Atleta",
    progreso: 70,
  };

  const opciones = [
    { nombre: "Configuración de Cuenta", ruta: "/perfil/configuracion", flecha: true },
    { nombre: "Mis Logros / Trofeos", ruta: null, flecha: false },
    { nombre: "Cerrar Sesión", ruta: "/login", esRojo: true },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col items-center py-8">
          <div className="relative mb-4">
            <div className="w-28 h-28 bg-neutral-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-[#DBF059] rounded-full border-2 border-black"></div>
          </div>

          <h2 className="text-2xl font-bold text-white">{usuario.nombre}</h2>
          <p className="text-neutral-400 text-sm">{usuario.nivel}</p>

          <div className="w-64 mt-4">
            <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#DBF059] to-[#4361EE] rounded-full"
                style={{ width: `${usuario.progreso}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {opciones.map((opcion, index) => (
            opcion.ruta ? (
              <Link key={index} to={opcion.ruta}>
                <div className={`bg-neutral-900 rounded-2xl px-6 py-4 border border-neutral-800 flex items-center justify-between hover:border-neutral-600 transition-all cursor-pointer ${
                  opcion.esRojo ? 'mt-4' : ''
                }`}>
                  <span className={opcion.esRojo ? 'text-red-500' : 'text-white'}>
                    {opcion.nombre}
                  </span>
                  {opcion.flecha && (
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </Link>
            ) : (
              <div key={index} className="bg-neutral-900 rounded-2xl px-6 py-4 border border-neutral-800 flex items-center justify-between hover:border-neutral-600 transition-all cursor-pointer">
                <span className="text-white">{opcion.nombre}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </AppLayout>
  );
}