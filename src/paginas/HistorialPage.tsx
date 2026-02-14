import { AppLayout, TituloPagina, MonthCard, ResumenEstadisticas } from "../componentes";

export default function HistorialPage() {
  const meses = [
    { mes: 0, anio: 2026, entrenamientos: [2, 5, 8, 12, 15, 19, 22, 26, 29] },
    { mes: 11, anio: 2025, entrenamientos: [1, 4, 7, 11, 14, 18, 21, 25, 28] },
    { mes: 10, anio: 2025, entrenamientos: [3, 6, 10, 13, 17, 20, 24, 27] },
    { mes: 9, anio: 2025, entrenamientos: [2, 5, 9, 12, 16, 19, 23, 26, 30] },
    { mes: 8, anio: 2025, entrenamientos: [1, 4, 8, 11, 15, 18, 22, 25, 29] },
    { mes: 7, anio: 2025, entrenamientos: [3, 7, 10, 14, 17, 21, 24, 28, 31] },
  ];

  return (
    <AppLayout>
      <div className="-m-4 md:-m-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">

        <div className="shrink-0 p-4 md:p-8 pb-4 bg-[var(--color-neutral-700)] z-20 shadow-sm relative">
          <div className="max-w-5xl mx-auto">
            <TituloPagina titulo="Historial de entrenamientos" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 no-scrollbar">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {meses.map((data, index) => (
                <MonthCard
                  key={index}
                  mes={data.mes}
                  anio={data.anio}
                  entrenamientos={data.entrenamientos}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-4 md:p-8 pt-4 bg-[var(--color-neutral-700)] z-20 border-t border-neutral-800">
          <div className="max-w-5xl mx-auto">
            <ResumenEstadisticas />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
