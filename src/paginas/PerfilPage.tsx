import { useNavigate } from 'react-router-dom';
import { AppLayout } from "../componentes";
import { useAuth } from '../context/AuthContext';

function getInitials(nombre: string | null, nombreUsuario: string): string {
  const fuente = nombre || nombreUsuario;
  return fuente
    .split(' ')
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();
}

function getNivelLabel(nivel: string | null): string {
  switch (nivel) {
    case 'principiante': return 'ATLETA EN FORMACIÓN';
    case 'intermedio': return 'ATLETA INTERMEDIO';
    case 'avanzado': return 'ATLETA AVANZADO';
    case 'elite': return 'ATLETA DE ÉLITE';
    default: return 'ATLETA';
  }
}

export default function PerfilPage() {
  const navigate = useNavigate();
  const { user, perfil, signOut } = useAuth();

  const nombreMostrado = perfil?.nombre_completo || perfil?.nombre_usuario || '—';
  const initials = perfil ? getInitials(perfil.nombre_completo, perfil.nombre_usuario) : '—';
  const rango = getNivelLabel(perfil?.nivel_entrenamiento ?? null);

  const stats = [
    { etiqueta: "SETS TOTALES", valor: "—" },
    { etiqueta: "RACHA", valor: "—" },
    { etiqueta: "PESO TOTAL", valor: "—" },
  ];

  const opciones = [
    { nombre: "CONFIGURACIÓN DE CUENTA", ruta: "/perfil/configuracion", flecha: true },
    { nombre: "CERRAR SESIÓN", ruta: null, esRojo: true },
  ];

  const handleAction = async (opcion: typeof opciones[0]) => {
    if (opcion.esRojo) {
      if (confirm("¿Cerrar sesión en DailySet Elite?")) {
        await signOut();
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
          <div className="absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full" style={{ backgroundColor: 'var(--color-primary-muted)' }}></div>

          <div className="relative z-10 flex flex-col items-center md:flex-row md:items-end gap-8">
            <div className="w-28 h-28 rounded-full border-2 border-white/5 p-1">
              <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--color-primary)' }}>
                <span className="text-3xl font-black text-white italic tracking-tighter uppercase">{initials}</span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <p className="font-black text-[10px] tracking-[0.4em] uppercase mb-1 italic" style={{ color: 'var(--color-primary)' }}>
                {rango}
              </p>
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">
                {nombreMostrado.toUpperCase()}
              </h1>
              <p className="text-neutral-500 text-xs mb-3">{user?.email}</p>
              <div className="w-full max-w-sm h-1 bg-white/5 overflow-hidden">
                <div
                  className="h-full w-[30%] shadow-[0_0_15px_rgba(67,97,238,0.3)]"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-10 pt-8 border-t border-white/10">
            {stats.map((stat, i) => (
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
                    <span className="text-sm font-black opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: 'var(--color-accent)' }}>
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