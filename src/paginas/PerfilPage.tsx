import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from "../componentes";

export default function PerfilPage() {
  const navigate = useNavigate();

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
    { nombre: "LOGROS Y TROFEOS", ruta: "/perfil/logros", flecha: true },
    { nombre: "HISTORIAL DE SESIONES", ruta: "/perfil/historial", flecha: true },
    { nombre: "CERRAR SESIÓN", ruta: null, esRojo: true },
  ];

  const handleAction = (opcion: typeof opciones[0]) => {
    if (opcion.esRojo) {
      if (confirm("¿Cerrar sesión en DailySet Elite?")) {
        navigate("/login");
      }
      return;
    }
    if (opcion.ruta) {
      navigate(opcion.ruta);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 pb-10 max-w-4xl mx-auto">
        
        <div className="relative overflow-hidden bg-neutral-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#DBF059]/5 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 flex flex-col items-center md:flex-row md:items-end gap-8">
            <div className="w-28 h-28 rounded-full border-2 border-white/5 p-1">
              <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center border border-[#DBF059]">
                 <span className="text-3xl font-black text-white italic tracking-tighter uppercase">JP</span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <p className="text-[#DBF059] font-black text-[10px] tracking-[0.4em] uppercase mb-1 italic">
                {usuario.rango}
              </p>
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">
                {usuario.nombre}
              </h1>
              
              <div className="w-full max-w-sm h-1 bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-[#DBF059] shadow-[0_0_15px_rgba(219,240,89,0.3)]"
                  style={{ width: `${usuario.progreso}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-10 pt-8 border-t border-white/10">
             {usuario.stats.map((stat, i) => (
               <div key={i} className="text-center border-r border-white/5 last:border-r-0">
                 <p className="text-white font-black text-xl italic leading-none">{stat.valor}</p>
                 <p className="text-neutral-500 text-[8px] font-bold uppercase tracking-[0.2em] mt-2 italic">{stat.etiqueta}</p>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl">
          <div className="space-y-1">
            {opciones.map((opcion, index) => (
              <button 
                key={index} 
                onClick={() => handleAction(opcion)}
                className="w-full group block"
              >
                <div className={`
                  flex items-center justify-between px-6 py-5 rounded-xl transition-all duration-200
                  ${opcion.esRojo 
                    ? 'bg-red-500/5 hover:bg-red-500/10' 
                    : 'hover:bg-white/5'
                  }
                `}>
                  <span className={`font-black text-[11px] italic tracking-[0.15em] uppercase ${opcion.esRojo ? 'text-red-500' : 'text-zinc-300'}`}>
                    {opcion.nombre}
                  </span>
                  {opcion.flecha && (
                    <span className="text-[#DBF059] text-sm font-black opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}