// src/componentes/social/ModalPerfilPublico.tsx
// Modal detallado para visualizar el perfil público de un atleta, rutinas compartidas y opciones de moderación

import { useEffect, useState } from 'react';
import type { PerfilPublico, RutinaPublica } from '../../types/social';
import { getPerfilPublico, getRutinasPublicasDeUsuario } from '../../lib/socialService';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { useI18n } from '../../context/I18nContext';
import BotonSeguir from './BotonSeguir';
import RutinaPublicaCard from './RutinaPublicaCard';
import ModalReportar from './ModalReportar';
import {
  X,
  User,
  Dumbbell,
  Loader2,
  Globe,
  Flag,
  Ban,
  MoreVertical,
  Sparkles,
  Check,
} from 'lucide-react';

interface ModalPerfilPublicoProps {
  perfilId: string;
  onCerrar: () => void;
  isLight?: boolean;
  esInvitacion?: boolean;
}

export default function ModalPerfilPublico({
  perfilId,
  onCerrar,
  isLight = false,
  esInvitacion = false,
}: ModalPerfilPublicoProps) {
  const { user } = useAuth();
  const { bloqueadosIds, estaBloqueado, bloquearAtleta, desbloquearAtleta } = useSocial();
  const { locale } = useI18n();

  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [rutinas, setRutinas] = useState<RutinaPublica[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados de moderación
  const [menuOpcionesAbierto, setMenuOpcionesAbierto] = useState(false);
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
  const [mostrarConfirmacionBloqueo, setMostrarConfirmacionBloqueo] = useState(false);
  const [bloqueando, setBloqueando] = useState(false);

  const usuarioEstaBloqueado = estaBloqueado(perfilId);

  useEffect(() => {
    let cancelado = false;

    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [pData, rData] = await Promise.all([
          getPerfilPublico(perfilId, user?.id, bloqueadosIds),
          getRutinasPublicasDeUsuario(perfilId),
        ]);
        if (!cancelado) {
          setPerfil(pData);
          setRutinas(rData);
        }
      } catch (err) {
        console.error('Error cargando perfil detallado:', err);
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [perfilId, user?.id, bloqueadosIds]);

  const esYo = user?.id === perfilId;

  const handleEjecutarBloqueo = async () => {
    setBloqueando(true);
    try {
      await bloquearAtleta(perfilId);
      setMostrarConfirmacionBloqueo(false);
      setMenuOpcionesAbierto(false);
    } catch (err) {
      console.error('Error bloqueando usuario:', err);
    } finally {
      setBloqueando(false);
    }
  };

  const handleDesbloquear = async () => {
    setBloqueando(true);
    try {
      await desbloquearAtleta(perfilId);
    } catch (err) {
      console.error('Error desbloqueando usuario:', err);
    } finally {
      setBloqueando(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onCerrar}>
        <div
          className={`modal-box modal-box-lg max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border ${
            isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-2xl' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}
          onClick={e => {
            e.stopPropagation();
            setMenuOpcionesAbierto(false);
          }}
        >
          {/* Cabecera / Banner */}
          <div
            className={`relative p-5 sm:p-6 border-b ${
              isLight
                ? 'bg-gradient-to-b from-neutral-50 to-neutral-100/70 border-neutral-200'
                : 'bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-neutral-800'
            }`}
          >
            {/* Botones de Cabecera (Menú de opciones y Cerrar) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
              {!esYo && perfil && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setMenuOpcionesAbierto(!menuOpcionesAbierto);
                    }}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isLight
                        ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                    title={locale === 'es' ? 'Opciones de moderación' : 'Moderation options'}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Menú desplegable */}
                  {menuOpcionesAbierto && (
                    <div
                      className={`absolute right-0 top-full mt-1.5 w-48 rounded-xl p-1.5 shadow-xl border z-50 animate-in fade-in zoom-in-95 ${
                        isLight
                          ? 'bg-white border-neutral-200 text-neutral-900'
                          : 'bg-neutral-900 border-neutral-800 text-white shadow-2xl'
                      }`}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpcionesAbierto(false);
                          setMostrarModalReporte(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      >
                        <Flag size={13} />
                        <span>{locale === 'es' ? 'Reportar perfil' : 'Report profile'}</span>
                      </button>

                      {usuarioEstaBloqueado ? (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpcionesAbierto(false);
                            handleDesbloquear();
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer ${
                            isLight ? 'hover:bg-neutral-100 text-neutral-800' : 'hover:bg-neutral-800 text-neutral-200'
                          }`}
                        >
                          <Check size={13} />
                          <span>{locale === 'es' ? 'Desbloquear atleta' : 'Unblock athlete'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpcionesAbierto(false);
                            setMostrarConfirmacionBloqueo(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                        >
                          <Ban size={13} />
                          <span>{locale === 'es' ? 'Bloquear atleta' : 'Block athlete'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

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

            {/* Banner de Invitación si aplica */}
            {esInvitacion && (
              <div className={`mb-4 p-3 rounded-xl border flex items-center gap-2.5 ${
                isLight
                  ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)]/30 text-neutral-900'
                  : 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]'
              }`}>
                <Sparkles size={16} className="shrink-0" />
                <span className="text-xs font-bold leading-tight">
                  {locale === 'es'
                    ? 'Has recibido una invitación de este atleta. ¡Síguelo para conectar y ver sus entrenamientos!'
                    : 'You received an invitation from this athlete. Follow them to connect and view their workouts!'}
                </span>
              </div>
            )}

            {/* Aviso si el usuario está bloqueado */}
            {usuarioEstaBloqueado && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Ban size={14} />
                  <span>{locale === 'es' ? 'Has bloqueado a este atleta.' : 'You have blocked this athlete.'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDesbloquear}
                  disabled={bloqueando}
                  className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-bold text-[11px] cursor-pointer"
                >
                  {locale === 'es' ? 'Desbloquear' : 'Unblock'}
                </button>
              </div>
            )}

            {cargando ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={28} className="animate-spin text-[var(--color-primary)]" />
              </div>
            ) : perfil ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 min-w-0 pr-20">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg border-2 ${
                      isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-800 border-neutral-700'
                    }`}
                  >
                    {perfil.avatar_url ? (
                      <img
                        src={perfil.avatar_url}
                        alt={perfil.nombre_completo || perfil.nombre_usuario}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={30} className={isLight ? 'text-neutral-500' : 'text-neutral-400'} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-extrabold text-lg sm:text-xl truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                        {perfil.nombre_completo || perfil.nombre_usuario}
                      </h3>
                      {esYo && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isLight
                              ? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          {locale === 'es' ? 'Tu Perfil' : 'Your Profile'}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>@{perfil.nombre_usuario}</p>
                    {perfil.nivel_entrenamiento && (
                      <span
                        className={`inline-block mt-1 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                          isLight
                            ? 'bg-neutral-100 text-neutral-800 border-neutral-200'
                            : 'bg-neutral-800 text-white border border-neutral-700'
                        }`}
                      >
                        {perfil.nivel_entrenamiento}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botón Seguir / Dejar de seguir destacado y sin solapamiento */}
                {!esYo && !usuarioEstaBloqueado && (
                  <div className="pt-0.5">
                    <BotonSeguir
                      targetUserId={perfil.id}
                      isLight={isLight}
                      className="w-full py-2.5 rounded-xl justify-center text-sm font-bold shadow-sm"
                    />
                  </div>
                )}

                {perfil.bio && (
                  <p
                    className={`text-xs sm:text-sm p-3 rounded-xl border ${
                      isLight
                        ? 'text-neutral-700 bg-white border-neutral-200/90'
                        : 'text-neutral-300 bg-neutral-950/40 border-neutral-800/60'
                    }`}
                  >
                    "{perfil.bio}"
                  </p>
                )}

                {/* Estadísticas del perfil */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div
                    className={`rounded-xl p-2.5 text-center border ${
                      isLight
                        ? 'bg-white border-neutral-200/90 shadow-sm'
                        : 'bg-neutral-900/90 border-neutral-800'
                    }`}
                  >
                    <span className={`text-[11px] font-medium block ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {locale === 'es' ? 'Seguidores' : 'Followers'}
                    </span>
                    <span className={`text-base font-extrabold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      {perfil.seguidoresCount ?? 0}
                    </span>
                  </div>

                  <div
                    className={`rounded-xl p-2.5 text-center border ${
                      isLight
                        ? 'bg-white border-neutral-200/90 shadow-sm'
                        : 'bg-neutral-900/90 border-neutral-800'
                    }`}
                  >
                    <span className={`text-[11px] font-medium block ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {locale === 'es' ? 'Siguiendo' : 'Following'}
                    </span>
                    <span className={`text-base font-extrabold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      {perfil.siguiendoCount ?? 0}
                    </span>
                  </div>

                  <div
                    className={`rounded-xl p-2.5 text-center border ${
                      isLight
                        ? 'bg-white border-neutral-200/90 shadow-sm'
                        : 'bg-neutral-900/90 border-neutral-800'
                    }`}
                  >
                    <span className={`text-[11px] font-medium block ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {locale === 'es' ? 'Rutinas' : 'Routines'}
                    </span>
                    <span className={`text-base font-extrabold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                      {perfil.rutinasCount ?? rutinas.length}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className={`text-sm text-center py-4 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {locale === 'es' ? 'Perfil no encontrado' : 'Profile not found'}
              </p>
            )}
          </div>

          {/* Lista de rutinas públicas compartidas por el usuario */}
          <div className={`p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 ${isLight ? 'bg-neutral-50/50' : ''}`}>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[var(--color-primary)]" />
              <h4 className={`font-bold text-sm ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                {locale === 'es'
                  ? `Rutinas compartidas (${rutinas.length})`
                  : `Shared routines (${rutinas.length})`}
              </h4>
            </div>

            {cargando ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={24} className="animate-spin text-neutral-500" />
              </div>
            ) : usuarioEstaBloqueado ? (
              <div className={`text-center py-8 px-4 rounded-xl border border-dashed ${isLight ? 'border-neutral-200 bg-white' : 'border-neutral-800'}`}>
                <Ban size={28} className={`mx-auto mb-2 text-red-500`} />
                <p className={`text-xs font-medium ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  {locale === 'es'
                    ? 'El contenido de este atleta está oculto porque lo has bloqueado.'
                    : 'This athlete content is hidden because you blocked them.'}
                </p>
              </div>
            ) : rutinas.length === 0 ? (
              <div className={`text-center py-8 px-4 rounded-xl border border-dashed ${isLight ? 'border-neutral-200 bg-white' : 'border-neutral-800'}`}>
                <Dumbbell size={28} className={`mx-auto mb-2 ${isLight ? 'text-neutral-400' : 'text-neutral-600'}`} />
                <p className={`text-xs font-medium ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {locale === 'es'
                    ? 'Este atleta aún no ha compartido rutinas públicas.'
                    : 'This athlete has not shared any public routines yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rutinas.map(r => (
                  <RutinaPublicaCard
                    key={r.id}
                    rutina={{ ...r, perfil: perfil || undefined }}
                    isLight={isLight}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reporte */}
      {mostrarModalReporte && perfil && (
        <ModalReportar
          tipo="usuario"
          targetUsuarioId={perfil.id}
          targetNombreUsuario={perfil.nombre_usuario}
          onCerrar={() => setMostrarModalReporte(false)}
          onReporteEnviado={() => setMostrarModalReporte(false)}
          isLight={isLight}
        />
      )}

      {/* Modal de Confirmación de Bloqueo */}
      {mostrarConfirmacionBloqueo && perfil && (
        <div className="modal-overlay" onClick={() => setMostrarConfirmacionBloqueo(false)}>
          <div
            className={`modal-box modal-box-sm max-w-sm p-5 border text-center space-y-4 ${
              isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-2xl' : 'bg-neutral-900 border-neutral-800 text-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 mx-auto flex items-center justify-center">
              <Ban size={24} />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-base">
                {locale === 'es'
                  ? `¿Bloquear a @${perfil.nombre_usuario}?`
                  : `Block @${perfil.nombre_usuario}?`}
              </h4>
              <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                {locale === 'es'
                  ? 'Dejarán de seguirse mutuamente y no verás sus rutinas ni publicaciones en la comunidad.'
                  : 'You will unfollow each other and you will not see their workouts in the community.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMostrarConfirmacionBloqueo(false)}
                disabled={bloqueando}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleEjecutarBloqueo}
                disabled={bloqueando}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {bloqueando ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Ban size={13} />
                )}
                <span>{locale === 'es' ? 'Sí, Bloquear' : 'Yes, Block'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
