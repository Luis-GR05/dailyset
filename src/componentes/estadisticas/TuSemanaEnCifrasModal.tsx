// src/componentes/estadisticas/TuSemanaEnCifrasModal.tsx
// Pantalla interactiva "Tu semana en cifras" y "Tu mes en cifras" diseñada para compartir

import { useState, useMemo } from 'react';
import { useHistorial, type Sesion } from '../../context/HistorialContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import Logo from '../shared/Logo';
import {
  X,
  Share2,
  Copy,
  Check,
  Flame,
  Dumbbell,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Zap,
  Sparkles,
} from 'lucide-react';

interface TuSemanaEnCifrasModalProps {
  abierto: boolean;
  onCerrar: () => void;
  tipoInicial?: 'semana' | 'mes';
}

type PeriodoTipo = 'semana' | 'mes';

export default function TuSemanaEnCifrasModal({
  abierto,
  onCerrar,
  tipoInicial = 'semana',
}: TuSemanaEnCifrasModalProps) {
  const { user } = useAuth();
  const { sesiones } = useHistorial();
  const { locale } = useI18n();

  const [periodoTipo, setPeriodoTipo] = useState<PeriodoTipo>(tipoInicial);
  // Offset: 0 = actual, -1 = anterior, etc.
  const [offsetPeriodo, setOffsetPeriodo] = useState<number>(0);
  const [copiado, setCopiado] = useState(false);

  // Helper para formatear fechas
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const toYYYYMMDD = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  // Calcular el rango del período seleccionado
  const { fechaInicioStr, fechaFinStr, etiquetaPeriodo, subtituloPeriodo } = useMemo(() => {
    const ahora = new Date();

    if (periodoTipo === 'semana') {
      // Determinar lunes de la semana actual + offset
      const diaActual = (ahora.getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
      const inicio = new Date(ahora);
      inicio.setDate(ahora.getDate() - diaActual + offsetPeriodo * 7);
      inicio.setHours(0, 0, 0, 0);

      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      fin.setHours(23, 59, 59, 999);

      const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      const inicioTxt = inicio.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', formatOptions);
      const finTxt = fin.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { ...formatOptions, year: 'numeric' });

      const etiqueta = offsetPeriodo === 0
        ? (locale === 'es' ? 'Esta semana' : 'This week')
        : offsetPeriodo === -1
        ? (locale === 'es' ? 'Semana pasada' : 'Last week')
        : `${inicioTxt} - ${finTxt}`;

      return {
        fechaInicioStr: toYYYYMMDD(inicio),
        fechaFinStr: toYYYYMMDD(fin),
        etiquetaPeriodo: etiqueta,
        subtituloPeriodo: `${inicioTxt} — ${finTxt}`,
      };
    } else {
      // Mes actual + offset
      const d = new Date(ahora.getFullYear(), ahora.getMonth() + offsetPeriodo, 1);
      const inicio = new Date(d.getFullYear(), d.getMonth(), 1);
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const nombreMes = d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
      const etiqueta = offsetPeriodo === 0
        ? (locale === 'es' ? 'Este mes' : 'This month')
        : offsetPeriodo === -1
        ? (locale === 'es' ? 'Mes pasado' : 'Last month')
        : nombreMes;

      return {
        fechaInicioStr: toYYYYMMDD(inicio),
        fechaFinStr: toYYYYMMDD(fin),
        etiquetaPeriodo: etiqueta,
        subtituloPeriodo: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
      };
    }
  }, [periodoTipo, offsetPeriodo, locale]);

  // Filtrar sesiones en el período
  const sesionesPeriodo = useMemo(() => {
    return sesiones.filter(s => s.fecha >= fechaInicioStr && s.fecha <= fechaFinStr);
  }, [sesiones, fechaInicioStr, fechaFinStr]);

  // Métricas avanzadas
  const metricas = useMemo(() => {
    let volumenTotal = 0;
    let seriesTotal = 0;
    let repsTotal = 0;
    let minutosTotal = 0;
    const conteoEjercicios: Record<string, { veces: number; volumen: number }> = {};

    sesionesPeriodo.forEach((s: Sesion) => {
      minutosTotal += s.duracionMin || 0;
      (s.ejercicios || []).forEach(ej => {
        const nombreEj = ej.nombre || 'Ejercicio';
        if (!conteoEjercicios[nombreEj]) {
          conteoEjercicios[nombreEj] = { veces: 0, volumen: 0 };
        }
        conteoEjercicios[nombreEj].veces += 1;

        (ej.series || []).forEach(sr => {
          seriesTotal += 1;
          repsTotal += sr.reps || 0;
          const volSerie = (sr.kg || 0) * (sr.reps || 0);
          volumenTotal += volSerie;
          conteoEjercicios[nombreEj].volumen += volSerie;
        });
      });
    });

    // Encontrar ejercicio estrella (por mayor volumen levantado)
    let ejercicioEstrella = { nombre: '—', volumen: 0, veces: 0 };
    Object.entries(conteoEjercicios).forEach(([nom, data]) => {
      if (data.volumen > ejercicioEstrella.volumen) {
        ejercicioEstrella = { nombre: nom, volumen: data.volumen, veces: data.veces };
      }
    });

    // Formatear duración en horas y minutos
    const horas = Math.floor(minutosTotal / 60);
    const mins = minutosTotal % 60;
    const duracionStr = horas > 0
      ? `${horas}h ${mins > 0 ? `${mins}m` : ''}`
      : `${mins} min`;

    // Comparativa divertida de volumen
    let equivalenciaVolumen = '';
    if (volumenTotal >= 50000) {
      const coches = (volumenTotal / 1400).toFixed(0);
      equivalenciaVolumen = locale === 'es'
        ? `Equivalente al peso de ${coches} coches compactos`
        : `Equivalent to lifting ${coches} cars`;
    } else if (volumenTotal >= 15000) {
      const elefantes = (volumenTotal / 5000).toFixed(1);
      equivalenciaVolumen = locale === 'es'
        ? `Equivalente al peso de ${elefantes} elefantes africanos`
        : `Equivalent to ${elefantes} African elephants`;
    } else if (volumenTotal >= 4000) {
      const rinocerontes = (volumenTotal / 2000).toFixed(1);
      equivalenciaVolumen = locale === 'es'
        ? `Equivalente a levantar ${rinocerontes} rinocerontes blancos`
        : `Equivalent to ${rinocerontes} white rhinos`;
    } else if (volumenTotal >= 800) {
      equivalenciaVolumen = locale === 'es'
        ? 'Equivalente al peso de un caballo de tiro'
        : 'Equivalent to a draft horse';
    } else if (volumenTotal > 0) {
      equivalenciaVolumen = locale === 'es'
        ? 'Cimientos de acero para una nueva marca'
        : 'Steel foundation for a new milestone';
    } else {
      equivalenciaVolumen = locale === 'es'
        ? 'Listo para iniciar el próximo desafío'
        : 'Ready for the next challenge';
    }

    // Arquetipo de Atleta según entrenamientos
    const totalEntrenos = sesionesPeriodo.length;
    let arquetipo = {
      titulo: locale === 'es' ? 'Atleta en Enfoque' : 'Focused Athlete',
      desc: locale === 'es' ? 'Preparando el terreno para romper récords' : 'Laying the ground to shatter records',
      nivel: 'BRONCE',
      colorGlow: 'rgba(212, 251, 52, 0.4)',
    };

    if (periodoTipo === 'semana') {
      if (totalEntrenos >= 5) {
        arquetipo = {
          titulo: locale === 'es' ? 'Titán del Hierro' : 'Iron Titan',
          desc: locale === 'es' ? 'Frecuencia legendaria y disciplina de acero' : 'Legendary frequency & steel discipline',
          nivel: 'ELITE',
          colorGlow: 'rgba(212, 251, 52, 0.8)',
        };
      } else if (totalEntrenos >= 3) {
        arquetipo = {
          titulo: locale === 'es' ? 'Bestia Imparable' : 'Unstoppable Beast',
          desc: locale === 'es' ? 'Constancia pura y avance implacable' : 'Pure consistency & relentless progress',
          nivel: 'ORO',
          colorGlow: 'rgba(56, 189, 248, 0.8)',
        };
      } else if (totalEntrenos >= 1) {
        arquetipo = {
          titulo: locale === 'es' ? 'Guerrero Constante' : 'Steady Warrior',
          desc: locale === 'es' ? 'Cumpliendo cada repetición programada' : 'Delivering on every programmed rep',
          nivel: 'PLATA',
          colorGlow: 'rgba(255, 100, 34, 0.8)',
        };
      }
    } else {
      if (totalEntrenos >= 18) {
        arquetipo = {
          titulo: locale === 'es' ? 'Máquina de Rendimiento' : 'Performance Machine',
          desc: locale === 'es' ? 'Un mes de dedicación fuera de serie' : 'An extraordinary month of dedication',
          nivel: 'LEGENDARIO',
          colorGlow: 'rgba(212, 251, 52, 0.9)',
        };
      } else if (totalEntrenos >= 12) {
        arquetipo = {
          titulo: locale === 'es' ? 'Atleta Implacable' : 'Relentless Athlete',
          desc: locale === 'es' ? 'Consistencia de campeonato en cada semana' : 'Championship consistency each week',
          nivel: 'ORO',
          colorGlow: 'rgba(56, 189, 248, 0.8)',
        };
      } else if (totalEntrenos >= 4) {
        arquetipo = {
          titulo: locale === 'es' ? 'Constructor de Hábito' : 'Habit Builder',
          desc: locale === 'es' ? 'Sumando volumen paso a paso' : 'Stacking volume step by step',
          nivel: 'PLATA',
          colorGlow: 'rgba(255, 100, 34, 0.8)',
        };
      }
    }

    return {
      totalEntrenos,
      minutosTotal,
      duracionStr,
      volumenTotal,
      seriesTotal,
      repsTotal,
      ejercicioEstrella,
      equivalenciaVolumen,
      arquetipo,
    };
  }, [sesionesPeriodo, periodoTipo, locale]);

  if (!abierto) return null;

  // Texto optimizado para compartir
  const textoCompartir = `DailySet · ${etiquetaPeriodo.toUpperCase()}
Atleta: @${user?.nombre_usuario || user?.nombre || 'atleta'}
Arquetipo: ${metricas.arquetipo.titulo} (${metricas.arquetipo.nivel})

Entrenamientos completados: ${metricas.totalEntrenos}
Tiempo bajo tensión: ${metricas.duracionStr}
Volumen total levantado: ${metricas.volumenTotal.toLocaleString()} kg
Series completadas: ${metricas.seriesTotal} (${metricas.repsTotal} repeticiones)
${metricas.ejercicioEstrella.nombre !== '—' ? `Ejercicio estrella: ${metricas.ejercicioEstrella.nombre}` : ''}

Entrena y supera tus límites en DailySet.`;

  const handleCompartirNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tu ${periodoTipo} en cifras · DailySet`,
          text: textoCompartir,
          url: window.location.origin,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopiarTexto();
        }
      }
    } else {
      handleCopiarTexto();
    }
  };

  const handleCopiarTexto = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(textoCompartir);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  return (
    <div className="modal-overlay z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md" onClick={onCerrar}>
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Barra Superior de Control ── */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md z-10">
          {/* Selector de Período: Semana / Mes */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setPeriodoTipo('semana');
                setOffsetPeriodo(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodoTipo === 'semana'
                  ? 'bg-[var(--color-primary)] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {locale === 'es' ? 'Semana' : 'Week'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodoTipo('mes');
                setOffsetPeriodo(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodoTipo === 'mes'
                  ? 'bg-[var(--color-primary)] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {locale === 'es' ? 'Mes' : 'Month'}
            </button>
          </div>

          {/* Navegación temporal & Botón Cerrar */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOffsetPeriodo(prev => prev - 1)}
              className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={locale === 'es' ? 'Período anterior' : 'Previous period'}
            >
              <ChevronLeft size={16} />
            </button>

            {offsetPeriodo !== 0 && (
              <button
                type="button"
                onClick={() => setOffsetPeriodo(0)}
                className="px-2 py-1 text-[10px] font-bold uppercase rounded-lg bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                title={locale === 'es' ? 'Volver al período actual' : 'Reset to current'}
              >
                {locale === 'es' ? 'Actual' : 'Now'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setOffsetPeriodo(prev => Math.min(0, prev + 1))}
              disabled={offsetPeriodo >= 0}
              className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title={locale === 'es' ? 'Período siguiente' : 'Next period'}
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={onCerrar}
              className="p-1.5 ml-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={locale === 'es' ? 'Cerrar' : 'Close'}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Contenido de la Tarjeta para Compartir (Scrollable) ── */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TARJETA VISUAL TIPO "WRAPPED" PARA COMPARTIR */}
          <div
            id="tarjeta-cifras-share"
            className="relative rounded-3xl p-6 sm:p-7 overflow-hidden border border-neutral-700/60 shadow-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black select-none"
            style={{
              boxShadow: `0 20px 50px -15px ${metricas.arquetipo.colorGlow}`,
            }}
          >
            {/* Brillos ambientales de fondo */}
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[90px] pointer-events-none opacity-40"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-[90px] pointer-events-none opacity-30"
              style={{ backgroundColor: '#38BDF8' }}
            />

            {/* Cabecera de la Tarjeta */}
            <div className="relative flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {periodoTipo === 'semana'
                    ? (locale === 'es' ? 'Semana en cifras' : 'Weekly Wrapped')
                    : (locale === 'es' ? 'Mes en cifras' : 'Monthly Wrapped')}
                </span>
              </div>

              {/* Tag del Atleta */}
              <div className="text-right">
                <p className="text-xs font-black text-white truncate max-w-[140px]">
                  @{user?.nombre_usuario || user?.nombre || 'atleta'}
                </p>
                <p className="text-[10px] font-mono text-neutral-400">
                  {subtituloPeriodo}
                </p>
              </div>
            </div>

            {/* Arquetipo e Insignia Épica */}
            <div className="relative mt-5 text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                <Sparkles size={11} />
                <span>{metricas.arquetipo.nivel}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                {metricas.arquetipo.titulo}
              </h2>

              <p className="text-xs text-neutral-400 max-w-xs mx-auto italic">
                "{metricas.arquetipo.desc}"
              </p>
            </div>

            {/* Métricas Principales en Grid Impactante */}
            <div className="relative grid grid-cols-2 gap-3 mt-6">
              {/* 1. Entrenamientos */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
                  <Flame size={14} className="text-[var(--color-primary)]" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    {locale === 'es' ? 'Entrenamientos' : 'Workouts'}
                  </span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">
                  {metricas.totalEntrenos}
                </p>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {metricas.totalEntrenos > 0
                    ? (locale === 'es' ? 'Sesiones registradas' : 'Logged sessions')
                    : (locale === 'es' ? 'Sin registros' : 'No entries')}
                </span>
              </div>

              {/* 2. Tiempo */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
                  <Clock size={14} className="text-sky-400" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    {locale === 'es' ? 'Tiempo Activo' : 'Active Time'}
                  </span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">
                  {metricas.duracionStr}
                </p>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {locale === 'es' ? 'Bajo tensión' : 'Under tension'}
                </span>
              </div>

              {/* 3. Volumen Levantado */}
              <div className="col-span-2 p-4 rounded-2xl bg-neutral-900/90 border border-white/10 backdrop-blur-md space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                    <Dumbbell size={15} className="text-[var(--color-primary)]" />
                    <span className="font-bold text-[11px] uppercase tracking-wider">
                      {locale === 'es' ? 'Volumen Total' : 'Total Tonnage'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--color-primary)] font-bold">
                    {metricas.seriesTotal} {locale === 'es' ? 'series' : 'sets'}
                  </span>
                </div>

                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {metricas.volumenTotal.toLocaleString()}{' '}
                  <span className="text-base sm:text-lg font-bold text-neutral-400">kg</span>
                </p>

                <p className="text-[11px] text-neutral-300 flex items-center gap-1 pt-0.5">
                  <TrendingUp size={12} className="text-[var(--color-primary)] shrink-0" />
                  <span>{metricas.equivalenciaVolumen}</span>
                </p>
              </div>

              {/* 4. Ejercicio Estrella */}
              <div className="col-span-2 p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-0.5">
                    <Trophy size={13} className="text-amber-400" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">
                      {locale === 'es' ? 'Ejercicio Destacado' : 'Top Exercise'}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-white truncate">
                    {metricas.ejercicioEstrella.nombre}
                  </p>
                </div>

                {metricas.ejercicioEstrella.volumen > 0 && (
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[var(--color-primary)] block">
                      {metricas.ejercicioEstrella.volumen.toLocaleString()} kg
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {metricas.ejercicioEstrella.veces} {locale === 'es' ? 'veces' : 'times'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pie de Marca de la Tarjeta */}
            <div className="relative mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400 font-semibold">
              <span className="flex items-center gap-1 text-[var(--color-primary)] font-bold">
                <Zap size={11} />
                <span>DailySet Athlete</span>
              </span>
              <span>dailyset.app</span>
            </div>
          </div>
        </div>

        {/* ── Botonera Inferior para Compartir ("Que dé ganas de compartir") ── */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-md flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Botón Compartir Nativo */}
            <button
              type="button"
              onClick={handleCompartirNativo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-black bg-[var(--color-primary)] hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Share2 size={15} />
              <span>{locale === 'es' ? 'Compartir resumen' : 'Share summary'}</span>
            </button>

            {/* Botón Copiar al Portapapeles */}
            <button
              type="button"
              onClick={handleCopiarTexto}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all cursor-pointer"
              title={locale === 'es' ? 'Copiar texto formateado' : 'Copy formatted text'}
            >
              {copiado ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">{locale === 'es' ? 'Copiado' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>{locale === 'es' ? 'Copiar' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {locale === 'es' ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
