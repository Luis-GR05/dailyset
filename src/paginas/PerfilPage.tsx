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
    { nombre: "HISTORIAL DE SESIONES", ruta: null, flecha: true },
    { nombre: "CERRAR SESIÓN", ruta: "/login", esRojo: true },
  ];

  return (
    <AppLayout>
      <div className="space-y-10 pb-10">
        
        <div className="relative overflow-hidden bg-neutral-900/40 border border-white/5 rounded-[40px] p-8 backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#DBF059]/10 blur-[80px] rounded-full"></div>
          
          <div className="relative z-10 flex flex-col items-center md:flex-row md:items-end gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white/5 p-1 transition-transform duration-500 group-hover:scale-105">
                <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-[#DBF059]">
                   <span className="text-4xl font-black text-white italic">JP</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#DBF059] text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-[#DBF059]/20">
                PRO
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <p className="text-[#DBF059] font-black text-xs tracking-[0.3em] uppercase mb-1 italic">
                {usuario.rango}
              </p>
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">
                {usuario.nombre}
              </h1>
              
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">
                  <span>{usuario.nivel}</span>
                  <span>{usuario.progreso}% PARA EL SIGUIENTE</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#DBF059] to-[#b8cd3a] rounded-full shadow-[0_0_15px_rgba(219,240,89,0.4)] transition-all duration-1000"
                    style={{ width: `${usuario.progreso}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/5">
             {usuario.stats.map((stat, i) => (
               <div key={i} className="text-center">
                 <p className="text-white font-black text-xl italic leading-none">{stat.valor}</p>
                 <p className="text-neutral-500 text-[8px] font-bold uppercase tracking-widest mt-1">{stat.etiqueta}</p>
               </div>
             ))}
          </div>
        </div>

        <div className="grid gap-3">
          <h3 className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.3em] ml-6 mb-2">Gestión</h3>
          {opciones.map((opcion, index) => (
            <Link key={index} to={opcion.ruta || "#"} className="group">
              <div className={`
                flex items-center justify-between px-8 py-5 rounded-[24px] transition-all duration-300
                ${opcion.esRojo 
                  ? 'bg-red-500/5 border border-red-500/10 hover:bg-red-500/10' 
                  : 'bg-neutral-900/40 border border-white/5 hover:border-[#DBF059]/30 hover:translate-x-2'
                }
              `}>
                <span className={`font-black text-sm italic tracking-tight uppercase ${opcion.esRojo ? 'text-red-500' : 'text-white'}`}>
                  {opcion.nombre}
                </span>
                {opcion.flecha && (
                  <span className={`text-xl transition-transform group-hover:translate-x-1 ${opcion.esRojo ? 'text-red-500' : 'text-[#DBF059]'}`}>
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