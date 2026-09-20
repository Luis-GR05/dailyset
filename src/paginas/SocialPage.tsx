// src/paginas/SocialPage.tsx
// Página principal del apartado Social de DailySet

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppLayout } from '../componentes';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { useRutinas } from '../context/RutinasContext';
import { useI18n } from '../context/I18nContext';
import RutinaPublicaCard from '../componentes/social/RutinaPublicaCard';
import PerfilPublicoCard from '../componentes/social/PerfilPublicoCard';
import ModalPerfilPublico from '../componentes/social/ModalPerfilPublico';
import { supabase } from '../lib/supabaseClient';
import {
  Users,
  Search,
  RefreshCw,
  Globe,
  Lock,
  User,
  Dumbbell,
  Compass,
  Check,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';

type TabSocial = 'feed' | 'explorar' | 'mi_perfil';

export default function SocialPage() {
  const { user } = useAuth();
  const { rutinas, togglePrivacidad } = useRutinas();
  const {
    feed,
    cargandoFeed,
    errorFeed,
    filtroFeed,
    setFiltroFeed,
    busquedaQuery,
    setBusquedaQuery,
    usuariosEncontrados,
    buscandoUsuarios,
    refrescarFeed,
  } = useSocial();
  const { locale } = useI18n();

  const [searchParams, setSearchParams] = useSearchParams();
  const [tabActiva, setTabActiva] = useState<TabSocial>('feed');

  // Estado para el modal de visualización de perfil ajeno
  const [perfilSeleccionadoId, setPerfilSeleccionadoId] = useState<string | null>(null);

  // Estados para editar la bio en "Mi Perfil Social"
  const [bioTexto, setBioTexto] = useState('');
  const [guardandoBio, setGuardandoBio] = useState(false);
  const [bioGuardadaExito, setBioGuardadaExito] = useState(false);

  // Cargar bio del usuario actual al montar
  useEffect(() => {
    if (!user?.id) return;
    const fetchMiBio = async () => {
      const { data } = await supabase
        .from('perfiles')
        .select('bio')
        .eq('id', user.id)
        .single();
      if (data?.bio) setBioTexto(data.bio);
    };
    fetchMiBio();
  }, [user?.id]);

  // Si la URL contiene ?perfil=USER_ID, abrir el modal de ese perfil automáticamente
  useEffect(() => {
    const perfilQuery = searchParams.get('perfil');
    if (perfilQuery) {
      setPerfilSeleccionadoId(perfilQuery);
    }
  }, [searchParams]);

  const handleCerrarModalPerfil = () => {
    setPerfilSeleccionadoId(null);
    if (searchParams.has('perfil')) {
      searchParams.delete('perfil');
      setSearchParams(searchParams);
    }
  };

  const handleGuardarBio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setGuardandoBio(true);
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ bio: bioTexto.trim() })
        .eq('id', user.id);

      if (error) throw error;
      setBioGuardadaExito(true);
      setTimeout(() => setBioGuardadaExito(false), 3000);
    } catch (err) {
      console.error('Error guardando bio:', err);
    } finally {
      setGuardandoBio(false);
    }
  };

  const misRutinasPublicas = rutinas.filter(r => r.is_public);
  const misRutinasPrivadas = rutinas.filter(r => !r.is_public);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* ── Encabezado de Página ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Users size={22} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {locale === 'es' ? 'Comunidad Social' : 'Social Community'}
              </h1>
            </div>
            <p className="text-sm text-neutral-400">
              {locale === 'es'
                ? 'Descubre entrenamientos de otros atletas, comparte los tuyos y sigue a tu comunidad.'
                : 'Discover workouts from other athletes, share yours, and follow your community.'}
            </p>
          </div>

          {/* Botón rápido para ir a crear rutina */}
          <Link
            to="/mis-rutinas"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>{locale === 'es' ? 'Crear mi rutina' : 'Create routine'}</span>
          </Link>
        </div>

        {/* ── Selector de Pestañas Principales ── */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setTabActiva('feed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              tabActiva === 'feed'
                ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe size={16} className={tabActiva === 'feed' ? 'text-[var(--color-primary)]' : ''} />
            <span>{locale === 'es' ? 'Feed de Rutinas' : 'Routines Feed'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('explorar')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              tabActiva === 'explorar'
                ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass size={16} className={tabActiva === 'explorar' ? 'text-[var(--color-primary)]' : ''} />
            <span>{locale === 'es' ? 'Buscar Atletas' : 'Find Athletes'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('mi_perfil')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              tabActiva === 'mi_perfil'
                ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User size={16} className={tabActiva === 'mi_perfil' ? 'text-[var(--color-primary)]' : ''} />
            <span>{locale === 'es' ? 'Mi Perfil Público' : 'My Public Profile'}</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════════════
            PESTAÑA 1: FEED SOCIAL DE RUTINAS PÚBLICAS
        ════════════════════════════════════════════════════════════════════════════════ */}
        {tabActiva === 'feed' && (
          <div className="space-y-4">
            {/* Barra de Filtros del Feed (Todos vs Siguiendo) y Refrescar */}
            <div className="flex items-center justify-between gap-3 flex-wrap bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-800/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFiltroFeed('todos')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filtroFeed === 'todos'
                      ? 'bg-[var(--color-primary)] text-black shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Globe size={13} />
                  <span>{locale === 'es' ? 'Para ti (Todos)' : 'For you (All)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroFeed('siguiendo')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filtroFeed === 'siguiendo'
                      ? 'bg-[var(--color-primary)] text-black shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Users size={13} />
                  <span>{locale === 'es' ? 'Siguiendo' : 'Following'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => refrescarFeed()}
                disabled={cargandoFeed}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title={locale === 'es' ? 'Actualizar feed' : 'Refresh feed'}
              >
                <RefreshCw size={13} className={cargandoFeed ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{locale === 'es' ? 'Actualizar' : 'Refresh'}</span>
              </button>
            </div>

            {/* Manejo de estados: Cargando / Error / Vacío / Lista */}
            {cargandoFeed ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                <p className="text-xs text-neutral-400 font-medium">
                  {locale === 'es' ? 'Cargando rutinas de la comunidad...' : 'Loading community workouts...'}
                </p>
              </div>
            ) : errorFeed ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorFeed}</span>
              </div>
            ) : feed.length === 0 ? (
              <div className="text-center py-16 px-4 bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-800 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 mx-auto flex items-center justify-center text-neutral-500">
                  <Dumbbell size={28} />
                </div>
                <h3 className="font-extrabold text-white text-base">
                  {filtroFeed === 'siguiendo'
                    ? locale === 'es'
                      ? 'No hay publicaciones de personas que sigues'
                      : 'No posts from people you follow'
                    : locale === 'es'
                    ? 'No hay rutinas públicas compartidas todavía'
                    : 'No public routines shared yet'}
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  {filtroFeed === 'siguiendo'
                    ? locale === 'es'
                      ? 'Sigue a otros atletas desde la pestaña "Buscar Atletas" o cambia a la pestaña "Para ti" para ver todas las rutinas públicas.'
                      : 'Follow other athletes from the "Find Athletes" tab or switch to "For you" to view all public routines.'
                    : locale === 'es'
                    ? '¡Sé el primero en compartir! Al crear o editar tus rutinas en Mis Rutinas, cambia la privacidad a "Pública".'
                    : 'Be the first to share! When creating or editing your routines, switch privacy to "Public".'}
                </p>
                {filtroFeed === 'siguiendo' ? (
                  <button
                    type="button"
                    onClick={() => setTabActiva('explorar')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-black shadow-md mt-2"
                  >
                    <Compass size={14} />
                    <span>{locale === 'es' ? 'Explorar atletas' : 'Explore athletes'}</span>
                  </button>
                ) : (
                  <Link
                    to="/mis-rutinas"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 shadow-md mt-2"
                  >
                    <Plus size={14} />
                    <span>{locale === 'es' ? 'Ir a mis rutinas' : 'Go to my routines'}</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {feed.map(rutina => (
                  <RutinaPublicaCard
                    key={rutina.id}
                    rutina={rutina}
                    onVerPerfil={id => setPerfilSeleccionadoId(id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════════════
            PESTAÑA 2: EXPLORAR / BUSCADOR DE ATLETAS
        ════════════════════════════════════════════════════════════════════════════════ */}
        {tabActiva === 'explorar' && (
          <div className="space-y-5">
            {/* Buscador de usuarios */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder={
                  locale === 'es'
                    ? 'Buscar atleta por nombre o nombre de usuario...'
                    : 'Search athlete by name or username...'
                }
                value={busquedaQuery}
                onChange={e => setBusquedaQuery(e.target.value)}
                className="input pl-11 pr-10 py-3 text-sm bg-neutral-900 border-neutral-800 rounded-2xl w-full text-white placeholder-neutral-500 focus:border-[var(--color-primary)]"
                autoFocus
              />
              {buscandoUsuarios && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 size={16} className="animate-spin text-neutral-400" />
                </div>
              )}
            </div>

            {/* Resultados */}
            {busquedaQuery.trim() === '' ? (
              <div className="text-center py-12 px-4 bg-neutral-900/30 rounded-2xl border border-neutral-800/60 space-y-2">
                <Compass size={32} className="mx-auto text-neutral-600 mb-2" />
                <h4 className="font-bold text-white text-sm">
                  {locale === 'es' ? 'Encuentra y sigue a otros atletas' : 'Find and follow other athletes'}
                </h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  {locale === 'es'
                    ? 'Escribe en el buscador de arriba para descubrir perfiles públicos, ver sus estadísticas y clonar sus rutinas favoritas.'
                    : 'Type in the search box above to discover public profiles, check their stats and clone their favorite routines.'}
                </p>
              </div>
            ) : usuariosEncontrados.length === 0 && !buscandoUsuarios ? (
              <div className="text-center py-12 px-4 bg-neutral-900/30 rounded-2xl border border-neutral-800/60">
                <p className="text-sm text-neutral-400">
                  {locale === 'es'
                    ? `No se encontraron atletas para "${busquedaQuery}".`
                    : `No athletes found for "${busquedaQuery}".`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {usuariosEncontrados.map(perfil => (
                  <PerfilPublicoCard
                    key={perfil.id}
                    perfil={perfil}
                    onClick={() => setPerfilSeleccionadoId(perfil.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════════════
            PESTAÑA 3: MI PERFIL SOCIAL Y PRIVACIDAD DE MIS RUTINAS
        ════════════════════════════════════════════════════════════════════════════════ */}
        {tabActiva === 'mi_perfil' && (
          <div className="space-y-6">
            {/* Tarjeta de Biografía pública */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-neutral-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{user?.nombre}</h3>
                  <p className="text-xs text-neutral-400">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleGuardarBio} className="space-y-3 pt-3 border-t border-neutral-800">
                <label className="text-xs font-bold text-neutral-300 block">
                  {locale === 'es' ? 'Tu biografía pública' : 'Your public bio'}
                </label>
                <textarea
                  className="input text-xs sm:text-sm resize-none rounded-xl p-3 w-full bg-neutral-950 border-neutral-800 text-white"
                  rows={3}
                  maxLength={200}
                  placeholder={
                    locale === 'es'
                      ? 'Escribe algo sobre tus metas, disciplinas o experiencia (ej. Atleta de Powerlifting, 4 años entrenando)...'
                      : 'Write something about your goals, disciplines, or experience...'
                  }
                  value={bioTexto}
                  onChange={e => setBioTexto(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {bioTexto.length}/200
                  </span>
                  <div className="flex items-center gap-2">
                    {bioGuardadaExito && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <Check size={14} />
                        {locale === 'es' ? 'Guardado' : 'Saved'}
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={guardandoBio}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-black hover:opacity-90 transition-all cursor-pointer"
                    >
                      {guardandoBio ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : locale === 'es' ? (
                        'Guardar bio'
                      ) : (
                        'Save bio'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Gestión de Privacidad de mis Rutinas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Globe size={18} className="text-[var(--color-primary)]" />
                    <span>{locale === 'es' ? 'Privacidad de tus Rutinas' : 'Your Routines Privacy'}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {locale === 'es'
                      ? 'Gestiona fácilmente qué rutinas son visibles en el feed social.'
                      : 'Manage which workouts are visible on the social feed.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {misRutinasPublicas.length} {locale === 'es' ? 'públicas' : 'public'}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 font-bold">
                    {misRutinasPrivadas.length} {locale === 'es' ? 'privadas' : 'private'}
                  </span>
                </div>
              </div>

              {rutinas.length === 0 ? (
                <div className="text-center py-10 bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-800">
                  <p className="text-xs text-neutral-400">
                    {locale === 'es'
                      ? 'Aún no has creado ninguna rutina.'
                      : 'You have not created any routines yet.'}
                  </p>
                  <Link
                    to="/mis-rutinas"
                    className="inline-block mt-3 px-3 py-1.5 text-xs font-bold bg-neutral-800 text-white rounded-lg border border-neutral-700"
                  >
                    {locale === 'es' ? 'Crear primera rutina' : 'Create first routine'}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {rutinas.map(rutina => (
                    <div
                      key={rutina.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-white truncate">{rutina.nombre}</h4>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {rutina.duracion} min
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
                          {rutina.is_public ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <Globe size={11} />
                              {locale === 'es' ? 'Visible en el feed social' : 'Visible on social feed'}
                            </span>
                          ) : (
                            <span className="text-neutral-500 flex items-center gap-1 font-medium">
                              <Lock size={11} />
                              {locale === 'es' ? 'Privada (solo tú la ves)' : 'Private (only you see it)'}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Botón Switch de Privacidad */}
                      <button
                        type="button"
                        onClick={async () => {
                          await togglePrivacidad(rutina.id);
                          await refrescarFeed();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                          rutina.is_public
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-600'
                        }`}
                        title={
                          rutina.is_public
                            ? locale === 'es'
                              ? 'Hacer privada'
                              : 'Make private'
                            : locale === 'es'
                            ? 'Compartir públicamente'
                            : 'Share publicly'
                        }
                      >
                        {rutina.is_public
                          ? locale === 'es'
                            ? 'Hacer privada'
                            : 'Make private'
                          : locale === 'es'
                          ? 'Hacer pública'
                          : 'Make public'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Modal de Perfil Público ── */}
        {perfilSeleccionadoId && (
          <ModalPerfilPublico
            perfilId={perfilSeleccionadoId}
            onCerrar={handleCerrarModalPerfil}
          />
        )}
      </div>
    </AppLayout>
  );
}
