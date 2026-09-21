import { useState } from 'react';
import {
  Flame,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Target,
  Lock,
  Sparkles,
  Eye,
  Shield,
  Star,
  Crown,
} from 'lucide-react';
import type { NivelConfig } from '../../paginas/PerfilPage';
import MarcoAvatarNivel from './MarcoAvatarNivel';
import DiamanteIcon from '../shared/DiamanteIcon';

export interface GamificacionRachaProps {
  locale: string;
  streakData: {
    trainedToday: boolean;
    trainedYesterday: boolean;
    rachaActual: number;
    bestStreak: number;
    uniqueDaysCount: number;
    last7Days: Array<{
      dateStr: string;
      dayName: string;
      dayNum: number;
      hasTrained: boolean;
      isToday: boolean;
    }>;
  };
  nivelActual: NivelConfig;
  siguienteNivel: NivelConfig | null;
  progresoNivel: number;
  entrenamientosFaltantes: number;
  totalSesiones: number;
  badges: Array<{
    id: string;
    icon: React.ReactNode;
    titulo: string;
    desc: string;
    unlocked: boolean;
    progresoActual: number;
    progresoMeta: number;
    unidad: string;
  }>;
  niveles: NivelConfig[];
  onIniciarEntrenamiento: () => void;
}

export default function GamificacionRacha({
  locale,
  streakData,
  nivelActual,
  siguienteNivel,
  progresoNivel,
  entrenamientosFaltantes,
  totalSesiones,
  badges,
  niveles,
  onIniciarEntrenamiento,
}: GamificacionRachaProps) {
  const [seccionGamificacion, setSeccionGamificacion] = useState<'racha' | 'camino' | 'insignias'>('racha');
  const [marcoPreviewNivel, setMarcoPreviewNivel] = useState<number>(nivelActual.nivel);
  const avatarLocal = typeof window !== 'undefined' ? localStorage.getItem('dailyset_avatar') : null;

  return (
    <div className="space-y-4">
      {/* Cabecera de la sección con tabs de navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame size={16} />
            </span>
            <h2 className="text-lg font-black text-white uppercase italic tracking-wide">
              {locale === 'es' ? 'Racha de Constancia' : 'Consistency Streak'}
            </h2>
          </div>
          <p className="text-neutral-400 text-xs mt-0.5">
            {locale === 'es'
              ? 'Sube de nivel cumpliendo con los días programados en tus rutinas.'
              : 'Level up by sticking to your scheduled routine days.'}
          </p>
        </div>

        {/* Selector de pestañas */}
        <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSeccionGamificacion('racha')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              seccionGamificacion === 'racha'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame size={13} className={seccionGamificacion === 'racha' ? 'text-amber-400' : ''} />
            <span>{locale === 'es' ? 'Racha' : 'Streak'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSeccionGamificacion('camino')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              seccionGamificacion === 'camino'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp size={13} className={seccionGamificacion === 'camino' ? 'text-[var(--color-primary)]' : ''} />
            <span>{locale === 'es' ? 'Niveles' : 'Levels'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSeccionGamificacion('insignias')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              seccionGamificacion === 'insignias'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Award size={13} className={seccionGamificacion === 'insignias' ? 'text-sky-400' : ''} />
            <span>{locale === 'es' ? 'Insignias' : 'Badges'}</span>
          </button>
        </div>
      </div>

      {/* 1. PESTAÑA RACHA */}
      {seccionGamificacion === 'racha' && (
        <div className="space-y-4">
          {/* Tarjeta Hero de Racha */}
          <div className="card p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Fuego con contador */}
              <div className="flex items-center gap-5 text-center md:text-left">
                <div className="relative">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                      streakData.rachaActual > 0
                        ? 'bg-amber-500/10 border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                        : 'bg-white/5 border border-white/10 text-neutral-500'
                    }`}
                  >
                    <Flame
                      size={44}
                      className={`${
                        streakData.rachaActual > 0
                          ? 'text-amber-400 animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                          : 'text-neutral-600'
                      }`}
                    />
                  </div>
                  {streakData.rachaActual > 0 && (
                    <span className="absolute -bottom-2 -right-2 bg-amber-400 text-black font-black text-[11px] px-2 py-0.5 rounded-full shadow-md font-mono">
                      {streakData.rachaActual}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="font-mono text-3xl md:text-4xl font-black text-white italic tracking-tight">
                      {streakData.rachaActual} {locale === 'es' ? 'DÍAS' : 'DAYS'}
                    </span>
                  </div>
                  <p className="text-xs uppercase font-bold tracking-widest text-neutral-400 mt-0.5">
                    {locale === 'es' ? 'Racha de Asistencia Activa' : 'Active Attendance Streak'}
                  </p>
                </div>
              </div>

              {/* Estado y Call To Action según si entrenó hoy */}
              <div className="w-full md:w-auto md:max-w-xs text-center md:text-right">
                {streakData.trainedToday ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-xs font-bold">
                    <CheckCircle2 size={14} />
                    <span>{locale === 'es' ? '¡Racha protegida hoy!' : 'Streak protected today!'}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                      <Flame size={14} />
                      <span>{locale === 'es' ? 'Entrena hoy para mantenerla' : 'Train today to keep it'}</span>
                    </div>
                    <div>
                      <button
                        onClick={onIniciarEntrenamiento}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[var(--color-primary)] text-black hover:opacity-90 transition-all cursor-pointer shadow-md"
                      >
                        {locale === 'es' ? 'Iniciar Entrenamiento' : 'Start Workout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracker de los últimos 7 días */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {locale === 'es' ? 'Últimos 7 días' : 'Last 7 days'}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {streakData.last7Days.filter((d) => d.hasTrained).length}/7 {locale === 'es' ? 'completados' : 'done'}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {streakData.last7Days.map((dia, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all ${
                      dia.hasTrained
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 text-[var(--color-primary)] shadow-[0_0_12px_rgba(212,251,52,0.15)]'
                        : dia.isToday
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                        : 'bg-white/[0.02] border-white/5 text-neutral-400'
                    }`}
                  >
                    <span className="text-[10px] font-black tracking-widest">{dia.dayName}</span>
                    <span className="text-sm font-black font-mono my-0.5">{dia.dayNum}</span>
                    <div className="mt-1">
                      {dia.hasTrained ? (
                        <CheckCircle2 size={13} className="text-[var(--color-primary)]" />
                      ) : dia.isToday ? (
                        <Flame size={13} className="text-amber-400" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PESTAÑA NIVELES Y CAMINO */}
      {seccionGamificacion === 'camino' && (
        <div className="space-y-6">
          {/* Tarjeta Destacada: Probador Interactivo de Marcos de Nivel */}
          <div className="card p-6 md:p-8 backdrop-blur-xl relative overflow-hidden border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.08)]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles size={15} />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
                    {locale === 'es' ? 'Armería Visual de Rangos' : 'Visual Rank Armory'}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tight uppercase mt-1">
                  {locale === 'es' ? 'Marcos Dinámicos por Nivel' : 'Dynamic Level Frames'}
                </h3>
                <p className="text-neutral-400 text-xs mt-1 max-w-xl">
                  {locale === 'es'
                    ? 'Por cada nivel que alcanzas obtienes un marco exclusivo para tu avatar con efectos y partículas animadas. ¡Pruébalos todos!'
                    : 'For each level you reach, you unlock an exclusive frame for your avatar with animated effects and particles. Try them all!'}
                </p>
              </div>

              {/* Botón rápido para volver a tu marco actual si estás probando otro */}
              {marcoPreviewNivel !== nivelActual.nivel && (
                <button
                  type="button"
                  onClick={() => setMarcoPreviewNivel(nivelActual.nivel)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <Eye size={13} className="text-amber-400" />
                  <span>{locale === 'es' ? 'Ver mi Marco Actual' : 'View my Current Frame'}</span>
                </button>
              )}
            </div>

            {/* Showcase Central del Marco */}
            {(() => {
              const previewLvl = niveles.find((n) => n.nivel === marcoPreviewNivel) || nivelActual;
              const esEquipado = previewLvl.nivel === nivelActual.nivel;
              const estaDesbloqueado = totalSesiones >= previewLvl.minSesiones;

              return (
                <div className="mt-6 flex flex-col md:flex-row items-center justify-around gap-6 py-4 px-3 rounded-2xl bg-black/40 border border-white/10">
                  {/* Avatar con el marco seleccionado */}
                  <div className="relative my-3 flex flex-col items-center">
                    <MarcoAvatarNivel
                      nivel={previewLvl.nivel}
                      size="xl"
                      avatarUrl={avatarLocal}
                      className="shadow-2xl"
                    />

                    {/* Tag de estado debajo del avatar */}
                    <div className="mt-4">
                      {esEquipado ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--color-primary)] text-black shadow-md flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          {locale === 'es' ? 'Marco Activo en tu Perfil' : 'Active Frame on Profile'}
                        </span>
                      ) : estaDesbloqueado ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          {locale === 'es' ? 'Desbloqueado' : 'Unlocked'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/10 flex items-center gap-1">
                          <Lock size={12} />
                          {locale === 'es'
                            ? `Desbloquea en ${previewLvl.minSesiones} entrenamientos`
                            : `Unlocks at ${previewLvl.minSesiones} workouts`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ficha descriptiva del marco */}
                  <div className="flex-1 max-w-md text-center md:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-neutral-400">
                        {locale === 'es' ? `NIVEL ${previewLvl.nivel}` : `LEVEL ${previewLvl.nivel}`}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {locale === 'es' ? previewLvl.rangoEs : previewLvl.rangoEn}
                      </span>
                    </div>

                    <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">
                      {locale === 'es' ? previewLvl.nombreEs : previewLvl.nombreEn}
                    </h4>

                    {/* Descripción específica del marco */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-0.5 flex items-center gap-1">
                        <Sparkles size={11} /> {locale === 'es' ? 'Efecto del Marco:' : 'Frame Visual Effect:'}
                      </span>
                      <p className="text-sm font-bold text-white italic">
                        {locale === 'es' ? previewLvl.marcoDescEs : previewLvl.marcoDescEn}
                      </p>
                    </div>

                    <p className="text-xs text-neutral-400">
                      {locale === 'es' ? previewLvl.descEs : previewLvl.descEn}
                    </p>

                    <div className="pt-2 flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-300">
                      <Zap size={14} className="text-amber-400" />
                      <span>
                        <strong className="text-white">{locale === 'es' ? 'Beneficio:' : 'Benefit:'}</strong>{' '}
                        {locale === 'es' ? previewLvl.beneficioEs : previewLvl.beneficioEn}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Selector de marcos (1 a 7) */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-3 text-center sm:text-left">
                {locale === 'es' ? 'Toca un nivel para probar su marco:' : 'Tap a level to preview its frame:'}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {niveles.map((lvl) => {
                  const esSeleccionado = lvl.nivel === marcoPreviewNivel;
                  const esActual = lvl.nivel === nivelActual.nivel;

                  return (
                    <button
                      key={lvl.nivel}
                      type="button"
                      onClick={() => setMarcoPreviewNivel(lvl.nivel)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-center relative ${
                        esSeleccionado
                          ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-102'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {esActual && (
                        <span className="absolute -top-1.5 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] ring-2 ring-black" />
                      )}

                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300">
                        {locale === 'es' ? `Nvl ${lvl.nivel}` : `Lvl ${lvl.nivel}`}
                      </span>

                      {/* Mini icono vectorial del marco (sin emojis) */}
                      <span className="my-1 flex items-center justify-center h-5">
                        {lvl.nivel === 1 && <Zap size={16} className="text-yellow-400 fill-yellow-400/40" />}
                        {lvl.nivel === 2 && <Shield size={16} className="text-amber-600 fill-amber-600/40" />}
                        {lvl.nivel === 3 && <Flame size={16} className="text-slate-300 fill-slate-300/40" />}
                        {lvl.nivel === 4 && <Star size={16} className="text-amber-400 fill-amber-400/40" />}
                        {lvl.nivel === 5 && <Award size={16} className="text-indigo-400 fill-indigo-400/40" />}
                        {lvl.nivel === 6 && <DiamanteIcon size={16} className="text-cyan-400 stroke-cyan-400 fill-cyan-400/40" />}
                        {lvl.nivel === 7 && <Crown size={16} className="text-yellow-400 fill-yellow-400/50" />}
                      </span>

                      <span className="text-[9px] font-black uppercase truncate max-w-full text-neutral-400 leading-tight">
                        {lvl.nivel === 1 && 'Chispa'}
                        {lvl.nivel === 2 && 'Bronce'}
                        {lvl.nivel === 3 && 'Hierro'}
                        {lvl.nivel === 4 && 'Oro'}
                        {lvl.nivel === 5 && 'Platino'}
                        {lvl.nivel === 6 && 'Diamante'}
                        {lvl.nivel === 7 && 'Corona'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timeline Detallado de Niveles */}
          <div className="card p-6 md:p-8 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-primary)]">
                  {locale === 'es' ? 'Ruta de Disciplina' : 'Discipline Path'}
                </span>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase mt-0.5">
                  {locale === 'es' ? 'Camino de Constancia' : 'Path of Consistency'}
                </h3>
                <p className="text-neutral-400 text-xs mt-1">
                  {locale === 'es'
                    ? 'Avanzas de rango acumulando días de entrenamiento cumplidos en tus rutinas.'
                    : 'Advance in rank by accumulating workout days fulfilled in your routines.'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl self-start sm:self-auto">
                <Target size={18} className="text-[var(--color-primary)]" />
                <div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">
                    {locale === 'es' ? 'Total Asistencias' : 'Total Workouts'}
                  </span>
                  <span className="text-base font-black text-white font-mono leading-none">
                    {totalSesiones} {locale === 'es' ? 'días' : 'days'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline vertical de niveles */}
            <div className="space-y-4 mt-6">
              {niveles.map((lvl) => {
                const esActual = lvl.nivel === nivelActual.nivel;
                const superado = totalSesiones >= lvl.maxSesiones && lvl.nivel < 7;
                const bloqueado = totalSesiones < lvl.minSesiones;

                return (
                  <div
                    key={lvl.nivel}
                    className={`p-4 md:p-5 rounded-2xl border transition-all ${
                      esActual
                        ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/40 shadow-[0_0_20px_rgba(212,251,52,0.1)]'
                        : superado
                        ? 'bg-white/[0.02] border-white/10 opacity-80'
                        : bloqueado
                        ? 'bg-white/[0.01] border-white/5 opacity-50'
                        : 'bg-white/[0.02] border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4">
                        {/* Mini marco avatar en cada tarjeta de nivel */}
                        <div
                          onClick={() => setMarcoPreviewNivel(lvl.nivel)}
                          className="shrink-0 cursor-pointer group/frame relative transition-transform hover:scale-110 active:scale-95"
                          title={locale === 'es' ? 'Haz clic para probar este marco' : 'Click to preview this frame'}
                        >
                          <MarcoAvatarNivel
                            nivel={lvl.nivel}
                            size="sm"
                            mostrarInsignia={false}
                            mostrarBrillo={esActual || marcoPreviewNivel === lvl.nivel}
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                              {locale === 'es' ? `NIVEL ${lvl.nivel}` : `LEVEL ${lvl.nivel}`}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                esActual
                                  ? 'bg-[var(--color-primary)] text-black'
                                  : superado
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-white/5 text-neutral-400'
                              }`}
                            >
                              {locale === 'es' ? lvl.rangoEs : lvl.rangoEn}
                            </span>
                            {/* Etiqueta del marco visual */}
                            <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1 shadow-sm">
                              <Sparkles size={9} />
                              {locale === 'es' ? lvl.marcoDescEs : lvl.marcoDescEn}
                            </span>
                          </div>

                          <h4 className="text-base font-black text-white italic tracking-tight uppercase mt-0.5">
                            {locale === 'es' ? lvl.nombreEs : lvl.nombreEn}
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {locale === 'es' ? lvl.descEs : lvl.descEn}
                          </p>
                        </div>
                      </div>

                      {/* Requisito de sesiones y botón Probar */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pl-14 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-mono text-neutral-400 block font-bold">
                            {lvl.nivel === 7 ? '100+ ' : `${lvl.minSesiones}-${lvl.maxSesiones} `}
                            {locale === 'es' ? 'entrenamientos' : 'workouts'}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-400 flex items-center sm:justify-end gap-1 mt-0.5">
                            <Zap size={11} className="text-amber-400" />
                            {locale === 'es' ? lvl.beneficioEs : lvl.beneficioEn}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setMarcoPreviewNivel(lvl.nivel)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                            marcoPreviewNivel === lvl.nivel
                              ? 'bg-[var(--color-primary)] text-black font-black'
                              : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                          }`}
                        >
                          <Eye size={11} />
                          <span>
                            {marcoPreviewNivel === lvl.nivel
                              ? (locale === 'es' ? 'Probando' : 'Testing')
                              : (locale === 'es' ? 'Probar Marco' : 'Try Frame')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Barra de progreso si es el nivel actual */}
                    {esActual && siguienteNivel && (
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex justify-between items-center text-[10px] text-neutral-400 mb-1 font-mono">
                          <span>{locale === 'es' ? 'Progreso hacia siguiente nivel' : 'Progress to next level'}</span>
                          <span className="text-[var(--color-primary)] font-bold">{progresoNivel}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progresoNivel}%`,
                              backgroundColor: 'var(--color-primary)',
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1 font-medium">
                          {locale === 'es'
                            ? `Faltan ${entrenamientosFaltantes} sesiones para desbloquear Nivel ${siguienteNivel.nivel}`
                            : `${entrenamientosFaltantes} workouts left to unlock Level ${siguienteNivel.nivel}`}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. PESTAÑA INSIGNIAS Y LOGROS */}
      {seccionGamificacion === 'insignias' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((b) => {
            const pct = Math.min(100, Math.round((b.progresoActual / b.progresoMeta) * 100));

            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  b.unlocked
                    ? 'bg-white/[0.03] border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.03)]'
                    : 'bg-white/[0.01] border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      b.unlocked
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/[0.02] border-white/5 text-neutral-600'
                    }`}
                  >
                    {b.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-white italic tracking-tight uppercase truncate">
                        {b.titulo}
                      </h4>
                      {b.unlocked ? (
                        <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                          {locale === 'es' ? 'CONSEGUIDA' : 'UNLOCKED'}
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-neutral-400 shrink-0">
                          {pct}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{b.desc}</p>
                  </div>
                </div>

                {/* Barra de progreso de la insignia */}
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: b.unlocked ? 'var(--color-primary)' : 'rgba(255,255,255,0.3)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                    <span>{locale === 'es' ? 'Progreso' : 'Progress'}</span>
                    <span>
                      {b.progresoActual.toLocaleString()} / {b.progresoMeta.toLocaleString()} {b.unidad}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
