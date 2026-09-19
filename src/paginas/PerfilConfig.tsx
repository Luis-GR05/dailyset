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
  Target, Zap, User as UserIcon, Settings, Lock, Eye, EyeOff,
} from "lucide-react";
import flagEs from "../assets/flags/es.svg";
import flagEn from "../assets/flags/en.svg";
import { supabase } from "../lib/supabaseClient";

type Tab = 'cuenta' | 'datos';

export default function PerfilConfigPage() {
  const { t, locale, setLocale } = useI18n();
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialTab: Tab = location.pathname.includes('/datos') || searchParams.get('tab') === 'datos' ? 'datos' : 'cuenta';
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (location.pathname.includes('/datos') || searchParams.get('tab') === 'datos') {
      setTab('datos');
    } else if (location.pathname.includes('/configuracion') || searchParams.get('tab') === 'cuenta') {
      setTab('cuenta');
    }
  }, [location.pathname, searchParams]);

  // ── Cuenta ──────────────────────────────────────────────────────────────────
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [editando, setEditando] = useState(false);
  const [unidadesKg, setUnidadesKg] = useState(user?.unidadesKg ?? true);
  const [notificaciones, setNotificaciones] = useState(user?.notificaciones ?? false);

  const [savingNombre, setSavingNombre] = useState(false);
  const [savingUnidades, setSavingUnidades] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [errorNombre, setErrorNombre] = useState('');
  const [successNombre, setSuccessNombre] = useState(false);

  // Contraseña
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState('');
  const [successPassword, setSuccessPassword] = useState(false);

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
      setUnidadesKg(user.unidadesKg ?? true);
      setNotificaciones(user.notificaciones ?? false);
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

  const handleCambiarPassword = async () => {
    setErrorPassword('');
    if (nuevaPassword.length < 6) {
      setErrorPassword(locale === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setErrorPassword(locale === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaPassword });
      if (error) throw error;
      setSuccessPassword(true);
      setNuevaPassword('');
      setConfirmarPassword('');
      setTimeout(() => setSuccessPassword(false), 3000);
    } catch (e: any) {
      setErrorPassword(e.message ?? (locale === 'es' ? 'Error al cambiar contraseña' : 'Error changing password'));
    } finally {
      setSavingPassword(false);
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
        <TituloPagina titulo={tab === 'datos' ? (locale === 'es' ? 'Datos Personales' : 'Personal Data') : t.profile.accountSettings} />

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--color-neutral-800)' }}>
          {([
            { id: 'cuenta', label: locale === 'es' ? 'Configuración de Cuenta' : 'Account Settings', icon: <Settings size={13} /> },
            { id: 'datos', label: locale === 'es' ? 'Datos Personales' : 'Personal Data', icon: <UserIcon size={13} /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                navigate(id === 'datos' ? '/perfil/datos' : '/perfil/configuracion', { replace: true });
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              style={tab === id
                ? { background: 'var(--color-neutral-700)', color: 'var(--color-primary)', border: '1px solid rgba(255,255,255,0.08)' }
                : { color: 'var(--color-neutral-2000)' }
              }
            >
              {icon}
              {label}
            </button>
          ))}
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
                        {successNombre && <span className="text-green-400 text-[10px] font-bold normal-case">✓ {locale === 'es' ? 'guardado' : 'saved'}</span>}
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

                {/* Nueva contraseña */}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    >
                      {showNueva ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-1.5">
                  <SectionLabel>{locale === 'es' ? 'Confirmar contraseña' : 'Confirm password'}</SectionLabel>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
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
                {successPassword && <p className="text-green-400 text-[10px] font-bold">✓ {locale === 'es' ? 'Contraseña actualizada' : 'Password updated'}</p>}

                <div className="flex justify-end">
                  <button
                    onClick={handleCambiarPassword}
                    disabled={savingPassword || !nuevaPassword}
                    className="px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest text-black transition-all active:scale-95 disabled:opacity-40"
                    style={{ backgroundColor: successPassword ? '#34d399' : 'var(--color-primary)' }}
                  >
                    {savingPassword ? (locale === 'es' ? 'Guardando...' : 'Saving...') : (locale === 'es' ? 'Actualizar contraseña' : 'Update password')}
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

            {/* Cerrar sesión */}
            <button
              onClick={handleCerrarSesion}
              className="w-full border border-red-500/30 text-red-500 py-4 rounded-2xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-red-500/10 transition-all active:scale-95"
            >
              {t.profile.logout}
            </button>
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
    </AppLayout>
  );
}
