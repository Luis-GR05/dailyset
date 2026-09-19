import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../componentes';
import DotGrid from '../componentes/FondoAnimado';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';

export default function RegistroPage() {
  const { t, locale } = useI18n();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(locale === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError(locale === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { requiresEmailConfirmation } = await register(email, password, nombre);

      if (requiresEmailConfirmation) {
        navigate('/registro-confirmacion', { state: { email } });
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('rate limit')) {
        setError(
          locale === 'es'
            ? 'Límite de correos de Supabase superado (máx. 3-4/hora). Espera unos minutos o desactiva "Confirm email" en el panel de Supabase para registro instantáneo.'
            : 'Supabase email rate limit reached. Please wait a few minutes or disable "Confirm email" in Supabase.'
        );
      } else if (msg.includes('already registered') || msg.includes('user_already_exists') || msg.includes('already exists')) {
        setError(t.auth.alreadyRegisteredDesc);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError(
          locale === 'es'
            ? 'Error al crear la cuenta. Por favor, inténtalo de nuevo.'
            : 'Error creating account. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ visible }: { visible: boolean }) => visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-[#0a0a0a]">

      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotGrid
          dotSize={4} gap={20} baseColor="#271E37" activeColor="#5227FF"
          proximity={120} shockRadius={250} shockStrength={5}
          resistance={750} returnDuration={1.5}
        />
      </div>

      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 20% 50%, #5227FF 0%, transparent 50%)' }}>
      </div>

      <div className="relative z-10 flex w-full min-h-screen">

        {/* Panel izquierdo decorativo */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 relative">

          <div className="absolute top-1/4 translate-y-[-100px] flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md animate-bounce-slow">
            <div className="flex -space-x-2">
              {[
                '/avatars/avatar1.jpg',
                '/avatars/avatar2.jpg',
                '/avatars/avatar3.jpg',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Atleta ${i + 1}`}
                  className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
              {locale === 'es' ? '+10K Atletas' : '+10K Athletes'}
            </span>
          </div>

          <div className="text-center group">
            <Logo size="xl" className="transition-transform duration-500 group-hover:scale-105" />
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent"></div>
              <p className="font-black tracking-[0.4em] text-xs uppercase italic"
                style={{ color: 'var(--color-primary)' }}>
                {locale === 'es' ? 'Domina tu progreso' : 'Master your progress'}
              </p>
              <div className="h-[1px] w-8"></div>
            </div>
          </div>

          <div className="absolute bottom-1/4 translate-y-[100px] grid grid-cols-2 gap-8 text-center border-t border-white/5 pt-8 w-64">
            <div>
              <p className="text-white font-black text-xl italic">100%</p>
              <p className="text-neutral-500 text-[9px] uppercase tracking-tighter">
                {locale === 'es' ? 'Enfoque' : 'Focus'}
              </p>
            </div>
            <div>
              <p className="font-black text-xl italic" style={{ color: 'var(--color-primary)' }}>∞</p>
              <p className="text-neutral-500 text-[9px] uppercase tracking-tighter">
                {locale === 'es' ? 'Consistencia' : 'Consistency'}
              </p>
            </div>
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-2xl rounded-[40px] p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white mb-2 italic uppercase">{t.auth.register.toUpperCase()}</h2>
              <div className="h-1 w-12 mx-auto rounded-full mb-4"
                style={{ backgroundColor: 'var(--color-primary)' }}></div>
              <p className="text-neutral-400 text-sm italic">
                {locale === 'es' ? 'Empieza a trackear tus sets hoy mismo' : 'Start tracking your sets today'}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>

              {/* Nombre */}
              <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
                  {locale === 'es' ? 'Nombre' : 'Name'}
                </span>
                <input
                  type="text"
                  placeholder={locale === 'es' ? 'Tu nombre' : 'Your name'}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-neutral-600 text-sm font-medium outline-none focus:border-white/20 transition-all disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
                  {t.auth.email}
                </span>
                <input
                  type="email"
                  placeholder="atleta@dailyset.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-neutral-600 text-sm font-medium outline-none focus:border-white/20 transition-all disabled:opacity-50"
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
                  {t.auth.password}
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 pr-12 text-white placeholder-neutral-600 text-sm font-medium outline-none focus:border-white/20 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2 pb-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
                  {locale === 'es' ? 'Confirmar contraseña' : 'Confirm password'}
                </span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 pr-12 text-white placeholder-neutral-600 text-sm font-medium outline-none focus:border-white/20 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 text-center space-y-2">
                  <p className="text-red-400 text-xs font-semibold leading-relaxed">{error}</p>
                  {(error.includes('registrado') || error.includes('registered')) && (
                    <div className="flex items-center justify-center gap-4 pt-1 text-xs">
                      <Link to="/login" className="font-bold underline text-white hover:text-white/80 transition-colors">
                        {t.auth.signIn}
                      </Link>
                      <span className="text-neutral-500">·</span>
                      <Link to="/registro-confirmacion" state={{ email }} className="font-bold underline text-neutral-300 hover:text-white transition-colors">
                        {t.auth.confirmEmailTitle}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden font-black py-4 rounded-full transition-all hover:pr-8 active:scale-95 uppercase text-sm tracking-widest italic text-black disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: '0 15px 30px var(--color-primary-glow)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)';
                  }}
                >
                  {loading ? (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {locale === 'es' ? 'Creando cuenta...' : 'Creating account...'}
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">{t.auth.register}</span>
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all font-bold">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-8 pt-4 border-t border-white/5">
              <p className="text-neutral-500 text-sm">
                {t.auth.hasAccount}{' '}
                <Link
                  to="/login"
                  className="font-black transition-colors ml-1 uppercase text-xs tracking-wider"
                  style={{ color: 'var(--color-accent)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
                  }}
                >
                  {t.auth.signIn}
                </Link>
              </p>
            </div>

            <div className="text-center mt-6">
              <Link
                to="/"
                className="text-neutral-600 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = '';
                }}
              >
                ← {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}} />
    </div>
  );
}
