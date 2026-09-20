import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Flame,
  Trophy,
  Dumbbell,
  Sparkles,
  CheckCheck,
  Trash2,
  X,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Heart,
  Copy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { useHistorial } from '../../context/HistorialContext';
import type { NotificacionItem, TipoNotificacion } from '../../types/social';
import {
  getNotificaciones,
  marcarComoLeida as apiMarcarComoLeida,
  marcarTodasComoLeidas as apiMarcarTodasComoLeidas,
  eliminarNotificacion as apiEliminarNotificacion,
  limpiarNotificaciones as apiLimpiarNotificaciones,
  NOTIFICATION_EVENT,
} from '../../lib/notificacionesService';

export default function NotificacionesDropdown() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const { sesiones } = useHistorial();
  const navigate = useNavigate();

  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userId = user?.id || 'anonimo';
  const storageKey = `dailyset_notifs_${userId}`;

  // Calcular estadísticas reales del usuario
  const totalSesiones = sesiones.length;
  const maxKg = useMemo(() => {
    let max = 0;
    sesiones.forEach((s) => {
      s.ejercicios.forEach((ej) => {
        ej.series.forEach((serie) => {
          if (serie.kg > max) max = serie.kg;
        });
      });
    });
    return max;
  }, [sesiones]);

  // Generar notificaciones base automáticas según los datos reales
  const notificacionesBase = useMemo<NotificacionItem[]>(() => {
    const items: NotificacionItem[] = [];
    const now = Date.now();

    // 1. Notificación de subida de nivel
    if (totalSesiones >= 3) {
      const nivel = totalSesiones >= 15 ? 4 : totalSesiones >= 7 ? 3 : 2;
      const nombres = {
        2: { es: 'Fuego Constante · Nivel 2', en: 'Steady Flame · Level 2' },
        3: { es: 'Racha de Hierro · Nivel 3', en: 'Iron Streak · Level 3' },
        4: { es: 'Fuego Élite · Nivel 4', en: 'Elite Flame · Level 4' },
      }[nivel as 2 | 3 | 4];

      items.push({
        id: `notif-nivel-${nivel}`,
        tipo: 'nivel',
        titulo: locale === 'es' ? `Ascenso a ${nombres.es}` : `Level Up to ${nombres.en}`,
        mensaje: locale === 'es'
          ? `Has completado ${totalSesiones} entrenamientos. Tu constancia ha desbloqueado un nuevo rango en tu perfil.`
          : `You completed ${totalSesiones} workouts. Your dedication unlocked a new profile rank.`,
        tiempo: locale === 'es' ? 'Reciente' : 'Recent',
        timestamp: now - 1000 * 60 * 25,
        leida: false,
        enlace: '/perfil',
      });
    } else {
      items.push({
        id: 'notif-nivel-1',
        tipo: 'nivel',
        titulo: locale === 'es' ? 'Iniciaste tu camino: Nivel 1' : 'Journey started: Level 1',
        mensaje: locale === 'es'
          ? 'Estás en Nivel 1 (Chispa Inicial). Completa 3 entrenamientos para ascender a Fuego Constante.'
          : 'You are at Level 1 (Initial Spark). Complete 3 workouts to ascend to Steady Flame.',
        tiempo: locale === 'es' ? 'Hoy' : 'Today',
        timestamp: now - 1000 * 60 * 60,
        leida: false,
        enlace: '/perfil',
      });
    }

    // 2. Notificación de racha diaria
    items.push({
      id: 'notif-racha',
      tipo: 'racha',
      titulo: locale === 'es' ? 'Protege tu Racha Diaria' : 'Protect your Daily Streak',
      mensaje: locale === 'es'
        ? 'Completa tu sesión diaria para no perder el fuego de racha y sumar experiencia.'
        : 'Complete your daily session to keep your streak burning and gain XP.',
      tiempo: locale === 'es' ? 'Hace 2 h' : '2 h ago',
      timestamp: now - 1000 * 60 * 120,
      leida: false,
      enlace: '/perfil',
    });

    // 3. Notificación de récord o entrenamiento
    if (maxKg > 0) {
      items.push({
        id: 'notif-record',
        tipo: 'record',
        titulo: locale === 'es' ? `Nuevo Récord Personal (${maxKg} kg)` : `New Personal PR (${maxKg} kg)`,
        mensaje: locale === 'es'
          ? `Has superado tu mejor marca histórica levantando ${maxKg} kg. Sigue progresando.`
          : `You beat your historic record by lifting ${maxKg} kg. Keep crushing it.`,
        tiempo: locale === 'es' ? 'Ayer' : 'Yesterday',
        timestamp: now - 1000 * 60 * 60 * 24,
        leida: true,
        enlace: '/estadisticas',
      });
    }

    // 4. Notificación de bienvenida / sistema
    items.push({
      id: 'notif-bienvenida',
      tipo: 'sistema',
      titulo: locale === 'es' ? 'Bienvenido a DailySet' : 'Welcome to DailySet',
      mensaje: locale === 'es'
        ? 'Explora las rutinas predefinidas o crea las tuyas propias para comenzar a progresar.'
        : 'Explore pre-built routines or create your custom plans to start progressing.',
      tiempo: locale === 'es' ? 'Hace 2 d' : '2 d ago',
      timestamp: now - 1000 * 60 * 60 * 48,
      leida: true,
      enlace: '/mis-rutinas',
    });

    return items;
  }, [totalSesiones, maxKg, locale]);

  // Cargar notificaciones (locales + servidor)
  const cargarNotificaciones = useCallback(async () => {
    try {
      const items = await getNotificaciones(userId);
      if (items.length > 0) {
        setNotificaciones(items);
      } else {
        // Sembrar con notificaciones base si la bandeja está completamente vacía
        setNotificaciones(notificacionesBase);
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(notificacionesBase));
        }
      }
    } catch (e) {
      console.error('Error cargando notificaciones:', e);
      setNotificaciones(notificacionesBase);
    }
  }, [userId, storageKey, notificacionesBase]);

  useEffect(() => {
    cargarNotificaciones();

    const handleUpdate = () => {
      cargarNotificaciones();
    };

    window.addEventListener(NOTIFICATION_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [cargarNotificaciones]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickAfuera = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };
    if (abierto) {
      document.addEventListener('mousedown', handleClickAfuera);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
    };
  }, [abierto]);

  // Contador de no leídas
  const sinLeerCount = notificaciones.filter((n) => !n.leida).length;

  // Marcar todas como leídas
  const handleMarcarTodasComoLeidas = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    await apiMarcarTodasComoLeidas(userId);
  };

  // Marcar una como leída
  const handleMarcarComoLeida = async (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
    await apiMarcarComoLeida(userId, id);
  };

  // Eliminar una notificación
  const handleEliminarNotificacion = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    await apiEliminarNotificacion(userId, id);
  };

  // Vaciar todas
  const handleLimpiarTodas = async () => {
    setNotificaciones([]);
    await apiLimpiarNotificaciones(userId);
  };

  // Obtener icono según el tipo
  const getIcono = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'seguidor':
        return (
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/30">
            <UserPlus size={16} />
          </div>
        );
      case 'reaccion':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <Heart size={16} className="fill-rose-400" />
          </div>
        );
      case 'clonacion':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Copy size={16} />
          </div>
        );
      case 'nivel':
        return (
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center shrink-0 border border-[var(--color-primary)]/30">
            <TrendingUp size={16} />
          </div>
        );
      case 'racha':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Flame size={16} />
          </div>
        );
      case 'record':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
            <Trophy size={16} />
          </div>
        );
      case 'entrenamiento':
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
            <Dumbbell size={16} />
          </div>
        );
      case 'sistema':
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-white/10 text-neutral-300 flex items-center justify-center shrink-0 border border-white/10">
            <Sparkles size={16} />
          </div>
        );
    }
  };

  const handleItemClick = (item: NotificacionItem) => {
    handleMarcarComoLeida(item.id);
    if (item.enlace) {
      setAbierto(false);
      navigate(item.enlace);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Botón de la Campana */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-label={locale === 'es' ? 'Notificaciones' : 'Notifications'}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 relative cursor-pointer active:scale-95 ${
          abierto
            ? 'bg-neutral-800 text-white border-[var(--color-primary)]'
            : 'bg-[#141416] border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
        }`}
      >
        <Bell size={18} />

        {/* Punto indicador o número de notificaciones no leídas */}
        {sinLeerCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full px-1 flex items-center justify-center text-[10px] font-black font-mono shadow-md animate-pulse"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#000000',
            }}
          >
            {sinLeerCount}
          </span>
        )}
      </button>

      {/* Menú Desplegable con Efecto Cristal Oscuro */}
      {abierto && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0f0f12]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
          {/* Cabecera del desplegable */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white uppercase italic tracking-wider">
                {locale === 'es' ? 'Notificaciones' : 'Notifications'}
              </span>
              {sinLeerCount > 0 && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                  {sinLeerCount} {locale === 'es' ? 'nuevas' : 'new'}
                </span>
              )}
            </div>

            {sinLeerCount > 0 && (
              <button
                onClick={handleMarcarTodasComoLeidas}
                title={locale === 'es' ? 'Marcar todas como leídas' : 'Mark all as read'}
                className="text-xs text-neutral-400 hover:text-[var(--color-primary)] transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <CheckCheck size={14} />
                <span className="text-[11px]">{locale === 'es' ? 'Leídas' : 'Read'}</span>
              </button>
            )}
          </div>

          {/* Lista de notificaciones con scroll suave */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5">
            {notificaciones.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-500">
                  <Bell size={20} />
                </div>
                <p className="text-sm font-bold text-white mb-0.5">
                  {locale === 'es' ? 'Sin notificaciones' : 'No notifications'}
                </p>
                <p className="text-xs text-neutral-400">
                  {locale === 'es' ? 'Estás al día con todos tus eventos y entrenamientos.' : "You're all caught up with your events and workouts."}
                </p>
              </div>
            ) : (
              notificaciones.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 sm:p-4 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                    item.leida ? 'hover:bg-white/[0.03]' : 'bg-white/[0.04] hover:bg-white/[0.07]'
                  }`}
                >
                  {/* Icono temático */}
                  {getIcono(item.tipo)}

                  {/* Texto principal */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className={`text-xs sm:text-sm font-black tracking-tight line-clamp-1 ${
                        item.leida ? 'text-neutral-300' : 'text-white'
                      }`}>
                        {item.titulo}
                      </h4>
                      <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                        {item.tiempo}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                      {item.mensaje}
                    </p>

                    {item.enlace && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span>{locale === 'es' ? 'Ver detalles' : 'View details'}</span>
                        <ChevronRight size={12} />
                      </span>
                    )}
                  </div>

                  {/* Indicador no leído y botón de eliminar */}
                  <div className="flex flex-col items-center justify-between self-stretch shrink-0">
                    {!item.leida && (
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary-glow)]" />
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleEliminarNotificacion(e, item.id)}
                      title={locale === 'es' ? 'Eliminar' : 'Delete'}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-400 transition-all rounded-md mt-auto"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pie del desplegable */}
          {notificaciones.length > 0 && (
            <div className="p-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleLimpiarTodas}
                className="text-[11px] text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>{locale === 'es' ? 'Vaciar bandeja' : 'Clear all'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="text-[11px] text-neutral-400 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5 cursor-pointer font-semibold"
              >
                {locale === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
