// src/componentes/social/BotonSeguir.tsx
// Botón interactivo y optimista para Seguir / Dejar de seguir a un usuario

import { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

interface BotonSeguirProps {
  targetUserId: string;
  size?: 'sm' | 'md';
  className?: string;
  isLight?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function BotonSeguir({
  targetUserId,
  size = 'md',
  className = '',
  isLight = false,
  onFollowChange,
}: BotonSeguirProps) {
  const { user } = useAuth();
  const { estaSiguiendo, toggleSeguir } = useSocial();
  const { locale } = useI18n();

  const [cargando, setCargando] = useState(false);
  const [hovered, setHovered] = useState(false);

  // No mostrar botón si es el propio perfil del usuario logueado
  if (!user || user.id === targetUserId) {
    return null;
  }

  const siguiendo = estaSiguiendo(targetUserId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cargando) return;

    setCargando(true);
    try {
      const nuevoEstado = await toggleSeguir(targetUserId);
      onFollowChange?.(nuevoEstado);
    } catch (err) {
      console.error('Error al toggle de seguimiento:', err);
    } finally {
      setCargando(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cargando}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex items-center justify-center gap-1.5 font-bold transition-all rounded-xl active:scale-95 cursor-pointer select-none ${
        isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm'
      } ${
        siguiendo
          ? hovered
            ? 'bg-red-500/15 border border-red-500/30 text-red-500'
            : isLight
            ? 'bg-neutral-100 border border-neutral-200 text-neutral-700 shadow-sm'
            : 'bg-black/60 border border-white/10 text-neutral-300'
          : isLight
          ? 'bg-black text-white border border-neutral-900 hover:bg-neutral-900 shadow-sm'
          : 'bg-black border border-white/20 text-white hover:bg-neutral-900 hover:border-white/35 shadow-sm'
      } ${className}`}
      title={
        siguiendo
          ? locale === 'es'
            ? 'Dejar de seguir'
            : 'Unfollow'
          : locale === 'es'
          ? 'Seguir a este atleta'
          : 'Follow this athlete'
      }
    >
      {cargando ? (
        <Loader2 size={isSmall ? 12 : 14} className="animate-spin text-white" />
      ) : siguiendo ? (
        hovered ? (
          <span>{locale === 'es' ? 'Dejar de seguir' : 'Unfollow'}</span>
        ) : (
          <>
            <UserCheck size={isSmall ? 12 : 14} className="text-emerald-400" />
            <span>{locale === 'es' ? 'Siguiendo' : 'Following'}</span>
          </>
        )
      ) : (
        <>
          <UserPlus size={isSmall ? 12 : 14} className="text-white" />
          <span className="text-white font-bold">{locale === 'es' ? 'Seguir' : 'Follow'}</span>
        </>
      )}
    </button>
  );
}
