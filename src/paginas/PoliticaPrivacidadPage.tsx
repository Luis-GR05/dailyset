import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileSpreadsheet, 
  Mail, 
  ArrowLeft,
  Server,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { Logo } from '../componentes';
import { useI18n } from '../context/I18nContext';

export default function PoliticaPrivacidadPage() {
  const { locale, setLocale } = useI18n();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === 'es' 
      ? 'Política de Privacidad | DailySet' 
      : 'Privacy Policy | DailySet';
  }, [locale]);

  const es = locale === 'es';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 antialiased selection:bg-[var(--color-primary)] selection:text-black">
      {/* Header Superior */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <Logo size="sm" />
              <span className="font-black tracking-wider text-sm text-white uppercase hidden sm:inline-block">
                DailySet
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocale(es ? 'en' : 'es')}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/10 text-xs font-mono font-bold text-neutral-300 hover:text-white hover:border-white/20 transition-colors flex items-center gap-1.5"
              title={es ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe size={13} />
              <span className="uppercase">{es ? 'EN' : 'ES'}</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 text-xs font-bold transition-colors"
            >
              <ArrowLeft size={13} />
              <span>{es ? 'Inicio' : 'Home'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Encabezado Principal */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-mono font-bold uppercase tracking-wider">
            <Shield size={13} />
            <span>{es ? 'Protección de Datos & RGPD' : 'Data Protection & GDPR'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
            {es ? 'Política de Privacidad' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-neutral-400 font-mono">
            {es ? 'Última actualización: 21 de septiembre de 2026' : 'Last updated: September 21, 2026'}
          </p>
          <p className="text-base text-neutral-300 leading-relaxed max-w-3xl">
            {es 
              ? 'En DailySet nos comprometemos a garantizar la máxima confidencialidad, seguridad y transparencia en el tratamiento de tus datos personales, de acuerdo con el Reglamento General de Protección de Datos (RGPD UE 2016/679) y la Ley Orgánica de Protección de Datos (LOPDGDD 3/2018).'
              : 'At DailySet, we are committed to safeguarding your privacy with the highest standards of security and transparency, compliant with the General Data Protection Regulation (EU GDPR 2016/679) and applicable privacy regulations.'}
          </p>
        </div>

        {/* Resumen de Principios Clave */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
              <Lock size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {es ? 'Cifrado Total' : 'End-to-End Security'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {es ? 'Tus contraseñas y comunicaciones viajan siempre bajo HTTPS/TLS con cifrado robusto.' : 'All data transmissions are encrypted with strict HTTPS/TLS cryptographic protocols.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Eye size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {es ? 'Control Absoluto' : 'Total Ownership'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {es ? 'Tú decides qué rutinas son públicas o privadas. No vendemos tus datos a terceros.' : 'You control what is shared or private. We never monetize or sell personal workout data.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
              <FileSpreadsheet size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {es ? 'Portabilidad Libre' : 'Data Portability'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {es ? 'Exporta todos tus entrenamientos y series en archivo CSV descargable en cualquier momento.' : 'Download full exports of your workouts, sets, and personal records in CSV format anytime.'}
            </p>
          </div>
        </div>

        {/* Secciones detalladas */}
        <div className="space-y-10 text-neutral-300 text-sm leading-relaxed">
          {/* 1. Responsable */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">01.</span>
              {es ? 'Responsable del Tratamiento' : 'Data Controller'}
            </h2>
            <p>
              {es 
                ? 'El responsable del tratamiento de los datos recabados a través de la plataforma DailySet es el equipo de desarrollo y administración de DailySet:'
                : 'The data controller responsible for the processing of personal data on DailySet is:'}
            </p>
            <ul className="list-none space-y-1.5 pl-2 font-mono text-xs text-neutral-300">
              <li><strong className="text-white">{es ? 'Denominación:' : 'Entity:'}</strong> DailySet Training Systems</li>
              <li><strong className="text-white">{es ? 'Contacto de Privacidad:' : 'Privacy Contact:'}</strong> soporte@dailyset.app / legal@dailyset.app</li>
              <li><strong className="text-white">{es ? 'Ámbito de Aplicación:' : 'Jurisdiction:'}</strong> {es ? 'España / Unión Europea' : 'Spain / European Union'}</li>
            </ul>
          </section>

          {/* 2. Datos recopilados */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">02.</span>
              {es ? 'Datos que Recopilamos' : 'Data We Collect'}
            </h2>
            <p>
              {es 
                ? 'Para prestar nuestro servicio de registro y análisis de entrenamientos de fuerza, tratamos las siguientes categorías de datos:'
                : 'To deliver fitness tracking and workout analysis, we collect the following categories of information:'}
            </p>
            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-white/5 space-y-1">
                <h4 className="text-xs font-bold text-white uppercase">{es ? 'Datos de Cuenta e Identificación' : 'Account & Identity Data'}</h4>
                <p className="text-xs text-neutral-400">
                  {es 
                    ? 'Correo electrónico, nombre de usuario, nombre visible, avatar o foto de perfil y credenciales de acceso seguras.'
                    : 'Email address, username, display name, avatar or profile picture, and hashed credentials.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-white/5 space-y-1">
                <h4 className="text-xs font-bold text-white uppercase">{es ? 'Datos de Rendimiento Físico y Entrenamiento' : 'Training & Performance Records'}</h4>
                <p className="text-xs text-neutral-400">
                  {es 
                    ? 'Ejercicios realizados, cargas (kg/lbs), repeticiones, series, tiempos de descanso, notas técnicas, cálculo estimado de 1RM, rutinas personalizadas e historial de sesiones.'
                    : 'Exercises performed, weights, reps, sets, rest times, workout notes, estimated 1RM calculations, routines, and session logs.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-white/5 space-y-1">
                <h4 className="text-xs font-bold text-white uppercase">{es ? 'Datos de Interacción Social (Opcionales)' : 'Social Features (Optional)'}</h4>
                <p className="text-xs text-neutral-400">
                  {es 
                    ? 'Seguimiento a otros usuarios, rutinas públicas compartidas por el usuario y comentarios o reacciones si están habilitadas.'
                    : 'User follows, publicly shared routines, and community interactions when explicitly enabled by you.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-white/5 space-y-1">
                <h4 className="text-xs font-bold text-white uppercase">{es ? 'Datos Técnicos y de Sesión' : 'Technical & Session Data'}</h4>
                <p className="text-xs text-neutral-400">
                  {es 
                    ? 'Tokens de autenticación en almacenamiento local (LocalStorage), preferencias de interfaz (idioma, tema) y registros de seguridad.'
                    : 'Authentication session tokens in local storage, interface preferences (language, theme), and operational telemetry.'}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Finalidad y Base Jurídica */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">03.</span>
              {es ? 'Finalidad y Base Jurídica del Tratamiento' : 'Purposes and Legal Basis'}
            </h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">{es ? 'Ejecución del servicio contractual:' : 'Service delivery:'}</strong>{' '}
                  {es 
                    ? 'Proveer la plataforma web y móvil para crear rutinas, guardar entrenamientos, calcular sobrecarga progresiva y mostrar métricas analíticas.'
                    : 'Providing the web and mobile platform to create routines, log workouts, calculate progressive overload, and display analytics.'}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">{es ? 'Consentimiento explícito:' : 'Explicit consent:'}</strong>{' '}
                  {es 
                    ? 'Para el registro de métricas biométricas de entrenamiento y la publicación opcional de rutinas en la sección social.'
                    : 'For recording fitness metrics and sharing optional routines in the public community directory.'}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">{es ? 'Interés legítimo y seguridad:' : 'Security & legitimate interests:'}</strong>{' '}
                  {es 
                    ? 'Garantizar la estabilidad técnica del sistema, prevenir accesos fraudulentos o abusos y proteger la integridad de las cuentas.'
                    : 'Securing user authentication, preventing fraudulent access, and ensuring system performance and integrity.'}
                </p>
              </div>
            </div>
          </section>

          {/* 4. Proveedores y Almacenamiento */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">04.</span>
              {es ? 'Infraestructura y Destinatarios de los Datos' : 'Infrastructure and Service Providers'}
            </h2>
            <p>
              {es 
                ? 'DailySet aloja su infraestructura con proveedores tecnológicos de primer nivel bajo rigurosos acuerdos de tratamiento de datos (DPA):'
                : 'DailySet relies on enterprise cloud infrastructure operating under strict Data Processing Agreements (DPA):'}
            </p>
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                <Server size={14} className="text-[var(--color-primary)]" />
                <span>Supabase Inc. (PostgreSQL & Authentication)</span>
              </div>
              <p className="text-xs text-neutral-400">
                {es 
                  ? 'Base de datos protegida con Row Level Security (RLS), aislamiento estricto por usuario y centros de datos con certificación ISO 27001 y SOC 2.'
                  : 'Database secured by PostgreSQL Row Level Security (RLS), user isolation, and SOC 2 / ISO 27001 compliant cloud infrastructure.'}
              </p>
            </div>
          </section>

          {/* 5. Tus Derechos */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">05.</span>
              {es ? 'Tus Derechos RGPD' : 'Your GDPR Rights'}
            </h2>
            <p>
              {es 
                ? 'Como usuario, tienes derecho a ejercer en cualquier momento:'
                : 'You are entitled to exercise your data rights at any time:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-neutral-900/30 border border-white/5">
                <strong className="text-white text-xs block uppercase mb-1">{es ? 'Acceso & Rectificación' : 'Access & Correction'}</strong>
                <p className="text-xs text-neutral-400">
                  {es ? 'Consulta y edita tus datos de perfil en cualquier momento desde los ajustes de la app.' : 'View and update your personal information directly within your profile settings.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/30 border border-white/5">
                <strong className="text-white text-xs block uppercase mb-1">{es ? 'Portabilidad (CSV)' : 'Data Portability (CSV)'}</strong>
                <p className="text-xs text-neutral-400">
                  {es ? 'Descarga tu archivo CSV completo con todos tus entrenamientos desde Perfil > Configuración.' : 'Export your complete workout logs and sets anytime in standard CSV format.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/30 border border-white/5">
                <strong className="text-white text-xs block uppercase mb-1">{es ? 'Supresión / Cancelación' : 'Erasure / Account Deletion'}</strong>
                <p className="text-xs text-neutral-400">
                  {es ? 'Puedes eliminar tu cuenta y todos tus datos asociados de forma permanente con un solo clic.' : 'Permanently remove your account and all associated data with a single button.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/30 border border-white/5">
                <strong className="text-white text-xs block uppercase mb-1">{es ? 'Oposición & Revocación' : 'Objection & Revocation'}</strong>
                <p className="text-xs text-neutral-400">
                  {es ? 'Cambia la privacidad de tus rutinas a privada en cualquier momento.' : 'Switch your routine visibility from public to private whenever you wish.'}
                </p>
              </div>
            </div>
          </section>

          {/* 6. Cookies y Almacenamiento Local */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">06.</span>
              {es ? 'Cookies y Almacenamiento Local' : 'Cookies and Local Storage'}
            </h2>
            <p>
              {es 
                ? 'DailySet utiliza únicamente tecnologías técnicas estrictamente necesarias para el funcionamiento de la aplicación:'
                : 'DailySet relies strictly on essential technical storage mechanisms needed to run the app:'}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400">
              <li>
                <strong className="text-neutral-200">{es ? 'LocalStorage / Sesión:' : 'LocalStorage / Session:'}</strong>{' '}
                {es 
                  ? 'Guarda tu token de sesión autenticada para mantenerte conectado de forma segura y tus preferencias de interfaz.'
                  : 'Maintains authenticated tokens for secure sign-in and local UI preferences (locale, theme).'}
              </li>
              <li>
                <strong className="text-neutral-200">{es ? 'Sin rastreadores publicitarios:' : 'No third-party ad trackers:'}</strong>{' '}
                {es 
                  ? 'No incluimos cookies publicitarias de terceros ni redes de seguimiento invasivas.'
                  : 'We do not embed third-party advertising cookies or cross-site behavioral tracking scripts.'}
              </li>
            </ul>
          </section>

          {/* 7. Contacto */}
          <section className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-black uppercase text-sm">
              <Mail size={16} className="text-[var(--color-primary)]" />
              <span>{es ? 'Contacto y Dudas de Privacidad' : 'Contact Our Privacy Team'}</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {es 
                ? 'Si deseas ejercer tus derechos de acceso, rectificación, supresión o tienes cualquier duda sobre cómo tratamos tu información, escríbenos a soporte@dailyset.app.'
                : 'If you have any questions regarding this policy or wish to exercise your rights, please reach out to soporte@dailyset.app.'}
            </p>
          </section>
        </div>

        {/* Footer navegación */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/terminos"
            className="text-xs font-bold text-[var(--color-primary)] hover:underline uppercase tracking-wider"
          >
            {es ? 'Ver Términos y Condiciones →' : 'View Terms and Conditions →'}
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-colors"
          >
            {es ? 'Volver al Inicio' : 'Return to Home'}
          </Link>
        </div>
      </main>
    </div>
  );
}
