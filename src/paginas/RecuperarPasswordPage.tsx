// src/paginas/RecuperarPasswordPage.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Loader2, Sparkles, Send } from 'lucide-react';
import { Logo } from '../componentes';
import DotGrid from '../componentes/FondoAnimado';
import { useI18n } from '../context/I18nContext';
import { supabase } from '../lib/supabaseClient';

export default function RecuperarPasswordPage() {
  const { t, locale } = useI18n();
  const location = useLocation();
  const emailInicial = (location.state as { email?: string } | null)?.email || '';

  const [email, setEmail] = useState(emailInicial);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    document.title =
      locale === 'es'
        ? 'Recuperar Contraseña | DailySet'
        : 'Recover Password | DailySet';
  }, [locale]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setEnviando(true);

    try {
      const redirectUrl = `${window.location.origin}/restablecer-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (resetError) throw resetError;

      setEnviado(true);
      setCooldown(60);
    } catch (err: any) {
      console.error('Error al enviar correo de recuperación:', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('rate limit') || msg.includes('too many requests')) {
        setError(
          locale === 'es'
            ? 'Demasiadas solicitudes en poco tiempo. Por favor, espera un minuto antes de intentarlo de nuevo.'
            : 'Too many requests. Please wait a minute before trying again.'
        );
      } else if (msg.includes('network') || msg.includes('failed to fetch')) {
        setError(
          locale === 'es'
            ? 'Error de conexión. Comprueba tu conexión a internet.'
            : 'Network error. Please check your internet connection.'
        );
      } else {
        setError(
          locale === 'es'
            ? 'No se pudo enviar el enlace de recuperación. Comprueba que el correo sea correcto e inténtalo de nuevo.'
            : 'Could not send recovery link. Please verify the email address and try again.'
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-8">
      {/* Fondo animado */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotGrid
          dotSize={4}
          gap={20}
          baseColor="#271E37"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div
        className="fixed inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, #5227FF 0%, transparent 60%)',
        }}
      />

      {/* Contenedor central */}
      <div className="relative z-10 w-full max-w-lg bg-neutral-900/80 backdrop-blur-2xl rounded-[36px] p-8 sm:p-10 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <Logo size="lg" />
          </Link>
        </div>

        {enviado ? (
          /* Estado 2: Confirmación de envío */
          <div className="space-y-6 animate-fade-in">
            <div
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center relative shadow-lg"
              style={{
                background:
                  'radial-gradient(circle, rgba(82, 39, 255, 0.25) 0%, rgba(212, 251, 52, 0.1) 100%)',
                border: '1px solid var(--color-primary)',
                boxShadow: '0 0 35px var(--color-primary-glow)',
              }}
            >
              <Mail className="w-10 h-10 text-[var(--color-primary)] animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tight">
                {locale === 'es' ? '¡Enlace Enviado!' : 'Link Sent!'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
                {locale === 'es' ? (
                  <>
                    Hemos enviado un enlace seguro para restablecer tu contraseña a{' '}
                    <span className="font-bold text-white font-mono">{email}</span>.
                  </>
                ) : (
                  <>
                    We have sent a secure password reset link to{' '}
                    <span className="font-bold text-white font-mono">{email}</span>.
                  </>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-neutral-400 text-left space-y-1.5">
              <p className="flex items-center gap-1.5 text-neutral-300 font-bold">
                <Sparkles size={14} className="text-[var(--color-primary)]" />
                <span>
                  {locale === 'es' ? 'Instrucciones de acceso:' : 'Access instructions:'}
                </span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-1">
                <li>
                  {locale === 'es'
                    ? 'Abre el mensaje y pulsa en "Reset Password" o restablecer contraseña.'
                    : 'Open the message and click "Reset Password".'}
                </li>
                <li>
                  {locale === 'es'
                    ? 'Si no lo ves en unos segundos, revisa tu carpeta de spam o correo no deseado.'
                    : 'Check your spam or junk folder if you don’t see it shortly.'}
                </li>
              </ul>
            </div>

            {/* Acciones */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleEnviar}
                disabled={enviando || cooldown > 0}
                className="w-full py-3.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{locale === 'es' ? 'Reenviando...' : 'Resending...'}</span>
                  </>
                ) : cooldown > 0 ? (
                  <span>
                    {locale === 'es'
                      ? `Reenviar en ${cooldown}s`
                      : `Resend in ${cooldown}s`}
                  </span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>
                      {locale === 'es'
                        ? 'Reenviar enlace de recuperación'
                        : 'Resend recovery link'}
                    </span>
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider text-black transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 0 25px var(--color-primary-glow)',
                }}
              >
                <ArrowLeft size={16} />
                <span>
                  {locale === 'es' ? 'Volver a Iniciar Sesión' : 'Back to Sign In'}
                </span>
              </Link>
            </div>
          </div>
        ) : (
          /* Estado 1: Formulario para ingresar correo */
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tight">
                {locale === 'es' ? 'Recuperar Contraseña' : 'Recover Password'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {locale === 'es'
                  ? 'Introduce el correo electrónico asociado a tu cuenta de DailySet y te enviaremos un enlace seguro para restablecerla.'
                  : 'Enter the email address associated with your DailySet account and we will send you a secure link to reset it.'}
              </p>
            </div>

            <form onSubmit={handleEnviar} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-4 block">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="atleta@dailyset.app"
                    disabled={enviando}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-12 text-white placeholder-neutral-500 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={enviando || !email.trim()}
                  className="w-full py-4 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: '0 0 30px var(--color-primary-glow)',
                  }}
                >
                  {enviando ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{locale === 'es' ? 'Enviando enlace...' : 'Sending link...'}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {locale === 'es'
                          ? 'Enviar Enlace de Recuperación'
                          : 'Send Recovery Link'}
                      </span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                <span>
                  {locale === 'es'
                    ? '¿Te acordaste? Volver a Iniciar Sesión'
                    : 'Remembered? Back to Sign In'}
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
