import { Link, useParams, useNavigate } from 'react-router-dom';
import { AppLayout, Card, ImagenPlaceholder } from "../componentes";
import { useHistorial } from "../context/HistorialContext";
import { useI18n } from "../context/I18nContext";
import { translateExerciseTitleEs } from '../lib/exerciseTranslations';

export default function HistorialDiaPage() {
  const { fecha } = useParams<{ fecha: string }>();
  const navigate = useNavigate();
  const { getSesionesPorFecha } = useHistorial();
  const { t, locale } = useI18n();

  const sesiones = getSesionesPorFecha(fecha ?? '');

  if (sesiones.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-neutral-400 text-lg">{t.history.noSessionFound}</p>
          <button onClick={() => navigate('/historial')} className="hover:underline" style={{ color: 'var(--color-accent)' }}>
            {t.history.back}
          </button>
        </div>
      </AppLayout>
    );
  }

  const fechaBase = sesiones[0]!.fecha;
  const fecha_ = new Date(fechaBase + 'T12:00:00');
  const fechaLegible = fecha_.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <Link to="/historial" className="self-start md:self-auto">
            <button className="text-white hover:text-neutral-300 transition-all p-2 -ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <Card className="px-6 py-4 flex-1 w-full" hoverable={false}>
            <h1 className="text-lg md:text-xl font-bold text-white text-center">{capitalize(fechaLegible)}</h1>
          </Card>
        </div>

        <div className="space-y-4">
          {sesiones.map((sesion, idx) => {
            const volumenTotal = sesion.ejercicios.reduce((total, ej) =>
              total + ej.series.reduce((tt, s) => tt + s.kg * s.reps, 0), 0);

            return (
              <div key={sesion.id} className="space-y-4">
                <Card className="p-5" hoverable={false}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-neutral-400 text-xs mb-1">
                        {locale === 'es' ? `Sesión #${idx + 1}` : `Session #${idx + 1}`}
                      </p>
                      <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                        {sesion.rutina}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400 text-xs">{locale === 'es' ? 'Puntuación:' : 'Score:'}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= sesion.puntuacion ? '' : 'text-neutral-600'}`}
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              style={star <= sesion.puntuacion ? { color: 'var(--color-primary)' } : {}}
                              aria-hidden="true"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-neutral-300">
                        {t.history.totalVolume}: <span className="text-white font-bold">{volumenTotal.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US')} kg</span>
                      </div>
                      <div className="text-xs text-neutral-300">
                        {locale === 'es' ? 'Duración' : 'Duration'}: <span className="text-white font-bold">{sesion.duracionMin} min</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {sesion.ejercicios.map((ejercicio, i) => {
                  const volEj = ejercicio.series.reduce((tt, s) => tt + s.kg * s.reps, 0);
                  return (
                    <Card key={`${sesion.id}-${i}`} className="p-6" hoverable={false}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <ImagenPlaceholder size="sm" />
                          <div>
                            <h3 className="font-bold text-white text-lg">
                              {locale === 'es' ? translateExerciseTitleEs(ejercicio.nombre) : ejercicio.nombre}
                            </h3>
                            <p className="text-neutral-400 text-sm">{ejercicio.series.length} {t.history.sessions} · {volEj} {t.history.kg}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ejercicio.series.map((serie, j) => (
                          <div key={j} className="bg-neutral-800 rounded-lg px-3 py-2 text-center">
                            <p className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>S{j + 1}:</p>
                            <p className="text-white text-xs">{serie.kg > 0 ? `${serie.kg}kg` : 'BW'} × {serie.reps}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}