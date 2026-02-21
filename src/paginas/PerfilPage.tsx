import { Link } from 'react-router-dom';
import { AppLayout } from "../componentes";

export default function PerfilPage() {
  const usuario = {
    nombre: "JUAN PÉREZ",
    nivel: "NIVEL 15",
    rango: "ATLETA DE ÉLITE",
    progreso: 70,
    stats: [
      { etiqueta: "SETS TOTALES", valor: "1,240" },
      { etiqueta: "RACHA", valor: "12 DÍAS" },
      { etiqueta: "PESO TOTAL", valor: "45T" },
    ]
  };

  const opciones = [
    { nombre: "CONFIGURACIÓN DE CUENTA", ruta: "/perfil/configuracion", flecha: true },
    { nombre: "LOGROS Y TROFEOS", ruta: null, flecha: true },
    { nombre: "HISTORIAL DE SESIONES", ruta: null, flecha: true },
    { nombre: "CERRAR SESIÓN", ruta: "/login", esRojo: true },
  ];

  return (
    <AppLayout>
      <div className="space-y-4 pb-10">
        
        {/* CONTENEDOR PRINCIPAL: Ahora con rounded-2xl (Mucho menos redondo) */}
        <div className="relative overflow-hidden bg-neutral-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#DBF059]/5 blur-[80px] rounded-full"></div>
          
          <div className="relative z-10 flex flex-col items-center md:flex-row md:items-end gap-6">
            {/* Foto de perfil: Mantenemos el círculo solo aquí por estética de usuario */}
            <div className="w-24 h-24 rounded-full border-2 border-white/5 p-1">
              <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center border border-[#DBF059]">
                 <span className="text-3xl font-black text-white italic tracking-tighter uppercase">JP</span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <p className="text-[#DBF059] font-black text-[9px] tracking-[0.3em] uppercase mb-1 italic">
                {usuario.rango}
              </p>
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-3 leading-none">
                {usuario.nombre}
              </h1>
              
              {/* Barra de progreso técnica y recta */}
              <div className="w-full max-w-xs h-1 bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-[#DBF059]"
                  style={{ width: `${usuario.progreso}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stats con divisores rectos */}
          <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-white/5">
             {usuario.stats.map((stat, i) => (
               <div key={i} className="text-center border-r border-white/5 last:border-r-0">
                 <p className="text-white font-black text-lg italic leading-none">{stat.valor}</p>
                 <p className="text-neutral-500 text-[7px] font-bold uppercase tracking-widest mt-1">{stat.etiqueta}</p>
               </div>
             ))}
          </div>
        </div>

        {/* CONTENEDOR DE OPCIONES: También rounded-2xl para total uniformidad */}
        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">
          {opciones.map((opcion, index) => (
            <Link key={index} to={opcion.ruta || "#"} className="group block">
              <div className={`
                flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200
                ${opcion.esRojo 
                  ? 'bg-red-500/5 hover:bg-red-500/10' 
                  : 'hover:bg-white/5'
                }
              `}>
                <span className={`font-black text-[10px] italic tracking-[0.15em] uppercase ${opcion.esRojo ? 'text-red-500' : 'text-zinc-300'}`}>
                  {opcion.nombre}
                </span>
                {opcion.flecha && (
                  <span className="text-[#DBF059] text-xs font-black opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    →
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}