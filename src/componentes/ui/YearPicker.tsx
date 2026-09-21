import { useState, useRef, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';

interface YearPickerProps {
  anio: number;
  aniosDisponibles: number[];
  onChange: (anio: number) => void;
  locale?: 'es' | 'en';
  sublabel?: string;
  className?: string;
}

export default function YearPicker({
  anio,
  aniosDisponibles,
  onChange,
  locale = 'es',
  sublabel,
  className = '',
}: YearPickerProps) {
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

  // Rango de años: mínimo disponible hasta máximo disponible, garantizando al menos los últimos 5 años
  const currentY = new Date().getFullYear();
  const minAnio = aniosDisponibles.length > 0 ? Math.min(...aniosDisponibles, currentY - 4) : currentY - 4;
  const maxAnio = aniosDisponibles.length > 0 ? Math.max(...aniosDisponibles, currentY) : currentY;
  const aniosRango = Array.from({ length: maxAnio - minAnio + 1 }, (_, i) => maxAnio - i);

  const handleSelect = (y: number) => {
    onChange(y);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${open ? 'z-50' : 'z-10'} ${className}`}>
      {/* Trigger: Botón idéntico con icono de calendario */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
        title={locale === 'es' ? 'Seleccionar año' : 'Select year'}
      >
        <CalendarDays size={14} className="text-[var(--color-primary)] shrink-0" />
        <div className="text-left">
          <span className="text-sm font-bold text-white font-mono leading-none">{anio}</span>
        </div>
        {sublabel && (
          <span className="hidden sm:block text-[10px] text-neutral-500 ml-1">· {sublabel}</span>
        )}
      </button>

      {/* Popover con calendario de años */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-[100] w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-[#0e0e0e] shadow-2xl shadow-black/95 backdrop-blur-2xl animate-fadeIn p-3"
          style={{ minWidth: '15rem' }}
        >
          {/* Cabecera del popover */}
          <div className="flex items-center justify-between px-2 py-2 border-b border-white/8 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
              {locale === 'es' ? 'Seleccionar Año' : 'Select Year'}
            </span>
            <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
              {anio}
            </span>
          </div>

          {/* Grid de años */}
          <div className="grid grid-cols-3 gap-1.5 py-1">
            {aniosRango.map(y => {
              const esSeleccionado = y === anio;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleSelect(y)}
                  className={`py-2.5 px-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    esSeleccionado
                      ? 'bg-[var(--color-primary)] text-black shadow-md'
                      : aniosDisponibles.includes(y)
                        ? 'text-white hover:bg-white/10'
                        : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {y}
                </button>
              );
            })}
          </div>

          {/* Botón rápido: Ir al año actual */}
          <div className="pt-2 mt-2 border-t border-white/8">
            <button
              type="button"
              onClick={() => {
                handleSelect(new Date().getFullYear());
              }}
              className="w-full py-2 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer border border-white/5 hover:border-white/10"
            >
              {locale === 'es' ? 'Ir al año actual' : 'Go to current year'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
