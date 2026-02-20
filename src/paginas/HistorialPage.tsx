import { AppLayout, TituloPagina, MonthCard, ResumenEstadisticas } from "../componentes";
import { useHistorial } from "../context/HistorialContext";

// Generar los últimos 12 meses desde el mes actual
function getUltimos12Meses() {
  const meses = [];
  const ahora = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    meses.push({ mes: d.getMonth(), anio: d.getFullYear() });
  }
  return meses;
}

const MESES = getUltimos12Meses();

export default function HistorialPage() {
  const { metricas } = useHistorial();

  return (
    <AppLayout>
      <div className="-m-4 md:-m-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">

        <div className="shrink-0 p-4 md:p-8 pb-4 bg-[var(--color-neutral-700)] z-20">
          <div className="max-w-5xl mx-auto">
            <TituloPagina titulo="Historial de entrenamientos" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {MESES.map((m, i) => (
                <MonthCard key={i} mes={m.mes} anio={m.anio} />
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-4 md:p-8 pt-4 bg-[var(--color-neutral-700)] z-20 border-t border-neutral-800">
          <div className="max-w-5xl mx-auto">
            <ResumenEstadisticas
              volumenTotalKg={metricas.volumenTotalKg}
              intensidad={metricas.intensidad}
              disciplinaPct={metricas.disciplinaPct}
            />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
