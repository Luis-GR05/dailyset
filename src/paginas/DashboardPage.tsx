import { AppLayout, TituloPagina } from "../componentes";
import ColumnChart from "../componentes/charts/columnChart";
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const rutinas = [
    { id: 1, nombre: "RUTINA A", descripcion: "PECHO Y TRÍCEPS" },
    { id: 2, nombre: "RUTINA B", descripcion: "ESPALDA Y BÍCEPS" },
    { id: 3, nombre: "RUTINA C", descripcion: "PIERNA" },
  ];

  const diasSemana = [
    { dia: "L", valor1: 1860 },
    { dia: "M", valor1: 2380 },
    { dia: "X", valor1: 2220 },
    { dia: "J", valor1: 4590 },
    { dia: "V", valor1: 1250 },
    { dia: "S", valor1: 0 },
    { dia: "D", valor1: 6220 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        <TituloPagina titulo="Panel de Control" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rutinas.map((rutina) => (
            <Link key={rutina.id} to="/mis-rutinas/entrenamiento" className="block group">
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 group-hover:border-[--color-accent]/30"
                style={{ '--color-primary': 'var(--color-primary)' } as React.CSSProperties}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
                }}
              >

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-[--color-primary] group-hover:border-[--color-primary]"
                    style={{ backgroundColor: 'var(--color-primary-muted)', border: '1px solid var(--color-primary-muted)' }}>
                    <span className="font-black italic text-xs transition-colors duration-300 group-hover:text-black" style={{ color: 'var(--color-primary)' }}>GO</span>
                  </div>
                  <div>
                    <h3 className="font-black text-white italic uppercase text-sm tracking-tighter">{rutina.nombre}</h3>
                    <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest">{rutina.descripcion}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full border-2 border-white/5 p-1 shrink-0">
              <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center"
                style={{ border: '1px solid var(--color-primary)', boxShadow: '0 0 20px var(--color-primary-glow)' }}>
                <div className="text-center">
                  <p className="font-black italic text-xs leading-tight" style={{ color: 'var(--color-primary)' }}>STATS</p>
                  <p className="text-white font-black italic text-[10px] uppercase opacity-50">Semanal</p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full min-w-0">
              <div className="mb-4 text-center md:text-left">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
                  Volumen por Sesión
                </span>
              </div>
              <div className="h-[220px] w-full">
                <ColumnChart
                  data={diasSemana}
                  xAxisKey="dia"
                  bars={[
                    { key: "valor1", color: "var(--color-primary)", name: "Kcal" },
                  ]}
                  height="100%"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Semanas Activo", val: "12" },
            { label: "PR Peso Muerto", val: "180KG" },
            { label: "Racha Actual", val: "5 DÍAS" },
            { label: "Nivel", val: "15" }
          ].map((item, i) => (
            <div key={i} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-xl text-center">
              <p className="text-neutral-500 text-[8px] font-black uppercase tracking-widest mb-1 italic">{item.label}</p>
              <p className="text-white font-black italic text-lg">{item.val}</p>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}