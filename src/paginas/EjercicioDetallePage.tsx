import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout, TituloPagina, Card, BotonPrimario } from "../componentes";
import LineChartElement from '../componentes/charts/LineChartElement';
import { useI18n } from '../context/I18nContext';
import { useEjercicios } from '../context/EjerciciosContext';
import { useHistorial } from '../context/HistorialContext';
import { ArrowLeft, Dumbbell, Target, Zap, BarChart2 } from 'lucide-react';
import {
  translateEquipmentEs,
  translateExerciseTitleEs,
  translateInstructionEs,
  translateMuscleEs,
} from '../lib/exerciseTranslations';

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

export default function EjercicioDetallePage() {
  const { t, locale } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ejercicios } = useEjercicios();
  const { sesiones } = useHistorial();

  const [imgActiva, setImgActiva] = useState<0 | 1>(0);
  const [imgError, setImgError] = useState(false);

  const ejercicioId = parseInt(id || '0', 10);
  const ejercicio = ejercicios.find(e => e.id === ejercicioId);

  // Historial real de progreso: máximo kg por sesión para este ejercicio
  const { historialReal, datosGrafico } = useMemo(() => {
    if (!ejercicio) return { historialReal: [], datosGrafico: [] };

    const puntos: { fecha: string; peso: number; reps: number }[] = [];

    sesiones
      .slice()
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .forEach(sesion => {
        const ejEnSesion = sesion.ejercicios.find(e => e.nombre === ejercicio.nombre);
        if (!ejEnSesion || ejEnSesion.series.length === 0) return;

        // Serie con mayor kg (si empatan, la de más reps)
        const mejorSerie = ejEnSesion.series.reduce((mejor, serie) => {
          if (serie.kg > mejor.kg) return serie;
          if (serie.kg === mejor.kg && serie.reps > mejor.reps) return serie;
          return mejor;
        }, ejEnSesion.series[0]);

        const fechaObj = new Date(sesion.fecha + 'T12:00:00');
        const fechaMostrada = fechaObj.toLocaleDateString(
          locale === 'es' ? 'es-ES' : 'en-US',
          { day: 'numeric', month: 'short' }
        );

        puntos.push({
          fecha: fechaMostrada,
          peso: mejorSerie.kg,
          reps: mejorSerie.reps,
        });
      });

    // Limitar a los últimos 10 para no saturar la gráfica
    const ultimos = puntos.slice(-10);
    const grafico = ultimos.map(p => ({ name: p.fecha, value: p.peso }));
    return { historialReal: ultimos, datosGrafico: grafico };
  }, [sesiones, ejercicio, locale]);

  if (!ejercicio) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-10 gap-4">
          <Dumbbell size={48} style={{ color: 'var(--color-neutral-900)' }} />
          <h2 className="text-xl text-white">Ejercicio no encontrado</h2>
          <BotonPrimario onClick={() => navigate('/ejercicios')}>
            Volver a ejercicios
          </BotonPrimario>
        </div>
      </AppLayout>
    );
  }

  const levelColor = LEVEL_COLORS[ejercicio.dificultad] ?? 'var(--color-neutral-2000)';
  const catLabel = CATEGORY_LABELS[ejercicio.categoriaEjercicio] ?? ejercicio.categoriaEjercicio;
  const ejercicioNombreMostrado = locale === 'es'
    ? translateExerciseTitleEs(ejercicio.nombre)
    : ejercicio.nombre;
  const pasosMostrados = locale === 'es'
    ? ejercicio.instruccionesPasos.map(translateInstructionEs)
    : ejercicio.instruccionesPasos;
  const descripcionMostrada = locale === 'es'
    ? translateInstructionEs(ejercicio.descripcion)
    : ejercicio.descripcion;
  const equipamientoMostrado = locale === 'es' && ejercicio.equipamiento
    ? translateEquipmentEs(ejercicio.equipamiento)
    : ejercicio.equipamiento;

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
          <TituloPagina titulo={ejercicioNombreMostrado} />
        </div>

        {/* Badges de info */}
        <div className="flex flex-wrap gap-2">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: `${levelColor}22`, color: levelColor, border: `1px solid ${levelColor}44` }}
          >
            {ejercicio.dificultad}
          </span>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-neutral-3000)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {catLabel}
          </span>
          {ejercicio.equipamiento && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(67,97,238,0.15)', color: '#7B9EF9', border: '1px solid rgba(67,97,238,0.3)' }}
            >
              {equipamientoMostrado}
            </span>
          )}
        </div>

        {/* Layout principal: 2 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Columna izquierda: imágenes + músculos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Visor de imagen */}
            <Card className="overflow-hidden" hoverable={false}>
              <div className="aspect-square w-full bg-neutral-900 relative overflow-hidden">
                {imagenes.length > 0 && !imgError ? (
                  <>
                    <img
                      src={imagenes[imgActiva]}
                      alt={`${ejercicioNombreMostrado} — ${imgActiva === 0 ? (locale === 'es' ? 'posición inicial' : 'start position') : (locale === 'es' ? 'posición final' : 'end position')}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      onError={() => setImgError(true)}
                    />
                    {/* Selector de imagen */}
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
                            {i === 0 ? 'Ini' : (locale === 'es' ? 'Fin' : 'End')}
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
                <h3 className="font-bold text-white text-sm">Músculos trabajados</h3>
              </div>
              {ejercicio.musculosPrimarios.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-neutral-2000)' }}>Primarios</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ejercicio.musculosPrimarios.map(m => (
                      <span key={m}
                        className="text-xs px-2 py-1 rounded-full font-bold"
                        style={{ background: 'rgba(219,240,89,0.12)', color: 'var(--color-primary)', border: '1px solid rgba(219,240,89,0.2)' }}
                      >{locale === 'es' ? translateMuscleEs(m) : m}</span>
                    ))}
                  </div>
                </div>
              )}
              {ejercicio.musculosSecundarios.length > 0 && (
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-neutral-2000)' }}>Secundarios</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ejercicio.musculosSecundarios.map(m => (
                      <span key={m}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-neutral-3000)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >{locale === 'es' ? translateMuscleEs(m) : m}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Columna derecha: instrucciones + historial */}
          <div className="lg:col-span-3 space-y-4">
            {/* Instrucciones */}
            {pasosMostrados.length > 0 && (
              <Card className="p-5" hoverable={false}>
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} style={{ color: 'var(--color-primary)' }} />
                  <h3 className="font-bold text-white text-sm">Instrucciones</h3>
                </div>
                <ol className="space-y-3">
                  {pasosMostrados.map((paso, i) => (
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
            {pasosMostrados.length === 0 && descripcionMostrada && (
              <Card className="p-5" hoverable={false}>
                <h3 className="font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                  {t.exercises.description}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-neutral-3000)' }}>
                  {descripcionMostrada}
                </p>
              </Card>
            )}

            {/* Gráfico de progreso real */}
            <Card className="p-5" hoverable={false}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-bold text-white text-sm">Tu progreso</h3>
              </div>
              {datosGrafico.length > 0 ? (
                <LineChartElement
                  items={datosGrafico}
                  title={'Peso máximo (kg)'}
                  height={120}
                  showGrid={false}
                  lineColor="var(--color-primary)"
                />
              ) : (
                <div className="h-28 flex items-center justify-center">
                  <p className="text-neutral-600 text-sm text-center">
                    Haz este ejercicio para ver tu progresión aquí.
                  </p>
                </div>
              )}
            </Card>

            {/* Tabla de historial real */}
            {historialReal.length > 0 && (
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
                      {historialReal.map((item, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: index < historialReal.length - 1 ? '1px solid var(--color-neutral-800)' : 'none' }}
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
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
