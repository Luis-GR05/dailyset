import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Play, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import {
  obtenerSesionActiva,
  descartarSesionActiva,
  ACTIVE_SESSION_EVENT,
  type SesionActivaData,
} from '../../lib/sesionActivaService';

export default function BannerEntrenamientoActivo() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [sesion, setSesion] = useState<SesionActivaData | null>(null);

  const userId = user?.id || 'anonimo';

  const checkSesion = useCallback(() => {
    const activa = obtenerSesionActiva(userId);
    setSesion(activa);
  }, [userId]);

  useEffect(() => {
    checkSesion();

    const handleUpdate = () => {
      checkSesion();
    };

    window.addEventListener(ACTIVE_SESSION_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(ACTIVE_SESSION_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [checkSesion]);

  // Si estamos en la propia pantalla de entrenamiento o no hay sesión activa, no mostrar banner
  if (!sesion || location.pathname === '/mis-rutinas/entrenamiento') {
    return null;
  }

  const minutosTranscurridos = Math.max(
    1,
    Math.round((Date.now() - sesion.startedAtMs) / (1000 * 60))
  );

  const totalSeriesHechas = sesion.ejerciciosUI.reduce(
    (acc, ej) => acc + ej.series.filter(s => s.completada).length,
    0
  );

  const handleReanudar = () => {
    navigate('/mis-rutinas/entrenamiento', {
      state: {
        rutinaId: sesion.rutinaId,
        nombre: sesion.nombreRutina,
        recuperarActiva: true,
      },
    });
  };

  const handleDescartar = () => {
    descartarSesionActiva(userId);
    setSesion(null);
  };

  return (
    <div className="mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className="rounded-2xl p-3.5 sm:p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg bg-neutral-900 border-neutral-800 hover:border-[var(--color-primary)]/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: 'rgba(219,240,89,0.15)',
              borderColor: 'rgba(219,240,89,0.35)',
              color: 'var(--color-primary)',
            }}
          >
            <Dumbbell size={20} className="animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-black">
                {locale === 'es' ? 'En curso' : 'In progress'}
              </span>
              <h4 className="text-xs sm:text-sm font-black text-white truncate">
                {locale === 'es'
                  ? 'Tienes un entrenamiento sin terminar'
                  : 'You have an unfinished workout'}
              </h4>
            </div>

            <p className="text-xs text-neutral-300 truncate mt-0.5 flex items-center gap-2">
              <strong className="text-white">{sesion.nombreRutina}</strong>
              <span className="text-neutral-500">·</span>
              <span className="flex items-center gap-1 text-neutral-400">
                <Clock size={12} />
                {minutosTranscurridos} min
              </span>
              {totalSeriesHechas > 0 && (
                <>
                  <span className="text-neutral-500">·</span>
                  <span className="flex items-center gap-1 text-[var(--color-primary)]">
                    <CheckCircle2 size={12} />
                    {totalSeriesHechas} {locale === 'es' ? 'series' : 'sets'}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleDescartar}
            className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title={locale === 'es' ? 'Descartar entrenamiento' : 'Discard workout'}
          >
            <Trash2 size={13} />
            <span>{locale === 'es' ? 'Descartar' : 'Discard'}</span>
          </button>

          <button
            type="button"
            onClick={handleReanudar}
            className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#000000',
            }}
          >
            <Play size={13} fill="#000000" />
            <span>{locale === 'es' ? 'Continuar' : 'Continue'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
