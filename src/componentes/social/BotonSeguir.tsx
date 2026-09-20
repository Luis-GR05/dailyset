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
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function BotonSeguir({
  targetUserId,
  size = 'md',
  className = '',
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
            ? 'bg-red-500/15 border border-red-500/30 text-red-400'
            : 'bg-neutral-800/80 border border-neutral-700/80 text-neutral-200'
          : 'shadow-md'
      } ${className}`}
      style={
        !siguiendo
          ? {
              backgroundColor: 'var(--color-primary)',
              color: '#000000',
            }
          : undefined
      }
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
        <Loader2 size={isSmall ? 12 : 14} className="animate-spin" />
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
          <UserPlus size={isSmall ? 12 : 14} />
          <span>{locale === 'es' ? 'Seguir' : 'Follow'}</span>
        </>
      )}
    </button>
  );
}
