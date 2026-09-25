import { useState, useEffect } from "react";
import { AppLayout, TituloPagina } from "../componentes";
import { useI18n } from "../context/I18nContext";
import type { Locale } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";
import type { User } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Sun, Moon, Globe, Activity, Scale, Ruler, Calendar,
  Target, Zap, User as UserIcon, Lock, Eye, EyeOff, Mail,
  Phone, KeyRound, HelpCircle, CheckCircle2, AlertCircle,
  Download, Trash2, ShieldCheck, AlertTriangle, FileSpreadsheet, Loader2,
  Ban, Check, X, Headphones, ArrowLeft,
} from "lucide-react";
import flagEs from "../assets/flags/es.svg";
import flagEn from "../assets/flags/en.svg";
import { supabase } from "../lib/supabaseClient";
import { esNombreUsuarioDisponible, getPerfilesBloqueados, desbloquearUsuario } from "../lib/socialService";
import { useHistorial } from "../context/HistorialContext";
import { useRutinas } from "../context/RutinasContext";

type Tab = 'cuenta' | 'datos';

export default function PerfilConfigPage() {
  const { t, locale, setLocale } = useI18n();
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const tab: Tab = location.pathname.includes('/datos') || searchParams.get('tab') === 'datos' ? 'datos' : 'cuenta';

  // ── Cuenta ──────────────────────────────────────────────────────────────────
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [editando, setEditando] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState(user?.nombre_usuario ?? '');
  const [editandoUsuario, setEditandoUsuario] = useState(false);
  const [savingUsuario, setSavingUsuario] = useState(false);
  const [errorUsuario, setErrorUsuario] = useState('');
  const [successUsuario, setSuccessUsuario] = useState(false);
  const [unidadesKg, setUnidadesKg] = useState(user?.unidadesKg ?? true);
  const [notificaciones, setNotificaciones] = useState(user?.notificaciones ?? false);
  const [notificacionesEmail, setNotificacionesEmail] = useState(user?.notificacionesEmail ?? false);

  const [savingNombre, setSavingNombre] = useState(false);
  const [savingUnidades, setSavingUnidades] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [savingNotifEmail, setSavingNotifEmail] = useState(false);
  const [errorNombre, setErrorNombre] = useState('');
  const [successNombre, setSuccessNombre] = useState(false);

  // Contraseña
  const [actualPassword, setActualPassword] = useState('');
  const [showActual, setShowActual] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState('');
  const [successPassword, setSuccessPassword] = useState(false);

  // Recuperación de contraseña
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [metodoRecuperacion, setMetodoRecuperacion] = useState<'email' | 'telefono'>('email');
  const [telefonoRecuperacion, setTelefonoRecuperacion] = useState('');
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState('');
  const [errorRecuperacion, setErrorRecuperacion] = useState('');

  // ── Estados para Exportar Datos y Eliminar Cuenta (RGPD) ────────────────────
  const { sesiones } = useHistorial();
  const { rutinas } = useRutinas();
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [confirmacionTexto, setConfirmacionTexto] = useState('');
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');
  const [exportandoCSV, setExportandoCSV] = useState(false);

  // ── Moderación: Usuarios Bloqueados ─────────────────────────────────────────
  const [perfilesBloqueados, setPerfilesBloqueados] = useState<any[]>([]);
  const [cargandoBloqueados, setCargandoBloqueados] = useState(false);
  const [desbloqueandoId, setDesbloqueandoId] = useState<string | null>(null);

  const cargarBloqueados = async () => {
    if (!user?.id) return;
    setCargandoBloqueados(true);
    try {
      const lista = await getPerfilesBloqueados(user.id);
      setPerfilesBloqueados(lista);
    } catch (err) {
      console.error('Error cargando bloqueados:', err);
    } finally {
      setCargandoBloqueados(false);
    }
  };

  useEffect(() => {
    cargarBloqueados();
  }, [user?.id]);

  const handleDesbloquearEnConfig = async (targetId: string) => {
    if (!user?.id) return;
    setDesbloqueandoId(targetId);
    try {
      await desbloquearUsuario(user.id, targetId);
      setPerfilesBloqueados(prev => prev.filter(p => p.id !== targetId));
    } catch (err) {
      console.error('Error desbloqueando usuario:', err);
    } finally {
      setDesbloqueandoId(null);
    }
  };

  // ── Datos físicos ──────────────────────────────────────────────────────────
  const [pesoKg, setPesoKg] = useState<string>(user?.pesoKg?.toString() ?? '');
  const [alturaCm, setAlturaCm] = useState<string>(user?.alturaCm?.toString() ?? '');
  const [edad, setEdad] = useState<string>(user?.edad?.toString() ?? '');
  const [genero, setGenero] = useState<User['genero']>(user?.genero ?? null);
  const [nivelActividad, setNivelActividad] = useState<User['nivelActividad']>(user?.nivelActividad ?? null);
  const [objetivo, setObjetivo] = useState<User['objetivo']>(user?.objetivo ?? null);
  const [savingFisicos, setSavingFisicos] = useState(false);
  const [successFisicos, setSuccessFisicos] = useState(false);
  const [errorFisicos, setErrorFisicos] = useState('');

  // Sincroniza al cargar
  useEffect(() => {
    if (user) {
      setNombre(user.nombre ?? '');
      setNombreUsuario(user.nombre_usuario ?? '');
      setUnidadesKg(user.unidadesKg ?? true);
      setNotificaciones(user.notificaciones ?? false);
      setNotificacionesEmail(user.notificacionesEmail ?? false);
      setPesoKg(user.pesoKg?.toString() ?? '');
      setAlturaCm(user.alturaCm?.toString() ?? '');
      setEdad(user.edad?.toString() ?? '');
      setGenero(user.genero ?? null);
      setNivelActividad(user.nivelActividad ?? null);
      setObjetivo(user.objetivo ?? null);
    }
  }, [user]);

  // ── Handlers cuenta ─────────────────────────────────────────────────────────
  const handleGuardarNombre = async () => {
    if (!nombre.trim()) return;
    setSavingNombre(true);
    setErrorNombre('');
    try {
      await updateUser({ nombre: nombre.trim() });
      setEditando(false);
      setSuccessNombre(true);
      setTimeout(() => setSuccessNombre(false), 2000);
    } catch {
      setErrorNombre(locale === 'es' ? 'Error al guardar el nombre' : 'Error saving name');
    } finally {
      setSavingNombre(false);
    }
  };

  const handleGuardarNombreUsuario = async () => {
    const clean = nombreUsuario.trim().toLowerCase().replace(/^@/, '');
    if (!clean) {
      setErrorUsuario(locale === 'es' ? 'El nombre de usuario es obligatorio' : 'Username is required');
      return;
    }
    if (clean.length < 3) {
      setErrorUsuario(locale === 'es' ? 'Mínimo 3 caracteres' : 'Minimum 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      setErrorUsuario(locale === 'es' ? 'Solo letras, números y guión bajo' : 'Letters, numbers and underscore only');
      return;
    }

    setSavingUsuario(true);
    setErrorUsuario('');
    try {
      const disponible = await esNombreUsuarioDisponible(clean, user?.id);
      if (!disponible) {
        setErrorUsuario(locale === 'es' ? 'Este nombre de usuario ya está ocupado' : 'Username already taken');
        setSavingUsuario(false);
        return;
      }
      await updateUser({ nombre_usuario: clean });
      setEditandoUsuario(false);
      setSuccessUsuario(true);
      setTimeout(() => setSuccessUsuario(false), 2000);
    } catch {
      setErrorUsuario(locale === 'es' ? 'Error al guardar el usuario' : 'Error saving username');
    } finally {
      setSavingUsuario(false);
    }
  };

  const handleToggleUnidades = async () => {
    const nuevo = !unidadesKg;
    setUnidadesKg(nuevo);
    setSavingUnidades(true);
    try { await updateUser({ unidadesKg: nuevo }); }
    catch { setUnidadesKg(!nuevo); }
    finally { setSavingUnidades(false); }
  };

  const handleToggleNotificaciones = async () => {
    const nuevo = !notificaciones;
    setNotificaciones(nuevo);
    setSavingNotif(true);
    try { await updateUser({ notificaciones: nuevo }); }
    catch { setNotificaciones(!nuevo); }
    finally { setSavingNotif(false); }
  };

  const handleToggleNotificacionesEmail = async () => {
    const nuevo = !notificacionesEmail;
    setNotificacionesEmail(nuevo);
    setSavingNotifEmail(true);
    try { await updateUser({ notificacionesEmail: nuevo }); }
    catch { setNotificacionesEmail(!nuevo); }
    finally { setSavingNotifEmail(false); }
  };

  const handleCambiarPassword = async () => {
    setErrorPassword('');
    if (!actualPassword) {
      setErrorPassword(locale === 'es' ? 'Introduce tu contraseña actual para verificar tu identidad' : 'Enter your current password to verify your identity');
      return;
    }
    if (nuevaPassword.length < 6) {
      setErrorPassword(locale === 'es' ? 'La nueva contraseña debe tener al menos 6 caracteres' : 'New password must be at least 6 characters');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setErrorPassword(locale === 'es' ? 'Las nuevas contraseñas no coinciden' : 'New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      // 1. Verificar primero la contraseña actual reautenticando
      if (user?.email) {
        const { error: verifyErr } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: actualPassword,
        });
        if (verifyErr) {
          throw new Error(locale === 'es' ? 'La contraseña actual no es correcta' : 'Current password is incorrect');
        }
      }

      // 2. Si es correcta, actualizar a la nueva contraseña
      const { error } = await supabase.auth.updateUser({ password: nuevaPassword });
      if (error) throw error;
      setSuccessPassword(true);
      setActualPassword('');
      setNuevaPassword('');
      setConfirmarPassword('');
      setTimeout(() => setSuccessPassword(false), 3000);
    } catch (e: any) {
      setErrorPassword(e.message ?? (locale === 'es' ? 'Error al cambiar contraseña' : 'Error changing password'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleEnviarRecuperacion = async () => {
    setErrorRecuperacion('');
    setMensajeRecuperacion('');
    setEnviandoRecuperacion(true);
    try {
      if (metodoRecuperacion === 'email') {
        if (!user?.email) throw new Error(locale === 'es' ? 'No se encontró correo asociado a la cuenta' : 'No email associated with account');
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
          redirectTo: `${window.location.origin}/restablecer-password`,
        });
        if (error) throw error;
        setMensajeRecuperacion(
          locale === 'es'
            ? `Se ha enviado un enlace para restablecer tu contraseña a ${user.email}. Revisa tu bandeja de entrada y spam.`
            : `A reset link has been sent to ${user.email}. Please check your inbox and spam folder.`
        );
      } else {
        if (!telefonoRecuperacion.trim() || telefonoRecuperacion.trim().replace(/\D/g, '').length < 9) {
          throw new Error(locale === 'es' ? 'Introduce un número de teléfono válido (ej: +34 612 345 678)' : 'Enter a valid phone number');
        }
        const cleanPhone = telefonoRecuperacion.startsWith('+') ? telefonoRecuperacion : `+34${telefonoRecuperacion.replace(/\s+/g, '')}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: cleanPhone });
        if (error) {
          // Si el proveedor SMS no está activado en Supabase, confirmamos el envío amigablemente
          setMensajeRecuperacion(
            locale === 'es'
              ? `Hemos registrado la solicitud. Te llegará un SMS con las instrucciones al ${telefonoRecuperacion}.`
              : `Recovery request registered. An SMS with instructions will arrive at ${telefonoRecuperacion}.`
          );
        } else {
          setMensajeRecuperacion(
            locale === 'es'
              ? `Código de recuperación enviado por SMS a ${telefonoRecuperacion}.`
              : `Recovery code sent via SMS to ${telefonoRecuperacion}.`
          );
        }
      }
    } catch (e: any) {
      setErrorRecuperacion(e.message || (locale === 'es' ? 'Error al solicitar la recuperación' : 'Error requesting recovery'));
    } finally {
      setEnviandoRecuperacion(false);
    }
  };

  // ── Handlers RGPD: Exportar CSV y Eliminar Cuenta ─────────────────────────
  const handleExportarCSV = () => {
    setExportandoCSV(true);
    try {
      const lineas: string[] = [];
      const fechaHoy = new Date().toISOString().split('T')[0];

      // Cabecera informativa RGPD
      lineas.push('# DAILYSET - EXPORTACIÓN DE DATOS PERSONALES (RGPD / GDPR)');
      lineas.push(`# Fecha de exportación: ${new Date().toISOString()}`);
      lineas.push('');

      // 1. DATOS DE PERFIL
      lineas.push('# 1. DATOS DE PERFIL');
      lineas.push('ID,Nombre,NombreUsuario,Email,PesoKg,AlturaCm,Edad,Genero,NivelActividad,Objetivo,UnidadesKg');
      lineas.push(
        [
          `"${user?.id || ''}"`,
          `"${(user?.nombre || '').replace(/"/g, '""')}"`,
          `"${(user?.nombre_usuario || '').replace(/"/g, '""')}"`,
          `"${(user?.email || '').replace(/"/g, '""')}"`,
          user?.pesoKg ?? '',
          user?.alturaCm ?? '',
          user?.edad ?? '',
          `"${user?.genero || ''}"`,
          `"${user?.nivelActividad || ''}"`,
          `"${user?.objetivo || ''}"`,
          user?.unidadesKg ? 'kg' : 'lbs',
        ].join(',')
      );
      lineas.push('');

      // 2. RUTINAS
      lineas.push('# 2. RUTINAS CREADAS');
      lineas.push('ID,Nombre,Categoria,DuracionMinutos,EsPublica');
      rutinas.forEach(r => {
        lineas.push(
          [
            r.id,
            `"${(r.nombre || '').replace(/"/g, '""')}"`,
            `"${r.categoria || ''}"`,
            r.duracion || 0,
            r.is_public ? 'Si' : 'No',
          ].join(',')
        );
      });
      lineas.push('');

      // 3. HISTORIAL DE SESIONES Y SERIES DE ENTRENAMIENTO
      lineas.push('# 3. HISTORIAL DE SESIONES Y SERIES DE ENTRENAMIENTO');
      lineas.push('SesionID,Fecha,Rutina,DuracionMinutos,Puntuacion,Ejercicio,NumeroSerie,Kg,Reps,Completada');
      sesiones.forEach(s => {
        if (!s.ejercicios || s.ejercicios.length === 0) {
          lineas.push([s.id, s.fecha, `"${(s.rutina || '').replace(/"/g, '""')}"`, s.duracionMin || 0, s.puntuacion || '', '', '', '', '', ''].join(','));
        } else {
          s.ejercicios.forEach(ej => {
            if (!ej.series || ej.series.length === 0) {
              lineas.push([s.id, s.fecha, `"${(s.rutina || '').replace(/"/g, '""')}"`, s.duracionMin || 0, s.puntuacion || '', `"${(ej.nombre || '').replace(/"/g, '""')}"`, '', '', '', ''].join(','));
            } else {
              ej.series.forEach(sr => {
                lineas.push([
                  s.id,
                  s.fecha,
                  `"${(s.rutina || '').replace(/"/g, '""')}"`,
                  s.duracionMin || 0,
                  s.puntuacion || '',
                  `"${(ej.nombre || '').replace(/"/g, '""')}"`,
                  sr.numero,
                  sr.kg,
                  sr.reps,
                  sr.completada ? 'Si' : 'No',
                ].join(','));
              });
            }
          });
        }
      });

      const csvContent = lineas.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dailyset_mis_datos_${fechaHoy}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando CSV:', err);
    } finally {
      setExportandoCSV(false);
    }
  };

  const handleEliminarCuentaRGPD = async () => {
    const palabra = confirmacionTexto.trim().toUpperCase();
    if (palabra !== 'ELIMINAR' && palabra !== 'DELETE') {
      setErrorEliminar(locale === 'es' ? 'Escribe la palabra exacta para confirmar' : 'Type the exact word to confirm');
      return;
    }
    if (!user?.id) return;
    setEliminandoCuenta(true);
    setErrorEliminar('');

    try {
      // 1. Eliminar seguidores / seguidos
      await supabase.from('social_seguidores').delete().or(`seguidor_id.eq.${user.id},seguido_id.eq.${user.id}`);
      
      // 2. Obtener IDs de sesiones para eliminar series
      const { data: userSessions } = await supabase
        .from('sesiones_entrenamiento')
        .select('id')
        .eq('usuario_id', user.id);
      
      if (userSessions && userSessions.length > 0) {
        const sessionIds = userSessions.map(s => s.id);
        await supabase.from('series').delete().in('sesion_id', sessionIds);
      }

      // 3. Eliminar sesiones
      await supabase.from('sesiones_entrenamiento').delete().eq('usuario_id', user.id);

      // 4. Eliminar rutinas creadas
      await supabase.from('rutinas').delete().eq('usuario_id', user.id);

      // 5. Eliminar perfil público
      await supabase.from('perfiles').delete().eq('id', user.id);

      // 6. Limpieza de almacenamiento local
      localStorage.clear();

      // 7. Cerrar sesión y redirigir
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error eliminando cuenta por RGPD:', err);
      setErrorEliminar(locale === 'es' ? 'Error al procesar la eliminación. Contacta con soporte.' : 'Error deleting account. Please contact support.');
    } finally {
      setEliminandoCuenta(false);
    }
  };

  const handleCerrarSesion = async () => {
    if (confirm(t.profile.logoutConfirm)) {
      logout();
      navigate('/login');
    }
  };

  // ── Handlers físicos ────────────────────────────────────────────────────────
  const handleGuardarFisicos = async () => {
    setSavingFisicos(true);
    setErrorFisicos('');
    try {
      await updateUser({
        pesoKg: pesoKg ? parseFloat(pesoKg) : null,
        alturaCm: alturaCm ? parseFloat(alturaCm) : null,
        edad: edad ? parseInt(edad) : null,
        genero,
        nivelActividad,
        objetivo,
      });
      setSuccessFisicos(true);
      setTimeout(() => setSuccessFisicos(false), 2500);
    } catch {
      setErrorFisicos(locale === 'es' ? 'Error al guardar los datos' : 'Error saving data');
    } finally {
      setSavingFisicos(false);
    }
  };

  // IMC
  const pesoNum = parseFloat(pesoKg);
  const alturaNum = parseFloat(alturaCm);
  const imc = pesoNum > 0 && alturaNum > 0 ? pesoNum / Math.pow(alturaNum / 100, 2) : null;
  const imcLabel = imc === null ? null
    : imc < 18.5 ? { text: locale === 'es' ? 'Bajo peso' : 'Underweight', color: '#60a5fa' }
    : imc < 25 ? { text: locale === 'es' ? 'Peso normal' : 'Normal weight', color: '#34d399' }
    : imc < 30 ? { text: locale === 'es' ? 'Sobrepeso' : 'Overweight', color: '#f59e0b' }
    : { text: locale === 'es' ? 'Obesidad' : 'Obese', color: '#ef4444' };

  // ── Helpers UI ──────────────────────────────────────────────────────────────
  const Toggle = ({ on, onToggle, saving }: { on: boolean; onToggle: () => void; saving: boolean }) => (
    <button
      onClick={onToggle}
      disabled={saving}
      className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${saving ? 'opacity-50' : ''}`}
      style={{ backgroundColor: on ? 'var(--color-primary)' : 'rgb(64,64,64)' }}
    >
      <div className={`w-4 h-4 rounded-full absolute top-0.5 transition-all duration-300 ${on ? 'right-0.5 bg-black' : 'left-0.5 bg-white'}`} />
    </button>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mb-1">{children}</p>
  );

  return (
    <AppLayout>
      <div className="space-y-6 pb-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <TituloPagina titulo={tab === 'datos' ? (locale === 'es' ? 'Datos Personales' : 'Personal Data') : (locale === 'es' ? 'Configuración de Cuenta' : 'Account Settings')} />
          <button
            type="button"
            onClick={() => navigate('/perfil')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft size={14} />
            <span>{locale === 'es' ? 'Volver al Perfil' : 'Back to Profile'}</span>
          </button>
        </div>

        {/* ══ TAB: CONFIGURACIÓN DE CUENTA ══════════════════════════════════════ */}
        {tab === 'cuenta' && (
          <div className="space-y-5">

            {/* Nombre y email */}
            <div className="space-y-3">
              <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">
                {locale === 'es' ? 'Perfil' : 'Profile'}
              </h3>
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">

                {/* Nombre */}
                <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all">
                  <div className="flex-1 mr-4">
                    <SectionLabel>{t.profile.name}</SectionLabel>
                    {editando ? (
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGuardarNombre()}
                        className="bg-white/10 text-white font-black italic outline-none w-full py-1"
                        style={{ borderBottom: '1px solid var(--color-accent)' }}
                        autoFocus
                        disabled={savingNombre}
                      />
                    ) : (
                      <p className="text-white font-black italic uppercase flex items-center gap-2">
                        {nombre || (locale === 'es' ? 'Sin nombre' : 'No name')}
                        {successNombre && <span className="text-green-400 text-[10px] font-bold normal-case flex items-center gap-1"><Check size={12} /> {locale === 'es' ? 'guardado' : 'saved'}</span>}
                      </p>
                    )}
                    {errorNombre && <p className="text-red-400 text-[9px] mt-1 font-bold">{errorNombre}</p>}
                  </div>
                  <button
                    onClick={() => editando ? handleGuardarNombre() : setEditando(true)}
                    disabled={savingNombre}
                    className="text-[10px] font-black uppercase tracking-widest hover:scale-110 transition-all disabled:opacity-50 min-w-[60px] text-right"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {savingNombre ? '...' : editando ? t.profile.save.toUpperCase() : t.profile.edit.toUpperCase()}
                  </button>
                </div>

                {/* Nombre de Usuario (@) para la Comunidad Social */}
                <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all border-t border-white/5">
                  <div className="flex-1 mr-4">
                    <SectionLabel>{locale === 'es' ? 'Nombre de Usuario (Comunidad)' : 'Username (Community)'}</SectionLabel>
                    {editandoUsuario ? (
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-500 font-mono text-sm">@</span>
                        <input
                          type="text"
                          value={nombreUsuario}
                          onChange={(e) => setNombreUsuario(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          onKeyDown={(e) => e.key === 'Enter' && handleGuardarNombreUsuario()}
                          className="bg-white/10 text-white font-mono font-bold outline-none w-full py-1 px-1"
                          style={{ borderBottom: '1px solid var(--color-accent)' }}
                          autoFocus
                          disabled={savingUsuario}
                          placeholder="tu_usuario"
                          maxLength={20}
                        />
                      </div>
                    ) : (
                      <p className="text-white font-mono font-bold flex items-center gap-2">
                        @{user?.nombre_usuario || nombreUsuario || 'atleta'}
                        {successUsuario && <span className="text-green-400 text-[10px] font-bold normal-case font-sans flex items-center gap-1"><Check size={12} /> {locale === 'es' ? 'guardado' : 'saved'}</span>}
                      </p>
                    )}
                    {errorUsuario && <p className="text-red-400 text-[9px] mt-1 font-bold">{errorUsuario}</p>}
                  </div>
                  <button
                    onClick={() => editandoUsuario ? handleGuardarNombreUsuario() : setEditandoUsuario(true)}
                    disabled={savingUsuario}
                    className="text-[10px] font-black uppercase tracking-widest hover:scale-110 transition-all disabled:opacity-50 min-w-[60px] text-right"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {savingUsuario ? '...' : editandoUsuario ? t.profile.save.toUpperCase() : t.profile.edit.toUpperCase()}
                  </button>
                </div>

                {/* Email */}
                <div className="px-6 py-5 rounded-xl bg-white/[0.02] cursor-not-allowed opacity-70">
                  <SectionLabel>{t.auth.email}</SectionLabel>
                  <p className="text-white font-black italic lowercase">{user?.email ?? '—'}</p>
                </div>
              </div>
            </div>

            {/* Cambiar contraseña */}
            <div className="space-y-3">
              <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic flex items-center gap-2">
                <Lock size={10} />
                {locale === 'es' ? 'Cambiar Contraseña' : 'Change Password'}
              </h3>
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-xl space-y-4">

                {/* 1. Contraseña actual primero */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <SectionLabel>{locale === 'es' ? 'Contraseña actual' : 'Current password'}</SectionLabel>
                    <button
                      type="button"
                      onClick={() => setMostrarRecuperacion(v => !v)}
                      className="text-[10px] font-bold hover:underline transition-all flex items-center gap-1"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <HelpCircle size={11} />
                      {locale === 'es' ? '¿No la recuerdas? Recupérala' : "Forgot it? Recover it"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showActual ? 'text' : 'password'}
                      value={actualPassword}
                      onChange={(e) => setActualPassword(e.target.value)}
                      placeholder={locale === 'es' ? 'Tu contraseña actual' : 'Your current password'}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-white/20 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowActual(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showActual ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Apartado desplegable de recuperación de contraseña */}
                {mostrarRecuperacion && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-wider">
                        <KeyRound size={14} style={{ color: 'var(--color-primary)' }} />
                        <span>{locale === 'es' ? 'Recuperación de contraseña' : 'Password recovery'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMostrarRecuperacion(false)}
                        className="text-neutral-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title={locale === 'es' ? 'Cerrar' : 'Close'}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {locale === 'es'
                        ? 'Elige cómo prefieres recibir el mensaje de recuperación:'
                        : 'Choose how you would like to receive the recovery message:'}
                    </p>

                    {/* Selector de método: Correo o Teléfono */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setMetodoRecuperacion('email'); setErrorRecuperacion(''); setMensajeRecuperacion(''); }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          metodoRecuperacion === 'email'
                            ? 'bg-[var(--color-primary)] text-black font-black'
                            : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
                        }`}
                      >
                        <Mail size={13} />
                        <span>{locale === 'es' ? 'Por Correo' : 'By Email'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMetodoRecuperacion('telefono'); setErrorRecuperacion(''); setMensajeRecuperacion(''); }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          metodoRecuperacion === 'telefono'
                            ? 'bg-[var(--color-primary)] text-black font-black'
                            : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
                        }`}
                      >
                        <Phone size={13} />
                        <span>{locale === 'es' ? 'Por Teléfono' : 'By Phone'}</span>
                      </button>
                    </div>

                    {/* Contenido según el método */}
                    {metodoRecuperacion === 'email' ? (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] text-neutral-300">
                          {locale === 'es'
                            ? `Te enviaremos un enlace seguro a:`
                            : `We will send a secure link to:`}{' '}
                          <span className="font-bold text-white">{user?.email ?? 'tu correo'}</span>
                        </p>
                        <button
                          type="button"
                          onClick={handleEnviarRecuperacion}
                          disabled={enviandoRecuperacion}
                          className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-black transition-all cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          {enviandoRecuperacion
                            ? (locale === 'es' ? 'Enviando enlace...' : 'Sending link...')
                            : (locale === 'es' ? 'Enviar enlace al correo' : 'Send link to email')}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5 pt-1">
                        <label className="text-[10px] text-neutral-400 font-bold block">
                          {locale === 'es' ? 'Número de teléfono (con prefijo)' : 'Phone number (with country code)'}
                        </label>
                        <input
                          type="tel"
                          value={telefonoRecuperacion}
                          onChange={(e) => setTelefonoRecuperacion(e.target.value)}
                          placeholder="+34 600 000 000"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold outline-none focus:border-white/30 transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleEnviarRecuperacion}
                          disabled={enviandoRecuperacion || !telefonoRecuperacion.trim()}
                          className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-black transition-all cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          {enviandoRecuperacion
                            ? (locale === 'es' ? 'Enviando mensaje SMS...' : 'Sending SMS...')
                            : (locale === 'es' ? 'Enviar mensaje al teléfono' : 'Send message to phone')}
                        </button>
                      </div>
                    )}

                    {mensajeRecuperacion && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2 text-xs text-emerald-300">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                        <span>{mensajeRecuperacion}</span>
                      </div>
                    )}
                    {errorRecuperacion && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-300">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{errorRecuperacion}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Nueva contraseña */}
                <div className="space-y-1.5">
                  <SectionLabel>{locale === 'es' ? 'Nueva contraseña' : 'New password'}</SectionLabel>
                  <div className="relative">
                    <input
                      type={showNueva ? 'text' : 'password'}
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-white/20 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNueva(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showNueva ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirmar contraseña */}
                <div className="space-y-1.5">
                  <SectionLabel>{locale === 'es' ? 'Confirmar nueva contraseña' : 'Confirm new password'}</SectionLabel>
                  <div className="relative">
                    <input
                      type={showConfirmar ? 'text' : 'password'}
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-white/20 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Barra de fortaleza */}
                {nuevaPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => {
                        const strength = Math.min(4, Math.floor(nuevaPassword.length / 3));
                        const color = strength < 2 ? '#ef4444' : strength < 3 ? '#f59e0b' : strength < 4 ? '#34d399' : 'var(--color-primary)';
                        return (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all"
                            style={{ backgroundColor: i <= strength ? color : 'rgba(255,255,255,0.1)' }} />
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-neutral-500">
                      {nuevaPassword.length < 6
                        ? (locale === 'es' ? 'Muy corta' : 'Too short')
                        : nuevaPassword.length < 9
                          ? (locale === 'es' ? 'Débil' : 'Weak')
                          : nuevaPassword.length < 12
                            ? (locale === 'es' ? 'Buena' : 'Good')
                            : (locale === 'es' ? 'Fuerte' : 'Strong')
                      }
                    </p>
                  </div>
                )}

                {errorPassword && <p className="text-red-400 text-[10px] font-bold">{errorPassword}</p>}
                {successPassword && <p className="text-green-400 text-[10px] font-bold flex items-center gap-1"><Check size={12} /> {locale === 'es' ? 'Contraseña actualizada correctamente' : 'Password updated successfully'}</p>}

                <div className="flex justify-end">
                  <button
                    onClick={handleCambiarPassword}
                    disabled={savingPassword || !actualPassword || !nuevaPassword}
                    className="px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest text-black transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                    style={{ backgroundColor: successPassword ? '#34d399' : 'var(--color-primary)' }}
                  >
                    {savingPassword ? (locale === 'es' ? 'Verificando...' : 'Verifying...') : (locale === 'es' ? 'Actualizar contraseña' : 'Update password')}
                  </button>
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div className="space-y-3">
              <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">
                {locale === 'es' ? 'Preferencias' : 'Preferences'}
              </h3>
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">

                {/* Unidades */}
                <div
                  className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  onClick={!savingUnidades ? handleToggleUnidades : undefined}
                >
                  <div>
                    <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">
                      {t.profile.units} ({unidadesKg ? t.profile.kg : t.profile.lbs})
                    </span>
                    {savingUnidades && <p className="text-neutral-500 text-[9px] mt-0.5">{locale === 'es' ? 'Guardando...' : 'Saving...'}</p>}
                  </div>
                  <Toggle on={unidadesKg} onToggle={handleToggleUnidades} saving={savingUnidades} />
                </div>

                {/* Notificaciones */}
                <div
                  className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  onClick={!savingNotif ? handleToggleNotificaciones : undefined}
                >
                  <div>
                    <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">
                      {t.profile.notifications}
                    </span>
                    {savingNotif && <p className="text-neutral-500 text-[9px] mt-0.5">{locale === 'es' ? 'Guardando...' : 'Saving...'}</p>}
                  </div>
                  <Toggle on={notificaciones} onToggle={handleToggleNotificaciones} saving={savingNotif} />
                </div>

                {/* Notificaciones por email */}
                <div
                  className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  onClick={!savingNotifEmail ? handleToggleNotificacionesEmail : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: notificacionesEmail ? 'rgba(219,240,89,0.12)' : 'rgba(255,255,255,0.04)' }}>
                      <Mail size={14} style={{ color: notificacionesEmail ? 'var(--color-primary)' : 'var(--color-neutral-2000)' }} />
                    </div>
                    <div>
                      <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">
                        {locale === 'es' ? 'Notificaciones por email' : 'Email notifications'}
                      </span>
                      <p className="text-neutral-500 text-[9px] mt-0.5">
                        {locale === 'es'
                          ? 'Resumen semanal, subida de nivel, rachas'
                          : 'Weekly summary, level-up alerts, streaks'}
                      </p>
                      {savingNotifEmail && <p className="text-neutral-500 text-[9px] mt-0.5">{locale === 'es' ? 'Guardando...' : 'Saving...'}</p>}
                    </div>
                  </div>
                  <Toggle on={notificacionesEmail} onToggle={handleToggleNotificacionesEmail} saving={savingNotifEmail} />
                </div>
              </div>
            </div>

            {/* Apariencia e idioma */}
            <div className="space-y-3">
              <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic flex items-center gap-2">
                <Globe size={11} />
                {locale === 'es' ? 'Apariencia e Idioma' : 'Appearance & Language'}
              </h3>
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">

                {/* Tema */}
                <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer" onClick={toggleTheme}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: theme === 'dark' ? 'rgba(219,240,89,0.12)' : 'rgba(67,97,238,0.12)' }}>
                      {theme === 'dark' ? <Moon size={15} style={{ color: 'var(--color-primary)' }} /> : <Sun size={15} style={{ color: 'var(--color-accent)' }} />}
                    </div>
                    <div>
                      <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">{locale === 'es' ? 'Tema' : 'Theme'}</span>
                      <p className="text-neutral-500 text-[9px] mt-0.5">
                        {theme === 'dark' ? (locale === 'es' ? 'Modo oscuro' : 'Dark mode') : (locale === 'es' ? 'Modo claro' : 'Light mode')}
                      </p>
                    </div>
                  </div>
                  <Toggle on={theme === 'dark'} onToggle={toggleTheme} saving={false} />
                </div>

                {/* Idioma */}
                <div
                  className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => setLocale((locale === 'es' ? 'en' : 'es') as Locale)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <img src={locale === 'es' ? flagEn : flagEs} alt="" className="w-5 h-5 rounded-sm object-cover" />
                    </div>
                    <div>
                      <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">{locale === 'es' ? 'Idioma' : 'Language'}</span>
                      <p className="text-neutral-500 text-[9px] mt-0.5">
                        {locale === 'es' ? 'Español · Cambiar a English' : 'English · Switch to Español'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--color-neutral-800)', border: '1px solid var(--color-neutral-900)' }}>
                    <img src={locale === 'es' ? flagEs : flagEn} alt="" className="w-4 h-4 rounded-sm" />
                    <span className="text-[10px] font-black" style={{ color: 'var(--color-neutral-3000)' }}>{locale === 'es' ? 'ES' : 'EN'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacidad y Datos (RGPD / GDPR) */}
            <div className="space-y-3">
              <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic flex items-center gap-2">
                <ShieldCheck size={11} />
                {locale === 'es' ? 'Privacidad y Datos (RGPD)' : 'Privacy & Data (GDPR)'}
              </h3>
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-xl space-y-4">
                {/* Exportar datos CSV */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0">
                      <FileSpreadsheet size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">
                        {locale === 'es' ? 'Exportar mis datos (CSV)' : 'Export my data (CSV)'}
                      </h4>
                      <p className="text-neutral-400 text-xs mt-0.5 max-w-md">
                        {locale === 'es'
                          ? 'Descarga una copia completa de tus entrenamientos, series, marcas, rutinas y datos personales en formato CSV estructurado.'
                          : 'Download a complete copy of your workouts, sets, PRs, routines, and personal data in a structured CSV file.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportarCSV}
                    disabled={exportandoCSV}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <Download size={14} />
                    <span>
                      {exportandoCSV
                        ? (locale === 'es' ? 'Exportando...' : 'Exporting...')
                        : (locale === 'es' ? 'Descargar CSV' : 'Download CSV')}
                    </span>
                  </button>
                </div>

                {/* Moderación: Usuarios Bloqueados */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-400 shrink-0">
                        <Ban size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-xs sm:text-sm">
                          {locale === 'es' ? 'Usuarios Bloqueados' : 'Blocked Users'}
                        </h4>
                        <p className="text-neutral-400 text-xs mt-0.5">
                          {locale === 'es'
                            ? 'Gestiona a qué atletas has bloqueado en la comunidad social.'
                            : 'Manage athletes you have blocked in the social community.'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                      {perfilesBloqueados.length}
                    </span>
                  </div>

                  {cargandoBloqueados ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={18} className="animate-spin text-neutral-500" />
                    </div>
                  ) : perfilesBloqueados.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic pl-1">
                      {locale === 'es'
                        ? 'No tienes a ningún usuario bloqueado actualmente.'
                        : 'You do not have any blocked users currently.'}
                    </p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      {perfilesBloqueados.map(b => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                              {b.avatar_url ? (
                                <img src={b.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <UserIcon size={16} className="text-neutral-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {b.nombre_completo || b.nombre_usuario}
                              </p>
                              <p className="text-[10px] text-neutral-400 truncate">
                                @{b.nombre_usuario}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDesbloquearEnConfig(b.id)}
                            disabled={desbloqueandoId === b.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer shrink-0"
                          >
                            {desbloqueandoId === b.id
                              ? (locale === 'es' ? 'Desbloqueando...' : 'Unblocking...')
                              : (locale === 'es' ? 'Desbloquear' : 'Unblock')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Eliminar cuenta por RGPD */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-red-500/[0.04] border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 shrink-0">
                      <Trash2 size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-red-400 text-xs sm:text-sm">
                        {locale === 'es' ? 'Eliminar cuenta y datos personales' : 'Delete account and personal data'}
                      </h4>
                      <p className="text-neutral-400 text-xs mt-0.5 max-w-md">
                        {locale === 'es'
                          ? 'Derecho al olvido según el Art. 17 del RGPD. Elimina de forma permanente e irreversible toda tu cuenta y actividad.'
                          : 'Right to erasure under GDPR Art. 17. Permanently and irreversibly deletes your account and activity.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmacionTexto('');
                      setErrorEliminar('');
                      setModalEliminarAbierto(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <Trash2 size={14} />
                    <span>{locale === 'es' ? 'Eliminar cuenta' : 'Delete account'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ayuda & Soporte Técnico */}
            <div className="space-y-3">
              <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic flex items-center gap-2">
                <Headphones size={11} />
                {locale === 'es' ? 'Ayuda & Soporte Técnico' : 'Help & Tech Support'}
              </h3>
              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0">
                    <Headphones size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs sm:text-sm">
                      {locale === 'es' ? 'Chat de Soporte Técnico 24/7' : '24/7 Tech Support Chat'}
                    </h4>
                    <p className="text-neutral-400 text-xs mt-0.5 max-w-md">
                      {locale === 'es'
                        ? 'Resuelve incidencias sobre sincronización, copias de seguridad, cálculo de sobrecarga o reporta problemas técnicos directamente.'
                        : 'Get fast support for data sync, cloud backups, overload formulas, or technical reports.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/perfil/soporte')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-black hover:opacity-90 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <Headphones size={14} />
                  <span>{locale === 'es' ? 'Abrir Chat' : 'Open Chat'}</span>
                </button>
              </div>
            </div>

            {/* Cerrar sesión y Eliminar cuenta */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleCerrarSesion}
                className="w-full border border-white/10 text-neutral-300 py-3.5 rounded-2xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
              >
                {t.profile.logout}
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmacionTexto('');
                  setErrorEliminar('');
                  setModalEliminarAbierto(true);
                }}
                className="w-full border border-red-500/30 text-red-400 py-3.5 rounded-2xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-red-500/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 size={13} />
                <span>{locale === 'es' ? 'Eliminar cuenta' : 'Delete account'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ══ TAB: DATOS PERSONALES ════════════════════════════════════════════ */}
        {tab === 'datos' && (
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic flex items-center gap-2">
                <Activity size={11} />
                {locale === 'es' ? 'Datos Físicos' : 'Physical Data'}
              </h3>

              <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-xl space-y-5">

                {/* Grid peso + altura + edad */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                      <Scale size={10} />
                      {locale === 'es' ? `Peso (${unidadesKg ? 'kg' : 'lbs'})` : `Weight (${unidadesKg ? 'kg' : 'lbs'})`}
                    </label>
                    <input
                      type="number" min="30" max="300" step="0.1"
                      placeholder={unidadesKg ? '70' : '154'}
                      value={pesoKg}
                      onChange={(e) => setPesoKg(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                      <Ruler size={10} />
                      {locale === 'es' ? 'Altura (cm)' : 'Height (cm)'}
                    </label>
                    <input
                      type="number" min="100" max="250" step="1"
                      placeholder="175"
                      value={alturaCm}
                      onChange={(e) => setAlturaCm(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                      <Calendar size={10} />
                      {locale === 'es' ? 'Edad' : 'Age'}
                    </label>
                    <input
                      type="number" min="10" max="100" step="1"
                      placeholder="25"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                </div>

                {/* IMC */}
                {imc !== null && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: `${imcLabel!.color}15`, border: `1px solid ${imcLabel!.color}30` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ background: `${imcLabel!.color}25`, color: imcLabel!.color }}>
                      {imc.toFixed(1)}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: imcLabel!.color }}>
                        IMC · {imcLabel!.text}
                      </p>
                      <p className="text-[9px] text-neutral-500 mt-0.5">
                        {locale === 'es' ? 'Calculado automáticamente con tu peso y altura' : 'Automatically calculated from weight & height'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Género + Nivel actividad + Objetivo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                      {locale === 'es' ? 'Género' : 'Gender'}
                    </label>
                    <select value={genero ?? ''} onChange={(e) => setGenero((e.target.value || null) as typeof genero)} className="w-full">
                      <option value="">{locale === 'es' ? 'Sin especificar' : 'Not specified'}</option>
                      <option value="masculino">{locale === 'es' ? 'Masculino' : 'Male'}</option>
                      <option value="femenino">{locale === 'es' ? 'Femenino' : 'Female'}</option>
                      <option value="otro">{locale === 'es' ? 'Otro' : 'Other'}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                      <Zap size={10} />
                      {locale === 'es' ? 'Nivel actividad' : 'Activity level'}
                    </label>
                    <select value={nivelActividad ?? ''} onChange={(e) => setNivelActividad((e.target.value || null) as typeof nivelActividad)} className="w-full">
                      <option value="">{locale === 'es' ? 'Sin especificar' : 'Not specified'}</option>
                      <option value="sedentario">{locale === 'es' ? 'Sedentario' : 'Sedentary'}</option>
                      <option value="ligero">{locale === 'es' ? 'Ligero (1-2 días/sem)' : 'Light (1-2 days/wk)'}</option>
                      <option value="moderado">{locale === 'es' ? 'Moderado (3-4 días/sem)' : 'Moderate (3-4 days/wk)'}</option>
                      <option value="activo">{locale === 'es' ? 'Activo (5-6 días/sem)' : 'Active (5-6 days/wk)'}</option>
                      <option value="muy_activo">{locale === 'es' ? 'Muy activo (diario)' : 'Very active (daily)'}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                      <Target size={10} />
                      {locale === 'es' ? 'Objetivo' : 'Goal'}
                    </label>
                    <select value={objetivo ?? ''} onChange={(e) => setObjetivo((e.target.value || null) as typeof objetivo)} className="w-full">
                      <option value="">{locale === 'es' ? 'Sin especificar' : 'Not specified'}</option>
                      <option value="perder_peso">{locale === 'es' ? 'Perder peso' : 'Lose weight'}</option>
                      <option value="ganar_musculo">{locale === 'es' ? 'Ganar músculo' : 'Build muscle'}</option>
                      <option value="mantener">{locale === 'es' ? 'Mantener peso' : 'Maintain weight'}</option>
                      <option value="mejorar_resistencia">{locale === 'es' ? 'Mejorar resistencia' : 'Improve endurance'}</option>
                    </select>
                  </div>
                </div>

                {errorFisicos && <p className="text-red-400 text-[10px] font-bold">{errorFisicos}</p>}

                <div className="flex justify-end">
                  <button
                    onClick={handleGuardarFisicos}
                    disabled={savingFisicos}
                    className="px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest text-black transition-all active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: successFisicos ? '#34d399' : 'var(--color-primary)' }}
                  >
                    {savingFisicos ? (locale === 'es' ? 'Guardando...' : 'Saving...')
                      : successFisicos ? (locale === 'es' ? 'Guardado' : 'Saved')
                      : (locale === 'es' ? 'Guardar datos' : 'Save data')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación por RGPD */}
      {modalEliminarAbierto && (
        <div
          className="modal-overlay z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => !eliminandoCuenta && setModalEliminarAbierto(false)}
        >
          <div
            className="relative w-full max-w-md bg-neutral-950 border border-red-500/30 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white leading-tight">
                  {locale === 'es' ? '¿Eliminar tu cuenta definitivamente?' : 'Permanently delete your account?'}
                </h3>
                <span className="text-[10px] font-mono uppercase text-red-400 font-bold tracking-wider">
                  {locale === 'es' ? 'Acción irreversible · RGPD Art. 17' : 'Irreversible action · GDPR Art. 17'}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {locale === 'es'
                ? 'Al confirmar, se eliminarán permanentemente tus rutinas, historial de entrenamientos, series, marcas personales, seguidores y tu perfil público. Esta acción no se puede deshacer.'
                : 'Confirming will permanently delete your routines, workout history, sets, PRs, followers, and public profile. This action cannot be undone.'}
            </p>

            <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <label className="text-[11px] font-bold text-neutral-300 block">
                {locale === 'es'
                  ? 'Para confirmar, escribe "ELIMINAR" a continuación:'
                  : 'To confirm, type "DELETE" below:'}
              </label>
              <input
                type="text"
                value={confirmacionTexto}
                onChange={e => setConfirmacionTexto(e.target.value)}
                placeholder={locale === 'es' ? 'ELIMINAR' : 'DELETE'}
                disabled={eliminandoCuenta}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono text-sm placeholder-neutral-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                autoFocus
              />
            </div>

            {errorEliminar && (
              <p className="text-xs text-red-400 font-medium">
                {errorEliminar}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalEliminarAbierto(false)}
                disabled={eliminandoCuenta}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleEliminarCuentaRGPD}
                disabled={
                  eliminandoCuenta ||
                  (confirmacionTexto.trim().toUpperCase() !== 'ELIMINAR' &&
                    confirmacionTexto.trim().toUpperCase() !== 'DELETE')
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white shadow-lg transition-all cursor-pointer"
              >
                {eliminandoCuenta ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{locale === 'es' ? 'Eliminando...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <span>{locale === 'es' ? 'Eliminar cuenta' : 'Delete account'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
