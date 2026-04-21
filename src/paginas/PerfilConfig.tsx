import { useState, useEffect } from "react";
import { AppLayout, TituloPagina } from "../componentes";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { X } from "lucide-react";

type Dialog =
  | { tipo: 'confirmarLogout' }
  | { tipo: 'resetPassword' }
  | { tipo: 'resetPasswordExito' }
  | null;

export default function PerfilConfigPage() {
  const { t, locale } = useI18n();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [editando, setEditando] = useState(false);
  const [unidadesKg, setUnidadesKg] = useState(user?.unidadesKg ?? true);
  const [notificaciones, setNotificaciones] = useState(user?.notificaciones ?? false);

  const [savingNombre, setSavingNombre] = useState(false);
  const [savingUnidades, setSavingUnidades] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [errorNombre, setErrorNombre] = useState('');
  const [successNombre, setSuccessNombre] = useState(false);

  const [dialog, setDialog] = useState<Dialog>(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (user) {
      setNombre(user.nombre ?? '');
      setUnidadesKg(user.unidadesKg ?? true);
      setNotificaciones(user.notificaciones ?? false);
    }
  }, [user]);

  const handleGuardarNombre = async () => {
    if (!nombre.trim()) return;
    setSavingNombre(true);
    setErrorNombre('');
    setSuccessNombre(false);
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
    try {
      await updateUser({ unidadesKg: nuevo });
    } catch {
      setUnidadesKg(!nuevo);
    } finally {
      setSavingUnidades(false);
    }
  };

  const handleToggleNotificaciones = async () => {
    const nuevo = !notificaciones;
    setNotificaciones(nuevo);
    setSavingNotif(true);
    try {
      await updateUser({ notificaciones: nuevo });
    } catch {
      setNotificaciones(!nuevo);
    } finally {
      setSavingNotif(false);
    }
  };

  const handleConfirmarLogout = async () => {
    setDialog(null);
    await logout();
    navigate('/login');
  };

  const handleEnviarResetPassword = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    setResetError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setDialog({ tipo: 'resetPasswordExito' });
    } catch {
      setResetError(
        locale === 'es'
          ? 'No se pudo enviar el email. Inténtalo de nuevo.'
          : 'Could not send the email. Please try again.'
      );
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-10 max-w-4xl mx-auto">
        <TituloPagina titulo={t.profile.accountSettings} />

        {/* Datos de usuario */}
        <div className="space-y-3">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">
            {locale === 'es' ? 'Datos de Usuario' : 'User Data'}
          </h3>

          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">

            {/* Nombre */}
            <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all group">
              <div className="flex-1 mr-4">
                <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mb-1">
                  {t.profile.name}
                </p>
                {editando ? (
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="bg-white/10 text-white font-black italic outline-none w-full py-1"
                    style={{ borderBottom: '1px solid var(--color-accent)' }}
                    autoFocus
                    disabled={savingNombre}
                  />
                ) : (
                  <p className="text-white font-black italic uppercase flex items-center gap-2">
                    {nombre || (locale === 'es' ? 'Sin nombre' : 'No name')}
                    {successNombre && (
                      <span className="text-green-400 text-[10px] font-bold normal-case tracking-normal">
                        ✓ {locale === 'es' ? 'guardado' : 'saved'}
                      </span>
                    )}
                  </p>
                )}
                {errorNombre && (
                  <p className="text-red-400 text-[9px] mt-1 font-bold">{errorNombre}</p>
                )}
              </div>

              <button
                onClick={() => editando ? handleGuardarNombre() : setEditando(true)}
                disabled={savingNombre}
                className="text-[10px] font-black uppercase tracking-widest hover:scale-110 transition-all disabled:opacity-50 disabled:scale-100 min-w-[60px] text-right"
                style={{ color: 'var(--color-primary)' }}
              >
                {savingNombre
                  ? '...'
                  : editando
                    ? t.profile.save.toUpperCase()
                    : t.profile.edit.toUpperCase()
                }
              </button>
            </div>

            {/* Email (solo lectura) */}
            <div className="px-6 py-5 rounded-xl bg-white/[0.02] cursor-not-allowed opacity-70">
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mb-1">
                {t.auth.email}
              </p>
              <p className="text-white font-black italic lowercase">
                {user?.email ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Preferencias técnicas */}
        <div className="space-y-3">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">
            {locale === 'es' ? 'Preferencias Técnicas' : 'Technical Preferences'}
          </h3>

          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">

            {/* Toggle unidades */}
            <div
              className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              onClick={!savingUnidades ? handleToggleUnidades : undefined}
            >
              <div>
                <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">
                  {t.profile.units} ({unidadesKg ? t.profile.kg : t.profile.lbs})
                </span>
                {savingUnidades && (
                  <p className="text-neutral-500 text-[9px] mt-0.5">{locale === 'es' ? 'Guardando...' : 'Saving...'}</p>
                )}
              </div>
              <button
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${savingUnidades ? 'opacity-50' : ''}`}
                style={unidadesKg ? { backgroundColor: 'var(--color-primary)' } : { backgroundColor: 'rgb(64,64,64)' }}
                disabled={savingUnidades}
                aria-label={t.profile.units}
              >
                <div className={`w-4 h-4 rounded-full absolute top-0.5 transition-all duration-300 ${unidadesKg ? 'right-0.5 bg-black' : 'left-0.5 bg-white'}`}></div>
              </button>
            </div>

            {/* Toggle notificaciones */}
            <div
              className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              onClick={!savingNotif ? handleToggleNotificaciones : undefined}
            >
              <div>
                <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">
                  {t.profile.notifications}
                </span>
                {savingNotif && (
                  <p className="text-neutral-500 text-[9px] mt-0.5">{locale === 'es' ? 'Guardando...' : 'Saving...'}</p>
                )}
              </div>
              <button
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${savingNotif ? 'opacity-50' : ''}`}
                style={notificaciones ? { backgroundColor: 'var(--color-primary)' } : { backgroundColor: 'rgb(64,64,64)' }}
                disabled={savingNotif}
                aria-label={t.profile.notifications}
              >
                <div className={`w-4 h-4 rounded-full absolute top-0.5 transition-all duration-300 ${notificaciones ? 'right-0.5 bg-black' : 'left-0.5 bg-white'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Seguridad y cuenta */}
        <div className="space-y-3 pt-4">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">
            {locale === 'es' ? 'Seguridad y Cuenta' : 'Security & Account'}
          </h3>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={() => setDialog({ tipo: 'resetPassword' })}
              className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
            >
              {locale === 'es' ? 'Cambiar contraseña' : 'Change password'}
            </button>
            <button
              onClick={() => setDialog({ tipo: 'confirmarLogout' })}
              className="flex-1 border border-red-500/30 text-red-500 py-4 rounded-xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-red-500/10 transition-all active:scale-95"
            >
              {t.profile.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Dialog: Confirmar cierre de sesión */}
      {dialog?.tipo === 'confirmarLogout' && (
        <div className="modal-overlay" onClick={() => setDialog(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-bold text-white">
                {locale === 'es' ? 'Cerrar sesión' : 'Sign out'}
              </h2>
              <button className="modal-close-btn" onClick={() => setDialog(null)}><X size={16} /></button>
            </div>
            <div className="modal-form">
              <p className="text-neutral-300 text-sm">{t.profile.logoutConfirm}</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setDialog(null)}>
                  {locale === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  className="btn"
                  style={{ background: '#ef4444', color: 'white' }}
                  onClick={handleConfirmarLogout}
                >
                  {t.profile.logout}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Cambiar contraseña */}
      {dialog?.tipo === 'resetPassword' && (
        <div className="modal-overlay" onClick={() => setDialog(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-bold text-white">
                {locale === 'es' ? 'Cambiar contraseña' : 'Change password'}
              </h2>
              <button className="modal-close-btn" onClick={() => setDialog(null)}><X size={16} /></button>
            </div>
            <div className="modal-form">
              <p className="text-neutral-300 text-sm">
                {locale === 'es'
                  ? `Se enviará un email de restablecimiento a ${user?.email ?? 'tu correo'}.`
                  : `A reset email will be sent to ${user?.email ?? 'your email'}.`}
              </p>
              {resetError && (
                <p className="text-red-400 text-xs mt-2 font-bold">{resetError}</p>
              )}
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setDialog(null)}>
                  {locale === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleEnviarResetPassword}
                  disabled={sendingReset}
                >
                  {sendingReset
                    ? (locale === 'es' ? 'Enviando...' : 'Sending...')
                    : (locale === 'es' ? 'Enviar email' : 'Send email')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Email enviado con éxito */}
      {dialog?.tipo === 'resetPasswordExito' && (
        <div className="modal-overlay" onClick={() => setDialog(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-bold text-white">
                {locale === 'es' ? '¡Email enviado!' : 'Email sent!'}
              </h2>
              <button className="modal-close-btn" onClick={() => setDialog(null)}><X size={16} /></button>
            </div>
            <div className="modal-form">
              <p className="text-neutral-300 text-sm">
                {locale === 'es'
                  ? 'Revisa tu bandeja de entrada y sigue las instrucciones para cambiar tu contraseña.'
                  : 'Check your inbox and follow the instructions to change your password.'}
              </p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => setDialog(null)}>
                  {locale === 'es' ? 'Entendido' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
