// src/paginas/SocialPage.tsx
// Página principal del apartado Social de DailySet con fondo blanco por defecto, invitaciones, sugerencias y moderación

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
import InvitarAmigosModal from '../componentes/social/InvitarAmigosModal';
import { getPerfilPorNombreUsuario } from '../lib/socialService';
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
  UserPlus,
  Sparkles,
  Share2,
} from 'lucide-react';

type TabSocial = 'feed' | 'explorar' | 'mi_perfil';
export type SocialThemeMode = 'auto' | 'light' | 'dark';

const getDevicePrefersDark = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

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
    sugerencias,
    cargandoSugerencias,
    refrescarFeed,
  } = useSocial();
  const { locale } = useI18n();

  const [searchParams, setSearchParams] = useSearchParams();
  const [tabActiva, setTabActiva] = useState<TabSocial>('feed');

  // Modal de Invitación
  const [mostrarInvitarModal, setMostrarInvitarModal] = useState(false);

  // Estado del tema para Social (Fondo blanco por defecto, con detección automática de modo oscuro)
  const [themeMode] = useState<SocialThemeMode>(() => {
    const guardado = typeof window !== 'undefined' ? localStorage.getItem('dailyset_social_theme_mode') : null;
    if (guardado === 'auto' || guardado === 'light' || guardado === 'dark') {
      return guardado as SocialThemeMode;
    }
    return 'auto';
  });

  const [isDarkEffective, setIsDarkEffective] = useState<boolean>(() => {
    const guardado = typeof window !== 'undefined' ? localStorage.getItem('dailyset_social_theme_mode') : null;
    if (guardado === 'dark') return true;
    if (guardado === 'light') return false;
    return getDevicePrefersDark();
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      if (themeMode === 'auto') {
        setIsDarkEffective(e.matches);
      }
    };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [themeMode]);

  const isLight = !isDarkEffective;

  // Estado para el modal de visualización de perfil
  const [perfilSeleccionadoId, setPerfilSeleccionadoId] = useState<string | null>(null);
  const [esPerfilInvitacion, setEsPerfilInvitacion] = useState(false);

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

  // Si la URL contiene ?perfil=ID o ?invitacion=USERNAME o ?ref=USERNAME
  useEffect(() => {
    const perfilQuery = searchParams.get('perfil');
    if (perfilQuery) {
      setPerfilSeleccionadoId(perfilQuery);
      setEsPerfilInvitacion(false);
      return;
    }

    const invitacionQuery = searchParams.get('invitacion') || searchParams.get('ref');
    if (invitacionQuery) {
      getPerfilPorNombreUsuario(invitacionQuery, user?.id).then(perfilInv => {
        if (perfilInv) {
          setPerfilSeleccionadoId(perfilInv.id);
          setEsPerfilInvitacion(true);
        }
      });
    }
  }, [searchParams, user?.id]);

  const handleCerrarModalPerfil = () => {
    setPerfilSeleccionadoId(null);
    setEsPerfilInvitacion(false);
    if (searchParams.has('perfil') || searchParams.has('invitacion') || searchParams.has('ref')) {
      searchParams.delete('perfil');
      searchParams.delete('invitacion');
      searchParams.delete('ref');
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
    <AppLayout fondoClaro={isLight}>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* ── Encabezado de Página ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`p-2 rounded-xl ${
                isLight
                  ? 'bg-[var(--color-primary)]/20 text-neutral-900 border border-[var(--color-primary)]/30'
                  : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              }`}>
                <Users size={22} />
              </span>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                {locale === 'es' ? 'Comunidad Social' : 'Social Community'}
              </h1>
            </div>
            <p className={`text-sm ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              {locale === 'es'
                ? 'Descubre entrenamientos de otros atletas, comparte los tuyos y sigue a tu comunidad.'
                : 'Discover workouts from other athletes, share yours, and follow your community.'}
            </p>
          </div>

          {/* Selector de Tema y Botón Invitar */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Botón Invitar Amigos */}
            <button
              type="button"
              onClick={() => setMostrarInvitarModal(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                isLight
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-black text-white border border-white/15 hover:bg-neutral-800 hover:border-white/30'
              }`}
            >
              <UserPlus size={14} className="text-white" />
              <span>{locale === 'es' ? 'Invitar amigos' : 'Invite friends'}</span>
            </button>
          </div>
        </div>

        {/* ── Navegación por Pestañas ── */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${
          isLight ? 'bg-neutral-100 border-neutral-200/90' : 'bg-black border-white/10'
        }`}>
          <button
            type="button"
            onClick={() => setTabActiva('feed')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tabActiva === 'feed'
                ? isLight
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'bg-neutral-900 text-white border border-white/10 shadow-md'
                : isLight
                ? 'text-neutral-600 hover:text-neutral-900'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users size={16} className={tabActiva === 'feed' ? 'text-[var(--color-primary)]' : ''} />
            <span>{locale === 'es' ? 'Feed de Rutinas' : 'Workout Feed'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('explorar')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tabActiva === 'explorar'
                ? isLight
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'bg-neutral-900 text-white border border-white/10 shadow-md'
                : isLight
                ? 'text-neutral-600 hover:text-neutral-900'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass size={16} className={tabActiva === 'explorar' ? 'text-[var(--color-primary)]' : ''} />
            <span>{locale === 'es' ? 'Buscar Atletas' : 'Find Athletes'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('mi_perfil')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tabActiva === 'mi_perfil'
                ? isLight
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'bg-neutral-900 text-white border border-white/10 shadow-md'
                : isLight
                ? 'text-neutral-600 hover:text-neutral-900'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User size={16} className={tabActiva === 'mi_perfil' ? 'text-[var(--color-primary)]' : ''} />
            <span>{locale === 'es' ? 'Mi Perfil' : 'My Profile'}</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════════════
            PESTAÑA 1: FEED SOCIAL DE RUTINAS PÚBLICAS
        ════════════════════════════════════════════════════════════════════════════════ */}
        {tabActiva === 'feed' && (
          <div className="space-y-6">
            {/* Filtros del Feed (Para ti / Siguiendo) */}
            <div className="flex items-center justify-between gap-3">
              <div className={`flex items-center p-1 rounded-xl border ${
                isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-black border-white/10 hover:border-white/50 transition-colors duration-300'
              }`}>
                <button
                  type="button"
                  onClick={() => setFiltroFeed('todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroFeed === 'todos'
                      ? 'bg-[var(--color-primary)] text-black shadow-sm'
                      : isLight
                      ? 'bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {locale === 'es' ? 'Para ti' : 'For you'}
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroFeed('siguiendo')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroFeed === 'siguiendo'
                      ? 'bg-[var(--color-primary)] text-black shadow-sm'
                      : isLight
                      ? 'bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
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
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  isLight ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-white'
                }`}
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
                <p className={`text-xs font-medium ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {locale === 'es' ? 'Cargando rutinas de la comunidad...' : 'Loading community workouts...'}
                </p>
              </div>
            ) : errorFeed ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorFeed}</span>
              </div>
            ) : feed.length === 0 ? (
              <div className="space-y-6">
                <div className={`text-center py-12 px-4 rounded-2xl border border-dashed space-y-3 ${
                  isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-black border-white/10 hover:border-white/50 transition-colors duration-300'
                }`}>
                  <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                    isLight ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-900 text-neutral-400 border border-white/10'
                  }`}>
                    <Dumbbell size={28} />
                  </div>
                  <h3 className={`font-extrabold text-base ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {filtroFeed === 'siguiendo'
                      ? locale === 'es'
                        ? 'No hay publicaciones de personas que sigues'
                        : 'No posts from people you follow'
                      : locale === 'es'
                      ? 'No hay rutinas públicas compartidas todavía'
                      : 'No public routines shared yet'}
                  </h3>
                  <p className={`text-xs max-w-sm mx-auto ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    {filtroFeed === 'siguiendo'
                      ? locale === 'es'
                        ? 'Sigue a atletas recomendados abajo o comparte tu enlace de invitación para entrenar juntos.'
                        : 'Follow recommended athletes below or share your invite link to train together.'
                      : locale === 'es'
                      ? 'Sé el primero en compartir. Al crear o editar tus rutinas en Mis Rutinas, cambia la privacidad a Pública.'
                      : 'Be the first to share! When creating or editing your routines, switch privacy to Public.'}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMostrarInvitarModal(true)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 ${
                        isLight
                          ? 'bg-black text-white hover:bg-neutral-800'
                          : 'bg-black text-white border border-white/15 hover:bg-neutral-800 hover:border-white/30'
                      }`}
                    >
                      <UserPlus size={14} className="text-white" />
                      <span>{locale === 'es' ? 'Invitar amigos' : 'Invite friends'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTabActiva('explorar')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        isLight ? 'bg-neutral-100 text-neutral-800 border-neutral-200' : 'bg-neutral-800 text-white border-neutral-700'
                      }`}
                    >
                      <Compass size={14} />
                      <span>{locale === 'es' ? 'Explorar atletas' : 'Explore athletes'}</span>
                    </button>
                  </div>
                </div>

                {/* Sugerencias de Atletas en Cold Start */}
                {sugerencias.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[var(--color-primary)]" />
                        <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                          {locale === 'es' ? 'Atletas recomendados para ti' : 'Recommended athletes for you'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTabActiva('explorar')}
                        className={`text-xs font-bold ${isLight ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-400 hover:text-white'}`}
                      >
                        {locale === 'es' ? 'Ver todos' : 'View all'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sugerencias.slice(0, 4).map(perfil => (
                        <PerfilPublicoCard
                          key={perfil.id}
                          perfil={perfil}
                          onClick={() => setPerfilSeleccionadoId(perfil.id)}
                          isLight={isLight}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {feed.map(rutina => (
                  <RutinaPublicaCard
                    key={rutina.id}
                    rutina={rutina}
                    onVerPerfil={id => setPerfilSeleccionadoId(id)}
                    isLight={isLight}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════════════
            PESTAÑA 2: EXPLORAR / BUSCADOR DE ATLETAS + INVITACIÓN + SUGERENCIAS
        ════════════════════════════════════════════════════════════════════════════════ */}
        {tabActiva === 'explorar' && (
          <div className="space-y-6">
            {/* Banner de Invitación y Código de Atleta */}
            <div
              className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isLight
                  ? 'bg-neutral-50 border-neutral-200 shadow-sm'
                  : 'bg-black border-white/10 hover:border-white transition-colors'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${isLight ? 'bg-neutral-200 text-neutral-900' : 'bg-neutral-900 text-white border border-white/10'}`}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h4 className={`font-black text-sm sm:text-base ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {locale === 'es' ? '¿Quieres entrenar con amigos?' : 'Want to train with friends?'}
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    {locale === 'es'
                      ? 'Comparte tu código de atleta o enlace para conectar de inmediato.'
                      : 'Share your athlete code or link to connect immediately.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarInvitarModal(true)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-black shadow-md transition-all cursor-pointer shrink-0 ${
                  isLight
                    ? 'bg-black text-white hover:bg-neutral-800'
                    : 'bg-black text-white border border-white/20 hover:bg-neutral-900 hover:border-white'
                }`}
              >
                <Share2 size={14} className="text-white" />
                <span>{locale === 'es' ? 'Compartir mi enlace' : 'Share my link'}</span>
              </button>
            </div>

            {/* Buscador de usuarios por nombre o @código */}
            <div className="relative">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`} />
              <input
                type="text"
                placeholder={
                  locale === 'es'
                    ? 'Buscar atleta por nombre o código (@usuario)...'
                    : 'Search athlete by name or code (@username)...'
                }
                value={busquedaQuery}
                onChange={e => setBusquedaQuery(e.target.value)}
                className={`input pl-11 pr-10 py-3 text-sm rounded-2xl w-full border transition-all ${
                  isLight
                    ? 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200'
                    : 'bg-black border-white/10 text-white placeholder-neutral-500 focus:border-white/30'
                }`}
              />
              {buscandoUsuarios && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 size={16} className={`animate-spin ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`} />
                </div>
              )}
            </div>

            {/* Resultados / Sugerencias */}
            {busquedaQuery.trim() === '' ? (
              usuariosEncontrados.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[var(--color-primary)]" />
                      <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                        {locale === 'es' ? 'Atletas sugeridos y comunidad DailySet' : 'Suggested athletes & DailySet community'}
                      </span>
                    </div>
                    <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {usuariosEncontrados.length} {locale === 'es' ? 'atletas' : 'athletes'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {usuariosEncontrados.map(perfil => (
                      <PerfilPublicoCard
                        key={perfil.id}
                        perfil={perfil}
                        onClick={() => setPerfilSeleccionadoId(perfil.id)}
                        isLight={isLight}
                      />
                    ))}
                  </div>
                </div>
              ) : buscandoUsuarios || cargandoSugerencias ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" />
                </div>
              ) : (
                <div className={`text-center py-12 px-4 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-white border-neutral-200/90 shadow-sm' : 'bg-black border-white/10 hover:border-white/50 transition-colors duration-300'
                }`}>
                  <Compass size={32} className={`mx-auto mb-2 ${isLight ? 'text-neutral-400' : 'text-neutral-600'}`} />
                  <h4 className={`font-bold text-sm ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {locale === 'es' ? 'Encuentra y sigue a otros atletas' : 'Find and follow other athletes'}
                  </h4>
                  <p className={`text-xs max-w-sm mx-auto ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    {locale === 'es'
                      ? 'Escribe en el buscador de arriba para descubrir perfiles por nombre o código de usuario.'
                      : 'Type in the search box above to discover profiles by name or user code.'}
                  </p>
                </div>
              )
            ) : usuariosEncontrados.length === 0 && !buscandoUsuarios ? (
              <div className={`text-center py-12 px-4 rounded-2xl border ${
                isLight ? 'bg-white border-neutral-200/90 text-neutral-600' : 'bg-black border-white/10 text-neutral-400'
              }`}>
                <p className="text-sm font-semibold">
                  {locale === 'es'
                    ? `No se encontraron atletas para "${busquedaQuery}".`
                    : `No athletes found for "${busquedaQuery}".`}
                </p>
                <p className="text-xs mt-1 text-neutral-500">
                  {locale === 'es'
                    ? 'Prueba a buscar por su nombre de usuario exacto o pídele su código de invitación.'
                    : 'Try searching by their exact username or ask for their invite code.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    {locale === 'es' ? 'Resultados de búsqueda' : 'Search results'}
                  </span>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {usuariosEncontrados.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {usuariosEncontrados.map(perfil => (
                    <PerfilPublicoCard
                      key={perfil.id}
                      perfil={perfil}
                      onClick={() => setPerfilSeleccionadoId(perfil.id)}
                      isLight={isLight}
                    />
                  ))}
                </div>
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
            <div className={`rounded-2xl p-5 space-y-4 border ${
              isLight ? 'bg-white border-neutral-200/90 shadow-sm text-neutral-900' : 'bg-black border-white/10 text-white hover:border-white/50 transition-colors duration-300'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border ${
                  isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-white/10'
                }`}>
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className={isLight ? 'text-neutral-500' : 'text-neutral-400'} />
                  )}
                </div>
                <div>
                  <h3 className={`font-extrabold text-base ${isLight ? 'text-neutral-900' : 'text-white'}`}>{user?.nombre}</h3>
                  <p className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>@{user?.nombre_usuario || 'atleta'}</p>
                </div>
              </div>

              <form onSubmit={handleGuardarBio} className={`space-y-3 pt-3 border-t ${isLight ? 'border-neutral-200/80' : 'border-white/10'}`}>
                <label className={`text-xs font-bold block ${isLight ? 'text-neutral-800' : 'text-neutral-300'}`}>
                  {locale === 'es' ? 'Tu biografía pública' : 'Your public bio'}
                </label>
                <textarea
                  className={`input text-xs sm:text-sm resize-none rounded-xl p-3 w-full border ${
                    isLight
                      ? 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-neutral-400'
                      : 'bg-black border-white/10 text-white placeholder-neutral-500 focus:border-white/30'
                  }`}
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
                  <span className={`text-[10px] font-mono ${isLight ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {bioTexto.length}/200
                  </span>
                  <div className="flex items-center gap-2">
                    {bioGuardadaExito && (
                      <span className={`text-xs flex items-center gap-1 font-medium ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                        <Check size={14} />
                        {locale === 'es' ? 'Guardado' : 'Saved'}
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={guardandoBio}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black text-white border border-white/15 hover:bg-neutral-900 hover:border-white/40 transition-all cursor-pointer shadow-sm"
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
                  <h3 className={`font-extrabold text-base flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    <Globe size={18} className="text-[var(--color-primary)]" />
                    <span>{locale === 'es' ? 'Privacidad de tus Rutinas' : 'Your Routines Privacy'}</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    {locale === 'es'
                      ? 'Gestiona fácilmente qué rutinas son visibles en el feed social.'
                      : 'Manage which workouts are visible on the social feed.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {misRutinasPublicas.length} {locale === 'es' ? 'públicas' : 'public'}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    isLight
                      ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}>
                    {misRutinasPrivadas.length} {locale === 'es' ? 'privadas' : 'private'}
                  </span>
                </div>
              </div>

              {rutinas.length === 0 ? (
                <div className={`text-center py-10 rounded-2xl border border-dashed ${
                  isLight ? 'bg-white border-neutral-200 text-neutral-600' : 'bg-black border-white/10 text-neutral-400 hover:border-white/50 transition-colors duration-300'
                }`}>
                  <p className="text-xs">
                    {locale === 'es'
                      ? 'Aún no has creado ninguna rutina.'
                      : 'You have not created any routines yet.'}
                  </p>
                  <Link
                    to="/mis-rutinas"
                    className={`inline-block mt-3 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      isLight
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-black text-white border-white/15 hover:bg-neutral-900'
                    }`}
                  >
                    {locale === 'es' ? 'Crear primera rutina' : 'Create first routine'}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {rutinas.map(rutina => (
                    <div
                      key={rutina.id}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-xl gap-3 border transition-all ${
                        isLight
                          ? 'bg-white border-neutral-200/90 shadow-sm text-neutral-900'
                          : 'bg-black border-white/10 text-white hover:border-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-bold text-sm truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>{rutina.nombre}</h4>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            {rutina.duracion} min
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5 flex items-center gap-1.5">
                          {rutina.is_public ? (
                            <span className={`flex items-center gap-1 font-semibold ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                              <Globe size={11} />
                              {locale === 'es' ? 'Visible en el feed social' : 'Visible on social feed'}
                            </span>
                          ) : (
                            <span className={`flex items-center gap-1 font-medium ${isLight ? 'text-neutral-500' : 'text-neutral-500'}`}>
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
                            ? isLight
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                            : isLight
                            ? 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:border-neutral-300'
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
            isLight={isLight}
            esInvitacion={esPerfilInvitacion}
          />
        )}

        {/* ── Modal de Invitación a Amigos ── */}
        {mostrarInvitarModal && (
          <InvitarAmigosModal
            onCerrar={() => setMostrarInvitarModal(false)}
            isLight={isLight}
          />
        )}
      </div>
    </AppLayout>
  );
}
