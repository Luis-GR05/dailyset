// src/componentes/social/RutinaPublicaCard.tsx
// Tarjeta de rutina pública para el Feed Social

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RutinaPublica } from '../../types/social';
import { useSocial } from '../../context/SocialContext';
import { useRutinas } from '../../context/RutinasContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { getCategoriaColor } from '../../data/rutinasPredefinidas';
import BotonSeguir from './BotonSeguir';
import {
  Copy,
  Check,
  Dumbbell,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  Play,
  Share2,
  Loader2,
  Globe,
} from 'lucide-react';

interface RutinaPublicaCardProps {
  rutina: RutinaPublica;
  onVerPerfil?: (perfilId: string) => void;
}

export default function RutinaPublicaCard({ rutina, onVerPerfil }: RutinaPublicaCardProps) {
  const { user } = useAuth();
  const { clonarRutinaSocial } = useSocial();
  const { refrescar: refrescarMisRutinas } = useRutinas();
  const { locale } = useI18n();
  const navigate = useNavigate();

  const [expandido, setExpandido] = useState(false);
  const [clonando, setClonando] = useState(false);
  const [clonadoExitoso, setClonadoExitoso] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(false);

  const esMiRutina = user?.id === rutina.usuario_id;
  const perfil = rutina.perfil;
  const catColor = getCategoriaColor(rutina.categoria);

  const handleClonar = async () => {
    if (clonando || clonadoExitoso) return;
    setClonando(true);
    try {
      await clonarRutinaSocial(rutina.id);
      await refrescarMisRutinas();
      setClonadoExitoso(true);
      setTimeout(() => setClonadoExitoso(false), 4000);
    } catch (err) {
      console.error('Error clonando rutina:', err);
    } finally {
      setClonando(false);
    }
  };

  const handleEntrenar = () => {
    navigate('/mis-rutinas/entrenamiento', {
      state: {
        nombre: rutina.nombre,
        rutinaId: rutina.id,
        ejerciciosIds: rutina.ejerciciosIds || (rutina.ejercicios || []).map(e => e.id),
      },
    });
  };

  const handleCompartir = async () => {
    const url = `${window.location.origin}/social?rutina=${rutina.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiadoLink(true);
      setTimeout(() => setCopiadoLink(false), 2500);
    }
  };

  return (
    <article className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-neutral-700/80 transition-all shadow-lg flex flex-col gap-3.5">
      {/* ── 1. Cabecera del Creador ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          onClick={() => onVerPerfil?.(rutina.usuario_id)}
          className="flex items-center gap-3 cursor-pointer group select-none min-w-0"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[var(--color-primary)] transition-colors">
            {perfil?.avatar_url ? (
              <img
                src={perfil.avatar_url}
                alt={perfil.nombre_completo || perfil.nombre_usuario}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
            )}
          </div>

          {/* Info del Creador */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-sm text-white truncate group-hover:text-[var(--color-primary)] transition-colors">
                {perfil?.nombre_completo || perfil?.nombre_usuario || 'Atleta DailySet'}
              </h4>
              {esMiRutina && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                  {locale === 'es' ? 'Tú' : 'You'}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 truncate">
              @{perfil?.nombre_usuario || 'atleta'}
              {perfil?.nivel_entrenamiento && (
                <span className="ml-1.5 text-[10px] font-semibold text-neutral-500 uppercase">
                  · {perfil.nivel_entrenamiento}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Botón Seguir (solo si no es su propia rutina) */}
        {!esMiRutina && (
          <BotonSeguir targetUserId={rutina.usuario_id} size="sm" />
        )}
      </div>

      {/* ── 2. Cuerpo de la Rutina ── */}
      <div className="space-y-2 pt-1 border-t border-neutral-800/40">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
            {rutina.nombre}
          </h3>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm"
              style={{ background: catColor.bg, color: catColor.text }}
            >
              {rutina.categoria}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe size={10} />
              {locale === 'es' ? 'Pública' : 'Public'}
            </span>
          </div>
        </div>

        {/* Metadatos: Duración y conteo de ejercicios */}
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-neutral-500" />
            {rutina.duracion_estimada_minutos} min
          </span>
          <span className="flex items-center gap-1.5">
            <Dumbbell size={13} className="text-neutral-500" />
            {rutina.ejerciciosCount || (rutina.ejercicios || []).length}{' '}
            {locale === 'es' ? 'ejercicios' : 'exercises'}
          </span>
        </div>
      </div>

      {/* ── 3. Lista desplegable de Ejercicios ── */}
      {rutina.ejercicios && rutina.ejercicios.length > 0 && (
        <div className="pt-2 border-t border-neutral-800/60">
          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            className="w-full flex items-center justify-between text-xs font-bold text-neutral-400 hover:text-neutral-200 transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Dumbbell size={13} style={{ color: 'var(--color-primary)' }} />
              {expandido
                ? locale === 'es'
                  ? 'Ocultar ejercicios'
                  : 'Hide exercises'
                : locale === 'es'
                ? `Ver ejercicios (${rutina.ejercicios.length})`
                : `View exercises (${rutina.ejercicios.length})`}
            </span>
            {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expandido && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {rutina.ejercicios.map((ej, index) => (
                <div
                  key={`${ej.id}-${index}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/40 border border-neutral-700/30 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-neutral-500">#{index + 1}</span>
                    <span className="font-medium text-neutral-200 truncate">{ej.nombre}</span>
                  </div>
                  {ej.grupo && (
                    <span className="text-[10px] text-neutral-400 shrink-0 font-medium">{ej.grupo}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. Barra de Acciones ── */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/60 mt-1 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Botón Clonar Rutina */}
          {!esMiRutina ? (
            <button
              type="button"
              onClick={handleClonar}
              disabled={clonando || clonadoExitoso}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                clonadoExitoso
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
              }`}
              title={
                locale === 'es'
                  ? 'Guardar una copia de esta rutina en tus rutinas'
                  : 'Save a copy of this routine to your routines'
              }
            >
              {clonando ? (
                <Loader2 size={13} className="animate-spin" />
              ) : clonadoExitoso ? (
                <>
                  <Check size={13} />
                  <span>{locale === 'es' ? '¡Clonada en tus rutinas!' : 'Cloned to routines!'}</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>{locale === 'es' ? 'Clonar rutina' : 'Clone routine'}</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-xs text-neutral-500 font-medium">
              {locale === 'es' ? 'Tu rutina compartida' : 'Your shared routine'}
            </span>
          )}

          {/* Botón Compartir enlace */}
          <button
            type="button"
            onClick={handleCompartir}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title={locale === 'es' ? 'Copiar enlace directo' : 'Copy direct link'}
          >
            {copiadoLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          </button>
        </div>

        {/* Botón Entrenar Ahora */}
        <button
          type="button"
          onClick={handleEntrenar}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#000000',
          }}
        >
          <Play size={13} fill="#000000" />
          <span>{locale === 'es' ? 'Entrenar' : 'Train'}</span>
        </button>
      </div>
    </article>
  );
}
