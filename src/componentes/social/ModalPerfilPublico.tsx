// src/componentes/social/ModalPerfilPublico.tsx
// Modal detallado para visualizar el perfil público de un atleta y sus rutinas compartidas

import { useEffect, useState } from 'react';
import type { PerfilPublico, RutinaPublica } from '../../types/social';
import { getPerfilPublico, getRutinasPublicasDeUsuario } from '../../lib/socialService';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import BotonSeguir from './BotonSeguir';
import RutinaPublicaCard from './RutinaPublicaCard';
import { X, User, Dumbbell, Loader2, Globe } from 'lucide-react';

interface ModalPerfilPublicoProps {
  perfilId: string;
  onCerrar: () => void;
  isLight?: boolean;
}

export default function ModalPerfilPublico({ perfilId, onCerrar, isLight = false }: ModalPerfilPublicoProps) {
  const { user } = useAuth();
  const { locale } = useI18n();

  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [rutinas, setRutinas] = useState<RutinaPublica[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [pData, rData] = await Promise.all([
          getPerfilPublico(perfilId, user?.id),
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
  }, [perfilId, user?.id]);

  const esYo = user?.id === perfilId;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div
        className={`modal-box modal-box-lg max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border ${
          isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-2xl' : 'bg-neutral-900 border-neutral-800 text-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera / Banner */}
        <div
          className={`relative p-5 sm:p-6 border-b ${
            isLight
              ? 'bg-gradient-to-b from-neutral-50 to-neutral-100/70 border-neutral-200'
              : 'bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-neutral-800'
          }`}
        >
          <button
            className={`absolute top-4 right-4 modal-close-btn ${
              isLight ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60' : ''
            }`}
            onClick={onCerrar}
            title={locale === 'es' ? 'Cerrar' : 'Close'}
          >
            <X size={16} />
          </button>

          {cargando ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={28} className="animate-spin text-[var(--color-primary)]" />
            </div>
          ) : perfil ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
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

                  <div className="min-w-0">
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
                            : 'bg-neutral-800 text-[var(--color-primary)] border border-neutral-700'
                        }`}
                      >
                        {perfil.nivel_entrenamiento}
                      </span>
                    )}
                  </div>
                </div>

                {!esYo && (
                  <BotonSeguir targetUserId={perfil.id} isLight={isLight} />
                )}
              </div>

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
  );
}
