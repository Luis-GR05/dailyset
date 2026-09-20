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
}

export default function ModalPerfilPublico({ perfilId, onCerrar }: ModalPerfilPublicoProps) {
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
        className="modal-box modal-box-lg max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera / Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-neutral-800">
          <button
            className="absolute top-4 right-4 modal-close-btn"
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
                  <div className="w-16 h-16 rounded-2xl bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                    {perfil.avatar_url ? (
                      <img
                        src={perfil.avatar_url}
                        alt={perfil.nombre_completo || perfil.nombre_usuario}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={30} className="text-neutral-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-lg sm:text-xl text-white truncate">
                        {perfil.nombre_completo || perfil.nombre_usuario}
                      </h3>
                      {esYo && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {locale === 'es' ? 'Tu Perfil' : 'Your Profile'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">@{perfil.nombre_usuario}</p>
                    {perfil.nivel_entrenamiento && (
                      <span className="inline-block mt-1 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-neutral-800 text-[var(--color-primary)] border border-neutral-700">
                        {perfil.nivel_entrenamiento}
                      </span>
                    )}
                  </div>
                </div>

                {!esYo && (
                  <BotonSeguir targetUserId={perfil.id} />
                )}
              </div>

              {perfil.bio && (
                <p className="text-xs sm:text-sm text-neutral-300 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60">
                  "{perfil.bio}"
                </p>
              )}

              {/* Estadísticas del perfil */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="bg-neutral-900/90 rounded-xl p-2.5 text-center border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-medium block">
                    {locale === 'es' ? 'Seguidores' : 'Followers'}
                  </span>
                  <span className="text-base font-extrabold text-white">
                    {perfil.seguidoresCount ?? 0}
                  </span>
                </div>

                <div className="bg-neutral-900/90 rounded-xl p-2.5 text-center border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-medium block">
                    {locale === 'es' ? 'Siguiendo' : 'Following'}
                  </span>
                  <span className="text-base font-extrabold text-white">
                    {perfil.siguiendoCount ?? 0}
                  </span>
                </div>

                <div className="bg-neutral-900/90 rounded-xl p-2.5 text-center border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-medium block">
                    {locale === 'es' ? 'Rutinas' : 'Routines'}
                  </span>
                  <span className="text-base font-extrabold text-white">
                    {perfil.rutinasCount ?? rutinas.length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-4">
              {locale === 'es' ? 'Perfil no encontrado' : 'Profile not found'}
            </p>
          )}
        </div>

        {/* Lista de rutinas públicas compartidas por el usuario */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[var(--color-primary)]" />
            <h4 className="font-bold text-white text-sm">
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
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-neutral-800">
              <Dumbbell size={28} className="mx-auto text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400 font-medium">
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
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
