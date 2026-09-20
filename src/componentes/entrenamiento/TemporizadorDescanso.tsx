import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, X, Plus, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface TemporizadorDescansoProps {
  segundosIniciales: number;
  ejercicioNombre?: string;
  onTerminar?: () => void;
  onCerrar: () => void;
}

// Generador de sonido sintético con Web Audio API (sin archivos de audio externos)
function reproducirBip(frecuencia = 800, duracion = 0.12, tipo: OscillatorType = 'sine') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = tipo;
    osc.frequency.setValueAtTime(frecuencia, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracion);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duracion);
  } catch {
    // Ignorar si el navegador bloquea audio por falta de interacción
  }
}

export default function TemporizadorDescanso({
  segundosIniciales = 90,
  ejercicioNombre,
  onTerminar,
  onCerrar,
}: TemporizadorDescansoProps) {
  const { locale } = useI18n();
  const [segundos, setSegundos] = useState(segundosIniciales);
  const [totalSegundos, setTotalSegundos] = useState(segundosIniciales);
  const [pausado, setPausado] = useState(false);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(true);

  const timerRef = useRef<number | null>(null);

  // Formato mm:ss
  const formatTiempo = (s: number) => {
    const min = Math.floor(Math.max(0, s) / 60);
    const seg = Math.max(0, s) % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  const agregarTiempo = (extra: number) => {
    setSegundos(prev => Math.max(5, prev + extra));
    setTotalSegundos(prev => Math.max(prev, prev + extra));
  };

  const reiniciar = (nuevosSegundos?: number) => {
    const s = nuevosSegundos ?? totalSegundos;
    setSegundos(s);
    setTotalSegundos(s);
    setPausado(false);
  };

  // Sonido y vibración al terminar
  const avisarFinalizacion = useCallback(() => {
    if (sonidoHabilitado) {
      reproducirBip(880, 0.2, 'triangle');
      setTimeout(() => reproducirBip(1100, 0.35, 'triangle'), 220);
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 300]);
      } catch {
        // ignorar
      }
    }
  }, [sonidoHabilitado]);

  // Bips en los últimos 3 segundos
  const avisarCuentaAtras = useCallback((seg: number) => {
    if (sonidoHabilitado && seg >= 1 && seg <= 3) {
      reproducirBip(650, 0.08, 'sine');
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(60);
        } catch {}
      }
    }
  }, [sonidoHabilitado]);

  useEffect(() => {
    if (pausado) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSegundos(prev => {
        const next = prev - 1;
        if (next <= 3 && next > 0) {
          avisarCuentaAtras(next);
        }
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          avisarFinalizacion();
          if (onTerminar) onTerminar();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pausado, avisarCuentaAtras, avisarFinalizacion, onTerminar]);

  const porcentaje = totalSegundos > 0 ? Math.min(100, Math.max(0, (segundos / totalSegundos) * 100)) : 0;
  const terminado = segundos <= 0;

  return (
    <div
      className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div
        className="p-4 rounded-2xl bg-[#121214]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-3"
      >
        {/* Cabecera del temporizador */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-2 h-2 rounded-full ${terminado ? 'bg-red-500 animate-ping' : 'animate-pulse'}`}
              style={{ backgroundColor: terminado ? '#ef4444' : 'var(--color-primary)' }}
            />
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300 truncate">
              {terminado
                ? (locale === 'es' ? '¡Descanso terminado!' : 'Rest finished!')
                : (locale === 'es' ? 'Tiempo de Descanso' : 'Rest Timer')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Toggle sonido */}
            <button
              onClick={() => setSonidoHabilitado(!sonidoHabilitado)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              title={sonidoHabilitado ? 'Silenciar' : 'Activar sonido'}
            >
              {sonidoHabilitado ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            {/* Cerrar / Saltar */}
            <button
              onClick={onCerrar}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title={locale === 'es' ? 'Omitir descanso' : 'Skip rest'}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Ejercicio de referencia si existe */}
        {ejercicioNombre && (
          <p className="text-[11px] text-neutral-400 truncate -mt-1">
            {locale === 'es' ? 'Próxima serie:' : 'Next set:'}{' '}
            <strong className="text-neutral-200">{ejercicioNombre}</strong>
          </p>
        )}

        {/* Reloj y barra de progreso */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono font-black text-3xl sm:text-4xl tracking-tight transition-colors"
              style={{ color: terminado ? '#ef4444' : (segundos <= 5 ? '#f59e0b' : 'var(--color-white)') }}
            >
              {formatTiempo(segundos)}
            </span>
            <span className="text-[11px] text-neutral-500 font-bold">
              / {formatTiempo(totalSegundos)}
            </span>
          </div>

          {/* Botones de control primarios */}
          <div className="flex items-center gap-1.5">
            {!terminado ? (
              <button
                onClick={() => setPausado(!pausado)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
                title={pausado ? 'Reanudar' : 'Pausar'}
              >
                {pausado ? <Play size={15} fill="white" /> : <Pause size={15} fill="white" />}
              </button>
            ) : (
              <button
                onClick={() => reiniciar(totalSegundos)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
                title="Repetir descanso"
              >
                <RotateCcw size={15} />
              </button>
            )}

            <button
              onClick={onCerrar}
              className="h-9 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
              style={{ background: 'var(--color-primary)', color: '#000000' }}
            >
              <span>{locale === 'es' ? 'Listo' : 'Done'}</span>
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${porcentaje}%`,
              backgroundColor: terminado ? '#ef4444' : (segundos <= 5 ? '#f59e0b' : 'var(--color-primary)'),
            }}
          />
        </div>

        {/* Acciones rápidas (+15s, +30s, presets) */}
        <div className="flex items-center justify-between gap-1 pt-0.5 text-[11px]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => agregarTiempo(15)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-bold transition-colors flex items-center gap-0.5"
            >
              <Plus size={11} /> 15s
            </button>
            <button
              onClick={() => agregarTiempo(30)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-bold transition-colors flex items-center gap-0.5"
            >
              <Plus size={11} /> 30s
            </button>
          </div>

          {/* Presets rápidos */}
          <div className="flex items-center gap-1 text-neutral-400">
            {[60, 90, 120].map(s => (
              <button
                key={s}
                onClick={() => reiniciar(s)}
                className={`px-2 py-0.5 rounded-md font-semibold text-[10px] transition-colors ${
                  totalSegundos === s ? 'text-black font-black' : 'text-neutral-400 hover:text-white bg-white/5'
                }`}
                style={totalSegundos === s ? { background: 'var(--color-primary)' } : {}}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
