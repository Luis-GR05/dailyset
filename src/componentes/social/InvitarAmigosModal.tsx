// src/componentes/social/InvitarAmigosModal.tsx
// Modal para invitar amigos con enlace directo y código de atleta

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import {
  X,
  Share2,
  Copy,
  Check,
  UserPlus,
  Link2,
  Users,
  Sparkles,
} from 'lucide-react';

interface InvitarAmigosModalProps {
  onCerrar: () => void;
  isLight?: boolean;
}

export default function InvitarAmigosModal({ onCerrar, isLight = false }: InvitarAmigosModalProps) {
  const { user } = useAuth();
  const { locale } = useI18n();

  const [copiadoLink, setCopiadoLink] = useState(false);
  const [copiadoCodigo, setCopiadoCodigo] = useState(false);

  const nombreUsuario = user?.nombre_usuario || user?.email?.split('@')[0] || 'atleta';
  const codigoInvitacion = nombreUsuario.replace(/^@/, '');
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dailyset.app';
  const enlaceInvitacion = `${baseUrl}/social?invitacion=${codigoInvitacion}`;

  const handleCopiarEnlace = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(enlaceInvitacion);
      setCopiadoLink(true);
      setTimeout(() => setCopiadoLink(false), 2500);
    }
  };

  const handleCopiarCodigo = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(codigoInvitacion);
      setCopiadoCodigo(true);
      setTimeout(() => setCopiadoCodigo(false), 2500);
    }
  };

  const handleCompartirNativo = async () => {
    const textoCompartir = locale === 'es'
      ? `¡Entrena conmigo en DailySet! Sigue mis rutinas y entrenamientos usando mi código @${codigoInvitacion}:`
      : `Train with me on DailySet! Follow my workouts using my code @${codigoInvitacion}:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DailySet - Comunidad de Entrenamiento',
          text: textoCompartir,
          url: enlaceInvitacion,
        });
      } catch {
        // Ignorar si el usuario cancela
      }
    } else {
      handleCopiarEnlace();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div
        className={`modal-box modal-box-md max-w-lg p-0 overflow-hidden border ${
          isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-2xl' : 'bg-neutral-900 border-neutral-800 text-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div
          className={`relative p-5 sm:p-6 border-b flex items-start justify-between ${
            isLight
              ? 'bg-gradient-to-b from-neutral-50 to-neutral-100/70 border-neutral-200'
              : 'bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isLight
                ? 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                : 'bg-black text-white border border-white/10'
            }`}>
              <UserPlus size={22} />
            </div>
            <div>
              <h3 className={`font-black text-lg sm:text-xl tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                {locale === 'es' ? 'Invitar Amigos y Atletas' : 'Invite Friends and Athletes'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {locale === 'es'
                  ? 'Comparte tu perfil para entrenar juntos y seguir el progreso mutuo.'
                  : 'Share your profile to train together and track mutual progress.'}
              </p>
            </div>
          </div>

          <button
            className={`modal-close-btn ${
              isLight ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60' : ''
            }`}
            onClick={onCerrar}
            title={locale === 'es' ? 'Cerrar' : 'Close'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Tarjeta gráfica del código de invitación */}
          <div
            className={`rounded-2xl p-5 border text-center relative overflow-hidden ${
              isLight
                ? 'bg-neutral-50 border-neutral-200 shadow-sm'
                : 'bg-black border-white/10'
            }`}
          >
            <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
              <Sparkles size={80} />
            </div>

            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              {locale === 'es' ? 'Tu Código de Atleta' : 'Your Athlete Code'}
            </span>

            <div className="flex items-center justify-center gap-2 my-2">
              <span className={`font-mono font-black text-2xl sm:text-3xl tracking-wide ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                @{codigoInvitacion}
              </span>
            </div>

            <p className={`text-xs max-w-xs mx-auto mb-4 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              {locale === 'es'
                ? 'Tus amigos pueden ingresar este código en el buscador para encontrarte al instante.'
                : 'Your friends can enter this code in the search box to find you instantly.'}
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCopiarCodigo}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  copiadoCodigo
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    : isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                }`}
              >
                {copiadoCodigo ? (
                  <>
                    <Check size={14} />
                    <span>{locale === 'es' ? '¡Código copiado!' : 'Code copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>{locale === 'es' ? 'Copiar código' : 'Copy code'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enlace directo */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider block ${
              isLight ? 'text-neutral-700' : 'text-neutral-300'
            }`}>
              {locale === 'es' ? 'Enlace Directo de Invitación' : 'Direct Invitation Link'}
            </label>

            <div className="flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-mono truncate ${
                  isLight
                    ? 'bg-neutral-50 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                }`}
              >
                <Link2 size={14} className={`shrink-0 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`} />
                <span className="truncate">{enlaceInvitacion}</span>
              </div>

              <button
                type="button"
                onClick={handleCopiarEnlace}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  copiadoLink
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    : isLight
                    ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                }`}
                title={locale === 'es' ? 'Copiar enlace directo' : 'Copy direct link'}
              >
                {copiadoLink ? <Check size={14} /> : <Copy size={14} />}
                <span className="hidden sm:inline">
                  {copiadoLink ? (locale === 'es' ? 'Copiado' : 'Copied') : (locale === 'es' ? 'Copiar enlace' : 'Copy link')}
                </span>
              </button>
            </div>
          </div>

          {/* Botón Compartir Nativo */}
          <button
            type="button"
            onClick={handleCompartirNativo}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ${
              isLight
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-black text-white border border-white/15 hover:bg-neutral-900 hover:border-white/30'
            }`}
          >
            <Share2 size={16} className="text-white" />
            <span>
              {locale === 'es' ? 'Compartir por WhatsApp o Redes' : 'Share on WhatsApp or Social Media'}
            </span>
          </button>

          {/* Beneficios de invitar */}
          <div className={`p-4 rounded-xl border space-y-2 text-xs ${
            isLight ? 'bg-neutral-50 border-neutral-200/80 text-neutral-600' : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
          }`}>
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
              <Users size={14} className={isLight ? 'text-neutral-700' : 'text-neutral-300'} />
              <span>{locale === 'es' ? '¿Cómo funciona la invitación?' : 'How does the invite work?'}</span>
            </div>
            <ul className="space-y-1 list-disc pl-4 text-[11px] leading-relaxed">
              <li>
                {locale === 'es'
                  ? 'Si tu amigo ya tiene cuenta, abrirá tu perfil directamente para seguirte en 1 clic.'
                  : 'If your friend has an account, your profile opens directly to follow you in 1 click.'}
              </li>
              <li>
                {locale === 'es'
                  ? 'Si es un nuevo atleta, se registrará conectado contigo para compartir entrenamientos.'
                  : 'If they are new, they will register connected with you to share workouts.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
