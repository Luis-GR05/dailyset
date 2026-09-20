import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface MonthYearPickerProps {
  mes: number;         // 0-11
  anio: number;
  aniosDisponibles: number[];
  localeStr: string;
  onChange: (mes: number, anio: number) => void;
  /** Texto de etiqueta debajo del nombre del mes */
  sublabel?: string;
}

export default function MonthYearPicker({
  mes,
  anio,
  aniosDisponibles,
  localeStr,
  onChange,
  sublabel,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [anioVista, setAnioVista] = useState(anio);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Sincronizar año de vista cuando cambia la prop
  useEffect(() => {
    setAnioVista(anio);
  }, [anio]);

  const nombreMes = new Date(anio, mes).toLocaleString(localeStr, { month: 'long' });

  const meses = Array.from({ length: 12 }, (_, m) => ({
    value: m,
    corto: new Date(anioVista, m).toLocaleString(localeStr, { month: 'short' }),
    largo: new Date(anioVista, m).toLocaleString(localeStr, { month: 'long' }),
  }));

  const canPrev = aniosDisponibles.length === 0 || anioVista > Math.min(...aniosDisponibles);
  const canNext = aniosDisponibles.length === 0 || anioVista < Math.max(...aniosDisponibles);

  const handleSelect = (m: number) => {
    onChange(m, anioVista);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
        title="Seleccionar mes y año"
      >
        <CalendarDays size={14} className="text-[var(--color-primary)] shrink-0" />
        <div className="text-left">
          <span className="text-sm font-bold text-white capitalize leading-none">{nombreMes}</span>
          <span className="text-xs text-neutral-400 ml-1.5 font-mono">{anio}</span>
        </div>
        {sublabel && (
          <span className="hidden sm:block text-[10px] text-neutral-500 ml-1">· {sublabel}</span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/60 backdrop-blur-xl animate-fadeIn"
          style={{ minWidth: '17rem' }}
        >
          {/* Cabecera: navegación de año */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <button
              onClick={() => setAnioVista(v => v - 1)}
              disabled={!canPrev}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                // Ciclar por los años disponibles al hacer click en el año
                const idx = aniosDisponibles.indexOf(anioVista);
                if (idx >= 0 && aniosDisponibles.length > 1) {
                  setAnioVista(aniosDisponibles[(idx + 1) % aniosDisponibles.length]);
                }
              }}
              className="text-base font-black text-white hover:text-[var(--color-primary)] transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5"
            >
              {anioVista}
            </button>
            <button
              onClick={() => setAnioVista(v => v + 1)}
              disabled={!canNext}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Grid de 12 meses */}
          <div className="grid grid-cols-3 gap-1.5 p-3">
            {meses.map(m => {
              const esSeleccionado = m.value === mes && anioVista === anio;
              return (
                <button
                  key={m.value}
                  onClick={() => handleSelect(m.value)}
                  className={`px-2 py-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    esSeleccionado
                      ? 'bg-[var(--color-primary)] text-black shadow-md'
                      : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {m.corto}
                </button>
              );
            })}
          </div>

          {/* Pie: ir al mes actual */}
          <div className="px-3 pb-3">
            <button
              onClick={() => {
                const now = new Date();
                onChange(now.getMonth(), now.getFullYear());
                setOpen(false);
              }}
              className="w-full py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer border border-white/5 hover:border-white/10"
            >
              {localeStr === 'es-ES' ? 'Ir al mes actual' : 'Go to current month'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
