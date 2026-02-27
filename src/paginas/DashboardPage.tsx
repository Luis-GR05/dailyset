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
<<<<<<< HEAD
            <Link key={rutina.id} to="/mis-rutinas/entrenamiento" className="block">
              <Card
                className={`p-6 h-full ${rutina.seleccionada ? "border-[#DBF059]" : ""}`}
              >
=======
            <Link key={rutina.id} to="/mis-rutinas/entrenamiento" className="block group">
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl group-hover:border-[#DBF059]/30 transition-all duration-300">
>>>>>>> 0b7ad143dc4c351c7c88a096873f9bfb9ea00514
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#DBF059]/10 border border-[#DBF059]/20 rounded-xl flex items-center justify-center">
                    <span className="text-[#DBF059] font-black italic text-xs">GO</span>
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
            <div className="w-32 h-32 rounded-full border-2 border-white/5 p-1 flex-shrink-0">
              <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center border border-[#DBF059] shadow-[0_0_20px_rgba(219,240,89,0.1)]">
                <div className="text-center">
                  <p className="text-[#DBF059] font-black italic text-xs leading-tight">STATS</p>
                  <p className="text-white font-black italic text-[10px] uppercase opacity-50">Semanal</p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full h-72">
              <div className="mb-4">
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
                  Volumen por Sesión
                </span>
              </div>
              <ColumnChart
                data={diasSemana}
                xAxisKey="dia"
                bars={[
                  { key: "valor1", color: "#DBF059", name: "Kcal" },
                ]}
              />
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