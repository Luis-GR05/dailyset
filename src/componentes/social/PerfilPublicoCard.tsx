// src/componentes/social/PerfilPublicoCard.tsx
// Tarjeta de perfil público para la búsqueda y descubrimiento de usuarios

import type { PerfilPublico } from '../../types/social';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import BotonSeguir from './BotonSeguir';
import { User, Dumbbell, Users } from 'lucide-react';

interface PerfilPublicoCardProps {
  perfil: PerfilPublico;
  onClick?: () => void;
}

export default function PerfilPublicoCard({ perfil, onClick }: PerfilPublicoCardProps) {
  const { user } = useAuth();
  const { locale } = useI18n();

  const esYo = user?.id === perfil.id;

  return (
    <div
      onClick={onClick}
      className={`bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col justify-between gap-4 ${
        onClick ? 'hover:border-neutral-700 cursor-pointer' : ''
      }`}
    >
      {/* ── Cabecera: Avatar, Info y Botón Seguir ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {perfil.avatar_url ? (
              <img
                src={perfil.avatar_url}
                alt={perfil.nombre_completo || perfil.nombre_usuario}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={22} className="text-neutral-400" />
            )}
          </div>

          {/* Nombres y Nivel */}
          <div className="min-w-0">
            <h4 className="font-bold text-white text-base truncate">
              {perfil.nombre_completo || perfil.nombre_usuario}
            </h4>
            <p className="text-xs text-neutral-400 truncate">@{perfil.nombre_usuario}</p>
            {perfil.nivel_entrenamiento && (
              <span className="inline-block mt-0.5 text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-neutral-800 text-[var(--color-primary)] border border-neutral-700">
                {perfil.nivel_entrenamiento}
              </span>
            )}
          </div>
        </div>

        {/* Botón Seguir */}
        {!esYo && (
          <BotonSeguir targetUserId={perfil.id} size="sm" />
        )}
      </div>

      {/* ── Bio / Descripción ── */}
      {perfil.bio && (
        <p className="text-xs text-neutral-300 line-clamp-2 italic">
          "{perfil.bio}"
        </p>
      )}

      {/* ── Métricas resumidas ── */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800/60 text-center">
        <div className="bg-neutral-950/40 rounded-xl p-2 border border-neutral-800/40">
          <div className="flex items-center justify-center gap-1 text-neutral-400 text-xs mb-0.5">
            <Dumbbell size={12} className="text-[var(--color-primary)]" />
            <span>{locale === 'es' ? 'Rutinas' : 'Routines'}</span>
          </div>
          <p className="text-base font-extrabold text-white">{perfil.rutinasCount ?? 0}</p>
        </div>

        <div className="bg-neutral-950/40 rounded-xl p-2 border border-neutral-800/40">
          <div className="flex items-center justify-center gap-1 text-neutral-400 text-xs mb-0.5">
            <Users size={12} className="text-neutral-400" />
            <span>{locale === 'es' ? 'Seguidores' : 'Followers'}</span>
          </div>
          <p className="text-base font-extrabold text-white">{perfil.seguidoresCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
