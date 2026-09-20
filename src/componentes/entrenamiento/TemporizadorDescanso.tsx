import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, X, Plus, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface TemporizadorDescansoProps {
  segundosIniciales: number;
  ejercicioNombre?: string;
  onTerminar?: () => void;
  onCerrar: () => void;
}

// Generador de sonido sintético con Web Audio API (sin dependencias externas)
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

  // Duración total de referencia para la barra de progreso
  const [totalSegundos, setTotalSegundos] = useState(segundosIniciales);
  // Segundos restantes calculados y visualizados
  const [segundos, setSegundos] = useState(segundosIniciales);
  const [pausado, setPausado] = useState(false);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(true);

  // Timestamp absoluto (ms) en el que debe finalizar el descanso
  const targetEndTimeRef = useRef<number>(Date.now() + segundosIniciales * 1000);
  // Guardado del tiempo restante cuando se encuentra pausado
  const restantePausaRef = useRef<number>(segundosIniciales);
  // Banderas para controlar alertas únicas
  const haTerminadoRef = useRef<boolean>(false);
  const ultimoSegundoAvisadoRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const originalTitleRef = useRef<string>(typeof document !== 'undefined' ? document.title : '');

  // Solicitar permiso de notificaciones para cuando la pestaña esté en segundo plano
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Formato mm:ss
  const formatTiempo = (s: number) => {
    const min = Math.floor(Math.max(0, s) / 60);
    const seg = Math.max(0, s) % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
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

    // Notificación nativa si la pestaña está en segundo plano o pantalla bloqueada
    if (
      typeof document !== 'undefined' &&
      document.visibilityState === 'hidden' &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification('DailySet - Descanso finalizado', {
          body: ejercicioNombre
            ? `Tiempo cumplido. Próxima serie: ${ejercicioNombre}`
            : 'Tu tiempo de descanso ha finalizado. Es momento de la siguiente serie.',
          tag: 'descanso-terminado',
        });
      } catch {
        // ignorar
      }
    }
  }, [sonidoHabilitado, ejercicioNombre]);

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

  // Cálculo síncrono basado en timestamps (inmune a throttling de segundo plano)
  const actualizarPorTimestamp = useCallback(() => {
    if (pausado || haTerminadoRef.current) return;

    const ahora = Date.now();
    const diffMs = targetEndTimeRef.current - ahora;
    const restante = Math.max(0, Math.ceil(diffMs / 1000));

    setSegundos(restante);

    // Beeps en 3, 2, 1
    if (restante >= 1 && restante <= 3 && ultimoSegundoAvisadoRef.current !== restante) {
      ultimoSegundoAvisadoRef.current = restante;
      avisarCuentaAtras(restante);
    }

    // Finalización exacta
    if (diffMs <= 0 && !haTerminadoRef.current) {
      haTerminadoRef.current = true;
      if (timerRef.current) window.clearInterval(timerRef.current);
      setSegundos(0);
      avisarFinalizacion();
      if (onTerminar) onTerminar();
    }
  }, [pausado, avisarCuentaAtras, avisarFinalizacion, onTerminar]);

  // Intervalo de alta frecuencia (250ms) que calcula contra Date.now()
  useEffect(() => {
    if (pausado || haTerminadoRef.current) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }

    actualizarPorTimestamp();
    timerRef.current = window.setInterval(actualizarPorTimestamp, 250);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [pausado, actualizarPorTimestamp]);

  // Eventos de visibilidad y foco: sincronización inmediata al desbloquear pantalla o volver a la pestaña
  useEffect(() => {
    const sincronizarInmediato = () => {
      if (pausado || haTerminadoRef.current) return;
      actualizarPorTimestamp();
    };

    document.addEventListener('visibilitychange', sincronizarInmediato);
    window.addEventListener('focus', sincronizarInmediato);
    window.addEventListener('pageshow', sincronizarInmediato);

    return () => {
      document.removeEventListener('visibilitychange', sincronizarInmediato);
      window.removeEventListener('focus', sincronizarInmediato);
      window.removeEventListener('pageshow', sincronizarInmediato);
    };
  }, [pausado, actualizarPorTimestamp]);

  // Actualización del título del navegador para monitorear el descanso desde otra pestaña
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (segundos > 0) {
      document.title = `(${formatTiempo(segundos)}) ${locale === 'es' ? 'Descanso' : 'Rest'} | DailySet`;
    } else {
      document.title = `(Listo) ${locale === 'es' ? '¡Descanso terminado!' : 'Rest finished!'} | DailySet`;
    }

    return () => {
      document.title = originalTitleRef.current || 'DailySet';
    };
  }, [segundos, locale]);

  // Pausar y reanudar con timestamps
  const togglePausa = () => {
    if (pausado) {
      // Reanudar calculando nuevo final absoluto a partir del tiempo restante
      targetEndTimeRef.current = Date.now() + restantePausaRef.current * 1000;
      haTerminadoRef.current = false;
      setPausado(false);
    } else {
      // Pausar guardando los segundos restantes
      const ahora = Date.now();
      const diffMs = targetEndTimeRef.current - ahora;
      const rem = Math.max(0, Math.ceil(diffMs / 1000));
      restantePausaRef.current = rem;
      setSegundos(rem);
      setPausado(true);
    }
  };

  // Añadir tiempo (+15s, +30s)
  const agregarTiempo = (extra: number) => {
    if (haTerminadoRef.current || segundos <= 0) {
      reiniciar(extra);
      return;
    }

    if (pausado) {
      restantePausaRef.current = Math.max(5, restantePausaRef.current + extra);
      setSegundos(restantePausaRef.current);
      setTotalSegundos(prev => Math.max(prev, restantePausaRef.current));
    } else {
      targetEndTimeRef.current += extra * 1000;
      const nuevoRestante = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
      setSegundos(nuevoRestante);
      setTotalSegundos(prev => Math.max(prev, nuevoRestante));
      haTerminadoRef.current = false;
    }
  };

  // Reiniciar temporizador
  const reiniciar = (nuevosSegundos?: number) => {
    const s = nuevosSegundos ?? totalSegundos;
    targetEndTimeRef.current = Date.now() + s * 1000;
    restantePausaRef.current = s;
    haTerminadoRef.current = false;
    ultimoSegundoAvisadoRef.current = null;
    setSegundos(s);
    setTotalSegundos(s);
    setPausado(false);
  };

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
              type="button"
              onClick={() => setSonidoHabilitado(!sonidoHabilitado)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={sonidoHabilitado ? 'Silenciar' : 'Activar sonido'}
            >
              {sonidoHabilitado ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            {/* Cerrar / Saltar */}
            <button
              type="button"
              onClick={onCerrar}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                type="button"
                onClick={togglePausa}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
                title={pausado ? 'Reanudar' : 'Pausar'}
              >
                {pausado ? <Play size={15} fill="white" /> : <Pause size={15} fill="white" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => reiniciar(totalSegundos)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
                title="Repetir descanso"
              >
                <RotateCcw size={15} />
              </button>
            )}

            <button
              type="button"
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
              type="button"
              onClick={() => agregarTiempo(15)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-bold transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <Plus size={11} /> 15s
            </button>
            <button
              type="button"
              onClick={() => agregarTiempo(30)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 font-bold transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <Plus size={11} /> 30s
            </button>
          </div>

          {/* Presets rápidos */}
          <div className="flex items-center gap-1 text-neutral-400">
            {[60, 90, 120].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => reiniciar(s)}
                className={`px-2 py-0.5 rounded-md font-semibold text-[10px] transition-colors cursor-pointer ${
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
