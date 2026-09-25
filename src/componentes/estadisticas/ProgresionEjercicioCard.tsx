// src/componentes/estadisticas/ProgresionEjercicioCard.tsx
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Lock, Trophy, Zap, Dumbbell, ChevronDown } from 'lucide-react';
import type { Sesion } from '../../context/HistorialContext';
import { useI18n } from '../../context/I18nContext';

interface ProgresionEjercicioCardProps {
  sesiones: Sesion[];
  esPro: boolean;
  onDesbloquear: () => void;
}

export default function ProgresionEjercicioCard({
  sesiones,
  esPro,
  onDesbloquear,
}: ProgresionEjercicioCardProps) {
  const { locale } = useI18n();

  // Lista de todos los nombres de ejercicios encontrados en el historial
  const ejerciciosDisponibles = useMemo(() => {
    const set = new Set<string>();
    sesiones.forEach(s => {
      s.ejercicios?.forEach(ej => {
        if (ej.nombre && ej.nombre.trim()) {
          set.add(ej.nombre.trim());
        }
      });
    });
    const lista = Array.from(set).sort();
    if (lista.length === 0) {
      return [
        locale === 'es' ? 'Press de Banca con Barra' : 'Barbell Bench Press',
        locale === 'es' ? 'Sentadilla con Barra' : 'Barbell Back Squat',
        locale === 'es' ? 'Peso Muerto' : 'Deadlift',
        locale === 'es' ? 'Press Militar' : 'Overhead Press',
      ];
    }
    return lista;
  }, [sesiones, locale]);

  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<string>(
    ejerciciosDisponibles[0] || 'Press de Banca'
  );

  // Calcular puntos de datos de progresión para el ejercicio seleccionado
  const datosProgresion = useMemo(() => {
    const sesionesConEjercicio = sesiones
      .filter(s => s.ejercicios?.some(ej => ej.nombre.toLowerCase() === ejercicioSeleccionado.toLowerCase()))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    if (sesionesConEjercicio.length > 0) {
      return sesionesConEjercicio.map(s => {
        const ej = s.ejercicios.find(e => e.nombre.toLowerCase() === ejercicioSeleccionado.toLowerCase());
        const series = ej?.series || [];
        const maxKg = series.reduce((max, ser) => Math.max(max, ser.kg || 0), 0);
        const volumen = series.reduce((acc, ser) => acc + (ser.kg || 0) * (ser.reps || 0), 0);
        // Estimación 1RM Epley: peso * (1 + reps / 30)
        let max1RM = 0;
        series.forEach(ser => {
          if (ser.kg > 0 && ser.reps > 0) {
            const estim = Math.round(ser.kg * (1 + ser.reps / 30));
            if (estim > max1RM) max1RM = estim;
          }
        });

        const [y, m, d] = s.fecha.split('-').map(Number);
        const fechaCorta = new Date(y, m - 1, d).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
          day: 'numeric',
          month: 'short',
        });

        return {
          fecha: fechaCorta,
          fechaCompleta: s.fecha,
          pesoMax: maxKg,
          volumen,
          estim1RM: max1RM > 0 ? max1RM : maxKg,
        };
      });
    }

    // Datos simulados de progresión representativa
    return [
      { fecha: 'Ene 10', pesoMax: 60, estim1RM: 70, volumen: 1800 },
      { fecha: 'Feb 02', pesoMax: 65, estim1RM: 74, volumen: 2100 },
      { fecha: 'Mar 15', pesoMax: 70, estim1RM: 80, volumen: 2350 },
      { fecha: 'Abr 22', pesoMax: 72.5, estim1RM: 83, volumen: 2500 },
      { fecha: 'May 30', pesoMax: 77.5, estim1RM: 88, volumen: 2800 },
      { fecha: 'Jun 18', pesoMax: 80, estim1RM: 92, volumen: 3000 },
      { fecha: 'Jul 26', pesoMax: 85, estim1RM: 98, volumen: 3400 },
    ];
  }, [sesiones, ejercicioSeleccionado, locale]);

  // Récords y métricas del ejercicio
  const maxPesoHistorico = useMemo(() => {
    return datosProgresion.reduce((max, d) => Math.max(max, d.pesoMax), 0);
  }, [datosProgresion]);

  const max1RMHistorico = useMemo(() => {
    return datosProgresion.reduce((max, d) => Math.max(max, d.estim1RM), 0);
  }, [datosProgresion]);

  const mejoraPct = useMemo(() => {
    if (datosProgresion.length < 2) return 0;
    const inicial = datosProgresion[0].pesoMax;
    const final = datosProgresion[datosProgresion.length - 1].pesoMax;
    if (inicial === 0) return 0;
    return Math.round(((final - inicial) / inicial) * 100);
  }, [datosProgresion]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl p-6 md:p-8">
      {/* Cabecera de la tarjeta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--color-primary)] text-black font-mono">
              PRO & ULTRA
            </span>
            <span className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
              {locale === 'es' ? 'Sobrecarga Progresiva' : 'Progressive Overload'}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-[var(--color-primary)]" />
            <span>{locale === 'es' ? 'Gráfica de Progresión por Ejercicio' : 'Exercise Progression Chart'}</span>
          </h3>
        </div>

        {/* Selector de ejercicio */}
        <div className="relative self-start sm:self-auto">
          <select
            value={ejercicioSeleccionado}
            onChange={(e) => setEjercicioSeleccionado(e.target.value)}
            disabled={!esPro}
            className="appearance-none bg-black/60 border border-white/15 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-white hover:border-white/30 focus:outline-none focus:border-[var(--color-primary)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {ejerciciosDisponibles.map((ej) => (
              <option key={ej} value={ej} className="bg-neutral-900 text-white">
                {ej}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Indicadores clave (PR, 1RM estimado, Mejora %) */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Trophy size={13} className="text-amber-400" />
            <span>{locale === 'es' ? 'Récord Personal (PR)' : 'Personal Record'}</span>
          </div>
          <p className="text-xl md:text-2xl font-black text-white font-mono leading-none">
            {maxPesoHistorico} <span className="text-xs text-[var(--color-primary)] font-sans">kg</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Zap size={13} className="text-[var(--color-primary)]" />
            <span>{locale === 'es' ? '1RM Estimado' : 'Est. 1RM'}</span>
          </div>
          <p className="text-xl md:text-2xl font-black text-white font-mono leading-none">
            {max1RMHistorico} <span className="text-xs text-[var(--color-primary)] font-sans">kg</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Dumbbell size={13} className="text-sky-400" />
            <span>{locale === 'es' ? 'Ganancia Total' : 'Progression'}</span>
          </div>
          <p className="text-xl md:text-2xl font-black text-[var(--color-primary)] font-mono leading-none">
            {mejoraPct >= 0 ? `+${mejoraPct}%` : `${mejoraPct}%`}
          </p>
        </div>
      </div>

      {/* Gráfica Recharts de Área / Línea */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datosProgresion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="fecha"
              stroke="#71717A"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              stroke="#71717A"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickFormatter={(v) => `${v}kg`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121214',
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
              formatter={(value: any, name: any) => [
                `${value} kg`,
                name === 'pesoMax'
                  ? (locale === 'es' ? 'Carga Máxima' : 'Max Load')
                  : (locale === 'es' ? '1RM Estimado' : 'Est. 1RM'),
              ]}
              labelStyle={{ color: '#A1A1AA', fontWeight: 'bold' }}
            />
            <Area
              type="monotone"
              dataKey="pesoMax"
              stroke="var(--color-primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorProg)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bloqueo Overlay para usuarios FREE */}
      {!esPro && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)] mb-3 shadow-lg">
            <Lock size={22} />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--color-primary)] text-black mb-2 font-mono">
            {locale === 'es' ? 'Función Plan PRO' : 'PRO Plan Feature'}
          </span>
          <h4 className="text-lg md:text-xl font-black text-white max-w-md">
            {locale === 'es' ? 'Gráfica de progresión por ejercicio' : 'Progression chart per exercise'}
          </h4>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-sm">
            {locale === 'es'
              ? 'Controla tu sobrecarga progresiva en cualquier levantamiento, visualiza tu 1RM estimado y supera tus marcas históricas.'
              : 'Track progressive overload on any exercise, visualize your estimated 1RM, and smash historical records.'}
          </p>
          <button
            type="button"
            onClick={onDesbloquear}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            {locale === 'es' ? 'Desbloquear con Plan PRO' : 'Unlock with PRO Plan'}
          </button>
        </div>
      )}
    </div>
  );
}
