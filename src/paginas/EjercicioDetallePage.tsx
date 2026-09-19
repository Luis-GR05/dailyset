import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout, TituloPagina, Card, BotonPrimario } from "../componentes";
import LineChartElement from '../componentes/charts/LineChartElement';
import { useI18n } from '../context/I18nContext';
import { useEjercicios } from '../context/EjerciciosContext';
import { ArrowLeft, Dumbbell, Target, Zap, BarChart2 } from 'lucide-react';

const LEVEL_COLORS: Record<string, string> = {
  principiante: '#34d399',
  intermedio:   '#f59e0b',
  avanzado:     '#ef4444',
};

const CATEGORY_LABELS: Record<string, string> = {
  strength:    'Fuerza',
  stretching:  'Estiramiento',
  plyometrics: 'Pliométrico',
  strongman:   'Strongman',
  powerlifting:'Powerlifting',
  olympic_weightlifting: 'Halterofilia',
  cardio:      'Cardio',
  general:     'General',
};

const MUSCLE_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  abductors: { es: 'Abductores', en: 'Abductors' },
  abs: { es: 'Abdominales', en: 'Abs' },
  adductors: { es: 'Aductores', en: 'Adductors' },
  biceps: { es: 'Bíceps', en: 'Biceps' },
  calves: { es: 'Gemelos', en: 'Calves' },
  cardio: { es: 'Cardio', en: 'Cardio' },
  delts: { es: 'Deltoides (Hombros)', en: 'Deltoids' },
  forearms: { es: 'Antebrazos', en: 'Forearms' },
  glutes: { es: 'Glúteos', en: 'Glutes' },
  hamstrings: { es: 'Isquiotibiales', en: 'Hamstrings' },
  lats: { es: 'Dorsales', en: 'Lats' },
  'levator-scapulae': { es: 'Elevador de la escápula', en: 'Levator Scapulae' },
  pectorals: { es: 'Pectorales', en: 'Pectorals' },
  quads: { es: 'Cuádriceps', en: 'Quads' },
  'serratus-anterior': { es: 'Serrato anterior', en: 'Serratus Anterior' },
  spine: { es: 'Espina / Lumbar', en: 'Spine / Lower Back' },
  traps: { es: 'Trapecios', en: 'Traps' },
  triceps: { es: 'Tríceps', en: 'Triceps' },
  'upper-back': { es: 'Espalda superior', en: 'Upper Back' },
};

const EQUIPMENT_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  barbell: { es: 'Barra', en: 'Barbell' },
  dumbbell: { es: 'Mancuerna', en: 'Dumbbell' },
  cable: { es: 'Polea', en: 'Cable' },
  machine: { es: 'Máquina', en: 'Machine' },
  bodyweight: { es: 'Peso corporal', en: 'Bodyweight' },
  band: { es: 'Banda elástica', en: 'Band' },
  kettlebell: { es: 'Pesa rusa (Kettlebell)', en: 'Kettlebell' },
  smith: { es: 'Máquina Smith', en: 'Smith' },
  'ez-bar': { es: 'Barra Z', en: 'EZ Bar' },
  lever: { es: 'Palanca', en: 'Lever' },
  other: { es: 'Otro', en: 'Other' },
};

export default function EjercicioDetallePage() {
  const { t, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ejercicios } = useEjercicios();

  const [imgActiva, setImgActiva] = useState<0 | 1>(0);

  const ejercicioId = parseInt(id || '0', 10);
  const ejercicio = ejercicios.find(e => e.id === ejercicioId);

  if (!ejercicio) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-10 gap-4">
          <Dumbbell size={48} style={{ color: 'var(--color-neutral-900)' }} />
          <h2 className="text-xl text-white">
            {locale === 'es' ? 'Ejercicio no encontrado' : 'Exercise not found'}
          </h2>
          <BotonPrimario onClick={() => navigate('/ejercicios')}>
            {locale === 'es' ? 'Volver a ejercicios' : 'Back to exercises'}
          </BotonPrimario>
        </div>
      </AppLayout>
    );
  }

  // Historial de progreso simulado (se conectará con series reales en próxima iteración)
  const historial = [
    { fecha: locale === 'es' ? "29 Enero" : "29 January", peso: 60, reps: 5 },
    { fecha: locale === 'es' ? "18 Marzo"  : "18 March",   peso: 70, reps: 6 },
    { fecha: locale === 'es' ? "7 Junio"   : "7 June",     peso: 80, reps: 8 },
    { fecha: locale === 'es' ? "14 Sep"    : "14 Sep",     peso: 95, reps: 6 },
    { fecha: locale === 'es' ? "23 Dic"    : "23 Dec",     peso: 105, reps: 8 },
  ];
  const datosGrafico = historial.map(h => ({ name: h.fecha, value: h.peso }));

  const levelColor = LEVEL_COLORS[ejercicio.dificultad] ?? 'var(--color-neutral-2000)';
  const catLabel = CATEGORY_LABELS[ejercicio.categoriaEjercicio] ?? ejercicio.categoriaEjercicio;

  const getMuscleText = (m: string) => {
    const item = MUSCLE_TRANSLATIONS[m.toLowerCase()];
    return item ? (locale === 'es' ? item.es : item.en) : m;
  };

  const getEquipmentText = (eq: string) => {
    const item = EQUIPMENT_TRANSLATIONS[eq.toLowerCase()];
    return item ? (locale === 'es' ? item.es : item.en) : eq;
  };

  const imagenes = [ejercicio.imagenInicio, ejercicio.imagenFinal].filter(Boolean) as string[];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back + title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'var(--color-neutral-800)', color: 'var(--color-neutral-3000)' }}
          >
            <ArrowLeft size={18} />
          </button>
          <TituloPagina titulo={ejercicio.nombre} />
        </div>

        {/* Badges de info */}
        <div className="flex flex-wrap gap-2">
          {/* Dificultad */}
          <span
            className="text-xs font-bold px-3 py-1 rounded-full capitalize"
            style={{ background: `${levelColor}22`, color: levelColor, border: `1px solid ${levelColor}44` }}
          >
            {ejercicio.dificultad}
          </span>
          {/* Categoría */}
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-neutral-3000)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {catLabel}
          </span>
          {/* Equipamiento */}
          {ejercicio.equipamiento && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(67,97,238,0.15)', color: '#7B9EF9', border: '1px solid rgba(67,97,238,0.3)' }}
            >
              {getEquipmentText(ejercicio.equipamiento)}
            </span>
          )}
          {/* Grupo muscular */}
          {ejercicio.grupo && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(219,240,89,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(219,240,89,0.2)' }}
            >
              {ejercicio.grupo}
            </span>
          )}
        </div>

        {/* Layout principal: 2 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Columna izquierda: imágenes + músculos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Visor de imagen / GIF */}
            <Card className="overflow-hidden" hoverable={false}>
              <div className="aspect-square w-full bg-neutral-900/80 relative overflow-hidden flex items-center justify-center">
                {imagenes.length > 0 ? (
                  <>
                    <img
                      src={imagenes[imgActiva]}
                      alt={ejercicio.nombre}
                      className="w-full h-full object-contain transition-opacity duration-300"
                    />
                    {/* Badge GIF animado */}
                    {imagenes[imgActiva]?.endsWith('.gif') && (
                      <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase bg-black/70 text-white backdrop-blur-md border border-white/20">
                        GIF ANIMADO
                      </span>
                    )}
                    {/* Selector de imagen si hay más de 1 imagen */}
                    {imagenes.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {imagenes.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgActiva(i as 0 | 1)}
                            className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                            style={imgActiva === i
                              ? { background: 'var(--color-primary)', color: '#050505' }
                              : { background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(8px)' }}
                          >
                            {i === 0 ? (locale === 'es' ? 'Ini' : 'Ini') : (locale === 'es' ? 'Fin' : 'End')}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dumbbell size={48} style={{ color: 'var(--color-neutral-800)' }} />
                  </div>
                )}
              </div>
            </Card>

            {/* Músculos */}
            <Card className="p-5" hoverable={false}>
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-bold text-white text-sm">
                  {locale === 'es' ? 'Músculos trabajados' : 'Target muscles'}
                </h3>
              </div>
              {ejercicio.musculosPrimarios.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-neutral-2000)' }}>
                    {locale === 'es' ? 'Primarios' : 'Primary'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ejercicio.musculosPrimarios.map(m => (
                      <span key={m}
                        className="text-xs px-2.5 py-1 rounded-full font-bold"
                        style={{ background: 'rgba(219,240,89,0.12)', color: 'var(--color-primary)', border: '1px solid rgba(219,240,89,0.2)' }}
                      >{getMuscleText(m)}</span>
                    ))}
                  </div>
                </div>
              )}
              {ejercicio.musculosSecundarios.length > 0 && (
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-neutral-2000)' }}>
                    {locale === 'es' ? 'Secundarios' : 'Secondary'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ejercicio.musculosSecundarios.map(m => (
                      <span key={m}
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-neutral-3000)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >{getMuscleText(m)}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Columna derecha: instrucciones + historial */}
          <div className="lg:col-span-3 space-y-4">
            {/* Instrucciones */}
            {ejercicio.instruccionesPasos.length > 0 && (
              <Card className="p-5" hoverable={false}>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} style={{ color: 'var(--color-primary)' }} />
                  <h3 className="font-bold text-white text-sm">
                    {locale === 'es' ? 'Instrucciones' : 'Instructions'}
                  </h3>
                </div>
                <ol className="space-y-3">
                  {ejercicio.instruccionesPasos.map((paso, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--color-primary)', color: '#050505' }}
                      >{i + 1}</span>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-neutral-3000)' }}>
                        {paso}
                      </p>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {/* Descripción (si no hay instrucciones por pasos) */}
            {ejercicio.instruccionesPasos.length === 0 && ejercicio.descripcion && (
              <Card className="p-5" hoverable={false}>
                <h3 className="font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                  {t.exercises.description}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-neutral-3000)' }}>
                  {ejercicio.descripcion}
                </p>
              </Card>
            )}

            {/* Gráfico de progreso */}
            <Card className="p-5" hoverable={false}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-bold text-white text-sm">
                  {locale === 'es' ? 'Tu progreso' : 'Your progress'}
                </h3>
              </div>
              <LineChartElement
                items={datosGrafico}
                title={locale === 'es' ? 'Peso máximo (kg)' : 'Max weight (kg)'}
                height={120}
                showGrid={false}
                lineColor="var(--color-primary)"
              />
            </Card>

            {/* Tabla de historial */}
            <Card className="p-5" hoverable={false}>
              <h3 className="font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                {t.exerciseDetail.progressHistory}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-neutral-800)' }}>
                      <th className="text-left py-2 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--color-neutral-2000)' }}>
                        {t.exerciseDetail.dateCol}
                      </th>
                      <th className="text-left py-2 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--color-neutral-2000)' }}>
                        {t.exerciseDetail.maxWeight}
                      </th>
                      <th className="text-left py-2 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--color-neutral-2000)' }}>
                        {t.training.reps}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((item, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: index < historial.length - 1 ? '1px solid var(--color-neutral-800)' : 'none' }}
                      >
                        <td className="py-2.5 text-white">{item.fecha}</td>
                        <td className="py-2.5 font-bold" style={{ color: 'var(--color-primary)' }}>{item.peso} kg</td>
                        <td className="py-2.5 text-white">{item.reps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
