// src/componentes/social/PerfilPublicoCard.tsx
// Tarjeta de perfil público para la búsqueda y descubrimiento de usuarios

import type { PerfilPublico } from '../../types/social';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import BotonSeguir from './BotonSeguir';
import { User, Dumbbell, Users, Sparkles } from 'lucide-react';

interface PerfilPublicoCardProps {
  perfil: PerfilPublico;
  onClick?: () => void;
  isLight?: boolean;
}

export default function PerfilPublicoCard({ perfil, onClick, isLight = false }: PerfilPublicoCardProps) {
  const { user } = useAuth();
  const { locale } = useI18n();

  const esYo = user?.id === perfil.id;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col justify-between gap-4 border ${
        isLight
          ? 'bg-white border-neutral-200/90 text-neutral-900 shadow-sm hover:border-neutral-300 hover:shadow-md'
          : 'bg-black border-white/10 text-white hover:border-white/50 transition-colors duration-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* ── Cabecera: Avatar, Info y Botón Seguir ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0 border ${
              isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-800 border-white/10'
            }`}
          >
            {perfil.avatar_url ? (
              <img
                src={perfil.avatar_url}
                alt={perfil.nombre_completo || perfil.nombre_usuario}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={22} className={isLight ? 'text-neutral-500' : 'text-neutral-400'} />
            )}
          </div>

          {/* Nombres y Nivel */}
          <div className="min-w-0">
            <h4 className={`font-bold text-base truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              {perfil.nombre_completo || perfil.nombre_usuario}
            </h4>
            <p className={`text-xs truncate ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              @{perfil.nombre_usuario}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {perfil.nivel_entrenamiento && (
                <span
                  className={`inline-block text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-neutral-100 text-neutral-800 border-neutral-200'
                      : 'bg-neutral-800 text-white border border-neutral-700'
                  }`}
                >
                  {perfil.nivel_entrenamiento}
                </span>
              )}

              {perfil.tipoSugerencia && (
                <span
                  className={`inline-flex items-center gap-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                    perfil.tipoSugerencia === 'popular'
                      ? isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : perfil.tipoSugerencia === 'creador_activo'
                      ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : perfil.tipoSugerencia === 'nuevo'
                      ? isLight ? 'bg-neutral-100 text-neutral-900 border-neutral-300' : 'bg-white/10 text-white border-white/20'
                      : isLight ? 'bg-neutral-100 text-neutral-800 border-neutral-200' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  }`}
                >
                  <Sparkles size={8} className={perfil.tipoSugerencia === 'nuevo' ? (isLight ? 'text-neutral-900' : 'text-white') : undefined} />
                  <span>
                    {perfil.tipoSugerencia === 'popular'
                      ? (locale === 'es' ? 'Popular' : 'Popular')
                      : perfil.tipoSugerencia === 'creador_activo'
                      ? (locale === 'es' ? 'Creador Activo' : 'Active Creator')
                      : perfil.tipoSugerencia === 'nuevo'
                      ? (locale === 'es' ? 'Nuevo' : 'New')
                      : (locale === 'es' ? 'Sugerido' : 'Suggested')}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botón Seguir */}
        {!esYo && (
          <BotonSeguir targetUserId={perfil.id} size="sm" isLight={isLight} />
        )}
      </div>

      {/* ── Bio / Descripción ── */}
      {perfil.bio && (
        <p className={`text-xs line-clamp-2 italic ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
          "{perfil.bio}"
        </p>
      )}

      {/* ── Métricas resumidas ── */}
      <div className={`grid grid-cols-2 gap-2 pt-3 border-t text-center ${isLight ? 'border-neutral-200/80' : 'border-neutral-800/60'}`}>
        <div
          className={`rounded-xl p-2 border ${
            isLight
              ? 'bg-neutral-50 border-neutral-200/80'
              : 'bg-neutral-950/40 border-neutral-800/40'
          }`}
        >
          <div className={`flex items-center justify-center gap-1 text-xs mb-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            <Dumbbell size={12} className="text-[var(--color-primary)]" />
            <span>{locale === 'es' ? 'Rutinas' : 'Routines'}</span>
          </div>
          <p className={`text-base font-extrabold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            {perfil.rutinasCount ?? 0}
          </p>
        </div>

        <div
          className={`rounded-xl p-2 border ${
            isLight
              ? 'bg-neutral-50 border-neutral-200/80'
              : 'bg-neutral-950/40 border-neutral-800/40'
          }`}
        >
          <div className={`flex items-center justify-center gap-1 text-xs mb-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            <Users size={12} className={isLight ? 'text-neutral-500' : 'text-neutral-400'} />
            <span>{locale === 'es' ? 'Seguidores' : 'Followers'}</span>
          </div>
          <p className={`text-base font-extrabold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
            {perfil.seguidoresCount ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
