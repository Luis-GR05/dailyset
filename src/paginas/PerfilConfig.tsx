import { useState } from "react";
import { AppLayout, TituloPagina } from "../componentes";
import { useI18n } from "../context/I18nContext";

export default function PerfilConfigPage() {
  const { t, locale } = useI18n();
  const [nombre, setNombre] = useState("JUAN PÉREZ");
  const [editando, setEditando] = useState(false);
  const [unidadesKg, setUnidadesKg] = useState(true);
  const [notificaciones, setNotificaciones] = useState(false);

  const handleGuardarNombre = () => {
    setEditando(false);
  };

  const handleCerrarSesion = () => {
    if (confirm(t.profile.logoutConfirm)) {
      window.location.href = "/login";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-10 max-w-4xl mx-auto">
        <TituloPagina titulo={t.profile.accountSettings} />

        <div className="space-y-3">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">{locale === 'es' ? 'Datos de Usuario' : 'User Data'}</h3>

          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all group">
              <div className="flex-1 mr-4">
                <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mb-1">{t.profile.name}</p>
                {editando ? (
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value.toUpperCase())}
                    className="bg-white/10 text-white font-black italic uppercase outline-none w-full py-1"
                    style={{ borderBottom: '1px solid var(--color-accent)' }}
                    autoFocus
                  />
                ) : (
                  <p className="text-white font-black italic uppercase">{nombre}</p>
                )}
              </div>

              <button
                onClick={() => editando ? handleGuardarNombre() : setEditando(true)}
                className="text-[10px] font-black uppercase tracking-widest hover:scale-110 transition-all"
                style={{ color: 'var(--color-primary)' }}
              >
                {editando ? t.profile.save.toUpperCase() : t.profile.edit.toUpperCase()}
              </button>
            </div>

            <div className="px-6 py-5 rounded-xl bg-white/[0.02] cursor-not-allowed opacity-70">
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mb-1">{t.auth.email}</p>
              <p className="text-white font-black italic lowercase">juan.perez@email.com</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">{locale === 'es' ? 'Preferencias Técnicas' : 'Technical Preferences'}</h3>

          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer" onClick={() => setUnidadesKg(!unidadesKg)}>
              <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">
                {t.profile.units} ({unidadesKg ? t.profile.kg : t.profile.lbs})
              </span>
              <button className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${unidadesKg ? '' : 'bg-neutral-700'}`}
                style={unidadesKg ? { backgroundColor: 'var(--color-primary)' } : {}}>
                <div className={`w-4 h-4 bg-black rounded-full absolute top-0.5 transition-all duration-300 ${unidadesKg ? 'right-0.5' : 'left-0.5 bg-white'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer" onClick={() => setNotificaciones(!notificaciones)}>
              <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">{t.profile.notifications}</span>
              <button className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${notificaciones ? '' : 'bg-neutral-700'}`}
                style={notificaciones ? { backgroundColor: 'var(--color-primary)' } : {}}>
                <div className={`w-4 h-4 bg-black rounded-full absolute top-0.5 transition-all duration-300 ${notificaciones ? 'right-0.5' : 'left-0.5 bg-white'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">{locale === 'es' ? 'Seguridad y Cuenta' : 'Security & Account'}</h3>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={() => alert(locale === 'es' ? 'Cambio de contraseña enviado' : 'Password change sent')}
              className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
            >
              {locale === 'es' ? 'Cambiar contraseña' : 'Change password'}
            </button>
            <button
              onClick={handleCerrarSesion}
              className="flex-1 border border-red-500/30 text-red-500 py-4 rounded-xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-red-500/10 transition-all active:scale-95"
            >
              {t.profile.logout}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}