import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export default function CookieBanner() {
  const { locale } = useI18n();
  const es = locale === 'es';

  const [visible, setVisible] = useState(false);
  const [personalizar, setPersonalizar] = useState(false);
  const [analiticas, setAnaliticas] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('dailyset_cookies_consent');
    if (!consent) {
      // Pequeño retardo para que la animación de entrada sea suave
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAceptarTodas = () => {
    localStorage.setItem(
      'dailyset_cookies_consent',
      JSON.stringify({ tipo: 'todas', analiticas: true, fecha: new Date().toISOString() })
    );
    setVisible(false);
  };

  const handleSoloNecesarias = () => {
    localStorage.setItem(
      'dailyset_cookies_consent',
      JSON.stringify({ tipo: 'necesarias', analiticas: false, fecha: new Date().toISOString() })
    );
    setVisible(false);
  };

  const handleGuardarPersonalizadas = () => {
    localStorage.setItem(
      'dailyset_cookies_consent',
      JSON.stringify({ tipo: 'personalizadas', analiticas, fecha: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={es ? 'Aviso de Cookies y Privacidad' : 'Cookie and Privacy Notice'}
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="relative bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white space-y-4">
        
        {/* Cabecera del Banner */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-[0_0_15px_var(--color-primary-glow)]">
            <Cookie size={20} />
          </div>
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                {es ? 'Control de Cookies & Privacidad' : 'Cookie & Privacy Controls'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono font-bold text-neutral-300">
                RGPD
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              {es
                ? 'Utilizamos cookies técnicas y almacenamiento local esencial para mantener tu sesión activa, sincronizar tus entrenamientos en vivo y asegurar tus marcas personales.'
                : 'We use technical cookies and essential local storage to keep your session active, sync live workouts, and secure your personal records.'}{' '}
              <Link
                to="/privacidad"
                className="text-[var(--color-primary)] underline hover:opacity-80 transition-opacity font-medium ml-1"
              >
                {es ? 'Leer política completa' : 'Read full policy'}
              </Link>
            </p>
          </div>
        </div>

        {/* Panel Desplegable de Configuración Personalizada */}
        {personalizar && (
          <div className="space-y-3 pt-2 border-t border-white/10 text-xs animate-in fade-in duration-200">
            {/* Cookies Técnicas / Necesarias */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <ShieldCheck size={14} className="text-[var(--color-primary)]" />
                  <span>{es ? 'Cookies Técnicas & Esenciales' : 'Technical & Essential Cookies'}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {es
                    ? 'Imprescindibles para autenticación, descanso offline y seguridad.'
                    : 'Required for authentication, offline rest timer, and security.'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-bold text-neutral-300 shrink-0">
                {es ? 'Obligatorias' : 'Always Active'}
              </span>
            </div>

            {/* Cookies Analíticas */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-neutral-200">
                  {es ? 'Métricas de Uso y Rendimiento' : 'Usage & Performance Metrics'}
                </span>
                <p className="text-[11px] text-neutral-400">
                  {es
                    ? 'Nos ayudan a optimizar tiempos de carga y estabilidad de la app.'
                    : 'Help us improve load speeds and overall app performance.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnaliticas(!analiticas)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer shrink-0 ${
                  analiticas ? 'bg-[var(--color-primary)]' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform duration-200 ${
                    analiticas ? 'translate-x-5' : 'translate-x-0.5 bg-white'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Acciones principales */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          {personalizar ? (
            <button
              type="button"
              onClick={handleGuardarPersonalizadas}
              className="flex-1 py-2.5 px-4 rounded-full bg-[var(--color-primary)] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_var(--color-primary-glow)] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={14} />
              <span>{es ? 'Guardar Preferencias' : 'Save Preferences'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAceptarTodas}
                className="flex-1 py-2.5 px-4 rounded-full bg-[var(--color-primary)] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_var(--color-primary-glow)] cursor-pointer"
              >
                {es ? 'Aceptar Todas' : 'Accept All'}
              </button>
              <button
                type="button"
                onClick={handleSoloNecesarias}
                className="flex-1 py-2.5 px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
              >
                {es ? 'Solo Necesarias' : 'Necessary Only'}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setPersonalizar(!personalizar)}
            className="py-2.5 px-3 rounded-full text-[11px] font-bold text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{personalizar ? (es ? 'Menos' : 'Less') : (es ? 'Personalizar' : 'Customize')}</span>
            {personalizar ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

      </div>
    </div>
  );
}
