import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearPickerProps {
  anio: number;
  aniosDisponibles: number[];
  onChange: (anio: number) => void;
  className?: string;
}

export default function YearPicker({ anio, aniosDisponibles, onChange, className = '' }: YearPickerProps) {
  const [open, setOpen] = useState(false);
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

  // Generar un rango de años: mínimo de los disponibles hasta el máximo + algunos futuros
  const minAnio = aniosDisponibles.length > 0 ? Math.min(...aniosDisponibles) : anio - 3;
  const maxAnio = aniosDisponibles.length > 0 ? Math.max(...aniosDisponibles) : anio + 2;
  const aniosRango = Array.from({ length: maxAnio - minAnio + 1 }, (_, i) => minAnio + i).reverse();

  const canPrev = anio > minAnio;
  const canNext = anio < maxAnio;

  const handleSelect = (y: number) => {
    onChange(y);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Trigger: el año grande y clickable */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => canPrev && onChange(anio - 1)}
          disabled={!canPrev}
          className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/8 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setOpen(v => !v)}
          className="relative group"
          title="Seleccionar año"
        >
          <span className={`text-5xl font-black tracking-tighter leading-none select-none transition-colors ${
            open ? 'text-[var(--color-primary)]' : 'text-white group-hover:text-[var(--color-primary)]'
          }`}>
            {anio}
          </span>
          <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-primary)] transition-opacity ${
            open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`} />
        </button>

        <button
          onClick={() => canNext && onChange(anio + 1)}
          disabled={!canNext}
          className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/8 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Popover con grid de años */}
      {open && (
        <div
          className="absolute right-0 top-full mt-3 z-50 rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/60 backdrop-blur-xl animate-fadeIn"
          style={{ minWidth: '14rem' }}
        >
          <div className="p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 px-1">
              Seleccionar año
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {aniosRango.map(y => (
                <button
                  key={y}
                  onClick={() => handleSelect(y)}
                  className={`px-2 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    y === anio
                      ? 'bg-[var(--color-primary)] text-black shadow-md'
                      : aniosDisponibles.includes(y)
                        ? 'text-white hover:bg-white/10'
                        : 'text-neutral-600 hover:bg-white/5 hover:text-neutral-400'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
