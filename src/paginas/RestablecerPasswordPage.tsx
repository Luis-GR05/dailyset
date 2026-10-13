// src/paginas/RestablecerPasswordPage.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight, UserCheck } from 'lucide-react';
import { Logo } from '../componentes';
import DotGrid from '../componentes/FondoAnimado';
import { supabase } from '../lib/supabaseClient';
import { useI18n } from '../context/I18nContext';
import { traducirErrorAuth } from '../lib/recuperacionPassword';
import { useTextos } from '../hooks/useTextos';
import { textosRestablecerPassword } from '../data/textos/restablecerPassword';

export default function RestablecerPasswordPage() {
  const { locale } = useI18n();
  const txRestablecerPassword = useTextos(textosRestablecerPassword);
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [verificandoEnlace, setVerificandoEnlace] = useState(true);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [enlaceInvalido, setEnlaceInvalido] = useState(false);
  const [cuentaEmail, setCuentaEmail] = useState<string>('');

  const enviandoRef = useRef(false);

  useEffect(() => {
    document.title = txRestablecerPassword.restablecerContrasenaDailyset;

    const inicializarSesionRecuperacion = async () => {
      try {
        const hash = window.location.hash;
        const search = window.location.search;
        const urlParams = new URLSearchParams(search);
        const code = urlParams.get('code');
        const errorDescription = urlParams.get('error_description') || '';

        // Comprobar errores explícitos devueltos por el proveedor de autenticación
        if (
          hash.includes('error=access_denied') ||
          hash.includes('otp_expired') ||
          errorDescription.includes('expired') ||
          hash.includes('error_code=403')
        ) {
          setEnlaceInvalido(true);
          setVerificandoEnlace(false);
          return;
        }

        // Si viene con código PKCE (?code=...), intercambiarlo por sesión activa
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Error al intercambiar código PKCE:', exchangeError);
            setEnlaceInvalido(true);
            setVerificandoEnlace(false);
            return;
          }
          if (data?.user?.email) {
            setCuentaEmail(data.user.email);
          }
          // Limpiar parámetros de la URL para que quede limpia
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Verificar sesión actual (sea por intercambio de código o por token en hash)
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.email) {
          setCuentaEmail(sessionData.session.user.email);
          setEnlaceInvalido(false);
          setVerificandoEnlace(false);
          return;
        }

        // Si aún no hay sesión, escuchar eventos de recuperación
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            if (session?.user?.email) {
              setCuentaEmail(session.user.email);
            }
            setEnlaceInvalido(false);
            setVerificandoEnlace(false);
          }
        });

        // Margen de espera para parsing asíncrono
        setTimeout(async () => {
          const { data: checkSession } = await supabase.auth.getSession();
          if (checkSession?.session?.user?.email) {
            setCuentaEmail(checkSession.session.user.email);
            setEnlaceInvalido(false);
          } else {
            // Si después del tiempo no hay sesión ni tokens válidos
            const currentHash = window.location.hash;
            if (!currentHash.includes('access_token')) {
              setEnlaceInvalido(true);
            }
          }
          setVerificandoEnlace(false);
        }, 1200);

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error inicializando sesión de recuperación:', err);
        setEnlaceInvalido(true);
        setVerificandoEnlace(false);
      }
    };

    inicializarSesionRecuperacion();
  }, [locale]);

  const handleRestablecer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviandoRef.current || cargando) return;

    setError('');

    const cleanPass = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (cleanPass.length < 6) {
      setError(txRestablecerPassword.laContrasenaDebeTenerAl);
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setError(txRestablecerPassword.lasContrasenasNoCoincidenAsegurate);
      return;
    }

    enviandoRef.current = true;
    setCargando(true);

    try {
      // 1. Intentar actualizar contraseña en Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: cleanPass,
      });

      if (updateError) {
        const msg = updateError.message || '';
        const msgLower = msg.toLowerCase();
        const code = (updateError as any).code || '';

        // Si Supabase devuelve 'same_password', significa que la clave ingresada
        // YA es la contraseña activa de la cuenta (porque ya se actualizó en la primera
        // petición o coincide con la existente). La cuenta ya está lista con esta clave.
        const isSamePassword =
          code === 'same_password' ||
          msgLower.includes('different from the old password') ||
          msgLower.includes('same as the old password') ||
          msgLower.includes('should be different');

        if (isSamePassword) {
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.debug('Error cerrando sesión tras misma clave:', e);
          }
          setExito(true);
          return;
        }

        // Si la sesión expiró o es inválida
        if (
          msgLower.includes('auth session missing') ||
          msgLower.includes('jwt expired') ||
          msgLower.includes('session not found')
        ) {
          setEnlaceInvalido(true);
          return;
        }

        throw updateError;
      }

      // Éxito: cerrar sesión de recuperación para que el usuario inicie limpiamente
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.debug('Error cerrando sesión post actualización:', e);
      }

      setExito(true);
    } catch (err: any) {
      console.error('Error al actualizar contraseña:', err);
      const msg = err?.message || '';
      const msgLower = msg.toLowerCase();
      const code = err?.code || '';

      const isSamePassword =
        code === 'same_password' ||
        msgLower.includes('different from the old password') ||
        msgLower.includes('same as the old password') ||
        msgLower.includes('should be different');

      if (isSamePassword) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.debug('Error cerrando sesión tras error same_password:', e);
        }
        setExito(true);
        return;
      }

      if (
        msgLower.includes('auth session missing') ||
        msgLower.includes('jwt expired') ||
        msgLower.includes('session not found')
      ) {
        setEnlaceInvalido(true);
      } else {
        const mensajeTraducido = traducirErrorAuth(msg, locale);
        setError(mensajeTraducido);
      }
    } finally {
      setCargando(false);
      enviandoRef.current = false;
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

        {verificandoEnlace ? (
          /* Estado de Carga / Verificando Enlace */
          <div className="py-12 space-y-4">
            <Loader2 size={36} className="animate-spin mx-auto text-[var(--color-primary)]" />
            <p className="text-xs sm:text-sm text-neutral-400">
              {txRestablecerPassword.verificandoEnlaceDeSeguridad}
            </p>
          </div>
        ) : exito ? (
          /* Estado de Éxito */
          <div className="space-y-6 animate-fade-in">
            <div
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#000000',
                boxShadow: '0 0 35px var(--color-primary-glow)',
              }}
            >
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tight">
                {txRestablecerPassword.contrasenaActualizada}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {txRestablecerPassword.tuContrasenaHaSidoRestablecida}
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() =>
                  navigate('/login', {
                    state: { email: cuentaEmail, passwordUpdated: true },
                  })
                }
                className="w-full py-4 px-6 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 0 30px var(--color-primary-glow)',
                }}
              >
                <span>{txRestablecerPassword.iniciarSesion}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : enlaceInvalido ? (
          /* Estado de Enlace Caducado / Inválido */
          <div className="space-y-6 animate-fade-in">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle size={40} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
                {txRestablecerPassword.enlaceCaducadoOInvalido}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {txRestablecerPassword.elEnlaceDeRecuperacionYa}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/recuperar-password"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider text-black transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  boxShadow: '0 0 25px var(--color-primary-glow)',
                }}
              >
                <span>
                  {txRestablecerPassword.solicitarNuevoEnlace}
                </span>
              </Link>

              <Link
                to="/login"
                className="inline-block text-xs font-bold text-neutral-400 hover:text-white transition-colors"
              >
                {txRestablecerPassword.volverAIniciarSesion}
              </Link>
            </div>
          </div>
        ) : (
          /* Formulario de Nueva Contraseña */
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tight">
                {txRestablecerPassword.nuevaContrasena}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {txRestablecerPassword.introduceTuNuevaClaveDe}
              </p>
              {cuentaEmail && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
                  <UserCheck size={13} className="text-[var(--color-primary)]" />
                  <span>
                    {txRestablecerPassword.cuenta}{' '}
                    <strong className="text-white font-mono">{cuentaEmail}</strong>
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleRestablecer} className="space-y-4 text-left">
              {/* Nueva contraseña */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-4 block"
                >
                  {txRestablecerPassword.nuevaContrasena2}
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={cargando}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-12 pr-12 text-white placeholder-neutral-600 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-4 block"
                >
                  {txRestablecerPassword.confirmarNuevaContrasena}
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={cargando}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-12 pr-12 text-white placeholder-neutral-600 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Mensaje de error en español */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400 animate-shake">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={cargando || !password || !confirmPassword}
                  className="w-full py-4 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: '0 0 30px var(--color-primary-glow)',
                  }}
                >
                  {cargando ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{txRestablecerPassword.actualizando}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {txRestablecerPassword.guardarNuevaContrasena}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-neutral-400 hover:text-white transition-colors"
              >
                {txRestablecerPassword.volverAIniciarSesion}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
