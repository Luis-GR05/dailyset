import { useState } from 'react';
import { AppLayout, TituloPagina, MesCalendario } from "../componentes";

export default function HistorialPage() {
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setDropdownAbierto(dropdownAbierto === id ? null : id);
  };

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
      <div className="flex flex-col min-h-[calc(100vh-150px)] relative">
        <div className="sticky top-0 z-30 bg-[var(--color-neutral-700)] pb-4 pt-2 -mt-2">
          <TituloPagina titulo="Historial de entrenamientos" />
        </div>

        <div className="flex-1 pb-32">
          <div className="space-y-8">
            {meses.map((data, index) => (
              <MesCalendario
                key={index}
                mes={data.mes}
                anio={data.anio}
                entrenamientos={data.entrenamientos}
              />
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 mt-auto z-40 bg-[var(--color-neutral-700)] border-t border-neutral-800 p-4 space-y-2 -mx-4 md:-mx-8 mb-[-1rem] md:mb-[-2rem] pb-4 md:pb-8">
          <div className="px-4 md:px-8 space-y-2">
            <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
              <button
                onClick={() => toggleDropdown('volumen')}
                className="w-full flex items-center justify-between p-4 text-white hover:bg-neutral-800 transition-all font-bold"
              >
                <span>Volumen Mensual</span>
                <svg
                  className={`w-5 h-5 transition-transform ${dropdownAbierto === 'volumen' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownAbierto === 'volumen' && (
                <div className="p-4 border-t border-neutral-800 bg-neutral-900 animate-fadeIn">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-400 text-sm">Total este mes:</span>
                    <span className="text-[#DBF059] font-bold">45,000 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 text-sm">Vs mes anterior:</span>
                    <span className="text-green-500 font-bold text-sm">+12%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
              <button
                onClick={() => toggleDropdown('dias')}
                className="w-full flex items-center justify-between p-4 text-white hover:bg-neutral-800 transition-all font-bold"
              >
                <span>Día de Entrenamientos</span>
                <svg
                  className={`w-5 h-5 transition-transform ${dropdownAbierto === 'dias' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownAbierto === 'dias' && (
                <div className="p-4 border-t border-neutral-800 bg-neutral-900 animate-fadeIn">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-400 text-sm">Sesiones completadas:</span>
                    <span className="text-white font-bold">14</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 text-sm">Promedio semanal:</span>
                    <span className="text-white font-bold">3.5</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}