import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { Logo } from '../componentes';
import DotGrid from '../componentes/FondoAnimado';
import { useI18n } from '../context/I18nContext';
import { supabase } from '../lib/supabaseClient';

export default function RegistroConfirmacionPage() {
  const { t } = useI18n();
  const location = useLocation();
  const emailState = (location.state as { email?: string } | null)?.email || '';

  const [email, setEmail] = useState(emailState);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleResendEmail = async () => {
    if (!email) return;
    setResending(true);
    setResendStatus(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      setResendStatus({
        type: 'success',
        message: t.auth.emailResentSuccess,
      });
    } catch (err: any) {
      console.error('Error reenviando correo:', err);
      setResendStatus({
        type: 'error',
        message: t.auth.emailResentError,
      });
    } finally {
      setResending(false);
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
        style={{ background: 'radial-gradient(circle at 50% 40%, #5227FF 0%, transparent 60%)' }}
      />

      {/* Contenedor central */}
      <div className="relative z-10 w-full max-w-lg bg-neutral-900/70 backdrop-blur-2xl rounded-[40px] p-8 sm:p-12 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        {/* Icono animado de correo */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center relative"
          style={{
            background: 'radial-gradient(circle, rgba(82, 39, 255, 0.25) 0%, rgba(219, 240, 89, 0.08) 100%)',
            border: '1px solid var(--color-primary)',
            boxShadow: '0 0 35px var(--color-primary-glow)',
          }}
        >
          <svg
            className="w-10 h-10 animate-pulse"
            fill="none"
            stroke="var(--color-primary)"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tight mb-2">
          {t.auth.confirmEmailTitle}
        </h1>
        <div
          className="h-1 w-16 mx-auto rounded-full mb-6"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />

        {/* Subtítulo con email */}
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-4">
          {t.auth.confirmEmailSubtitle}
        </p>

        {email ? (
          <div className="inline-block bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 mb-6 max-w-full">
            <span
              className="font-bold text-sm sm:text-base break-all"
              style={{ color: 'var(--color-primary)' }}
            >
              {email}
            </span>
          </div>
        ) : (
          <div className="mb-6 max-w-xs mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white text-center text-sm outline-none focus:border-white/30"
            />
          </div>
        )}

        {/* Instrucciones */}
        <div className="bg-neutral-800/50 border border-white/5 rounded-2xl p-4 sm:p-5 mb-8 text-left">
          <div className="flex items-start gap-3">
            <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
              {t.auth.checkInboxInstructions}
            </p>
          </div>
        </div>

        {/* Estado de reenvío */}
        {resendStatus && (
          <div
            className={`rounded-2xl px-4 py-3 mb-6 text-xs font-bold ${
              resendStatus.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {resendStatus.message}
          </div>
        )}

        {/* Acciones principales */}
        <div className="space-y-3">
          {/* Botón ir a login */}
          <Link
            to="/login"
            className="group relative w-full flex items-center justify-center font-black py-4 rounded-full transition-all active:scale-95 uppercase text-sm tracking-widest italic text-black"
            style={{
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 10px 25px var(--color-primary-glow)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-primary-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-primary)';
            }}
          >
            <span>{t.auth.backToLogin}</span>
            <span className="ml-2 font-bold group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {/* Botón reenviar correo */}
          {email && (
            <button
              type="button"
              disabled={resending}
              onClick={handleResendEmail}
              className="w-full py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? t.auth.resendingEmail : t.auth.resendEmail}
            </button>
          )}
        </div>

        {/* Enlace volver al inicio */}
        <div className="mt-8 pt-4 border-t border-white/5">
          <Link
            to="/"
            className="text-neutral-500 hover:text-neutral-300 text-[11px] uppercase font-bold tracking-[0.2em] transition-colors"
          >
            ← {t.auth.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
