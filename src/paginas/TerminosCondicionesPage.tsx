import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  HeartPulse, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  Globe, 
  Ban, 
  Mail 
} from 'lucide-react';
import { Logo } from '../componentes';
import { useI18n } from '../context/I18nContext';

export default function TerminosCondicionesPage() {
  const { locale, setLocale } = useI18n();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = locale === 'es' 
      ? 'Términos y Condiciones | DailySet' 
      : 'Terms and Conditions | DailySet';
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
            <Scale size={13} />
            <span>{es ? 'Marco Legal & Uso del Servicio' : 'Legal Terms of Service'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
            {es ? 'Términos y Condiciones' : 'Terms of Service'}
          </h1>
          <p className="text-sm text-neutral-400 font-mono">
            {es ? 'Última actualización: 21 de septiembre de 2026' : 'Last updated: September 21, 2026'}
          </p>
          <p className="text-base text-neutral-300 leading-relaxed max-w-3xl">
            {es 
              ? 'Te damos la bienvenida a DailySet. Estos Términos y Condiciones regulan el acceso y uso de la aplicación web y móvil de DailySet. Al registrarte o utilizar nuestros servicios, aceptas quedar vinculado por estas disposiciones.'
              : 'Welcome to DailySet. These Terms and Conditions govern your access and use of the DailySet web and mobile applications. By creating an account or using our platform, you agree to these binding terms.'}
          </p>
        </div>

        {/* Aviso de Salud y Responsabilidad Médica */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-black uppercase text-xs tracking-wider">
            <HeartPulse size={18} />
            <span>{es ? 'Exención de Responsabilidad Médica y Salud' : 'Health and Fitness Medical Disclaimer'}</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {es 
              ? 'DailySet es una herramienta digital para el registro de entrenamientos, rutinas y sobrecarga progresiva. La aplicación NO proporciona asesoramiento médico, diagnóstico ni sustituye a un profesional sanitario cualificado o entrenador certificado. El levantamiento de pesas y el ejercicio de alta intensidad conllevan riesgos físicos inherentes. Consulta con un médico antes de iniciar cualquier programa de entrenamiento exigente.'
              : 'DailySet is a performance logging and routine organization tool. The application DOES NOT provide medical advice, diagnosis, or substitute certified medical/coaching supervision. Heavy lifting and physical exercise carry inherent risks of injury. Always consult a physician before undertaking strenuous fitness programs.'}
          </p>
        </div>

        {/* Resumen de Pilares */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <UserCheck size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {es ? 'Cuentas Personales' : 'Personal Accounts'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {es ? 'Cada cuenta es única y personal. Eres responsable de la custodia de tus credenciales.' : 'Accounts are personal and non-transferable. You are responsible for keeping credentials safe.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
              <Ban size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {es ? 'Conducta Respetuosa' : 'Community Standards'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {es ? 'Prohibido el spam, contenido ofensivo o acoso en las funciones comunitarias y sociales.' : 'Spam, abuse, and harassment in social feeds and shared routines are strictly prohibited.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <FileText size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {es ? 'Propiedad Intelectual' : 'Intellectual Property'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {es ? 'DailySet es propiedad de sus desarrolladores. Tus registros de entrenamiento te pertenecen a ti.' : 'DailySet platform belongs to its creators. Your workout logs belong exclusively to you.'}
            </p>
          </div>
        </div>

        {/* Secciones detalladas */}
        <div className="space-y-10 text-neutral-300 text-sm leading-relaxed">
          {/* 1. Uso Aceptable */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">01.</span>
              {es ? 'Uso Aceptable del Servicio' : 'Permitted Use of the Platform'}
            </h2>
            <p>
              {es 
                ? 'El usuario se compromete a hacer un uso lícito, diligente y conforme a la legalidad vigente de todas las funciones de DailySet. Queda expresamente prohibido:'
                : 'Users agree to utilize DailySet legitimately and in full accordance with applicable laws. You agree NOT to:'}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400">
              <li>
                {es 
                  ? 'Intentar vulnerar, descompilar, realizar ingeniería inversa o atacar la infraestructura técnica de DailySet.' 
                  : 'Decompile, reverse-engineer, exploit, or attempt to compromise DailySet infrastructure.'}
              </li>
              <li>
                {es 
                  ? 'Compartir rutinas o perfiles públicos que contengan lenguaje de odio, discriminatorio, difamatorio o contenido ilícito.' 
                  : 'Publish public routines or profile bios with discriminatory, hateful, or abusive content.'}
              </li>
              <li>
                {es 
                  ? 'Automatizar accesos no autorizados mediante bots o scripts que degraden el rendimiento del servicio.' 
                  : 'Scrape or overwhelm platform endpoints with automated scripts, bots, or unauthorized crawlers.'}
              </li>
            </ul>
          </section>

          {/* 2. Cuentas y Seguridad */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">02.</span>
              {es ? 'Cuentas de Usuario y Seguridad' : 'User Accounts and Security'}
            </h2>
            <p>
              {es 
                ? 'Para acceder a las funciones de registro de entrenamientos debes crear una cuenta con un correo electrónico válido. Eres el único responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.'
                : 'To track training sessions and access historical metrics, you must register with a valid email. You are solely responsible for maintaining credentials confidentiality and monitoring account actions.'}
            </p>
            <p>
              {es 
                ? 'Nos reservamos el derecho de suspender o cancelar cuentas que incumplan de forma flagrante estos términos o que comprometan la seguridad de otros usuarios.'
                : 'We reserve the right to suspend or terminate accounts that breach these terms or compromise the integrity of our community.'}
            </p>
          </section>

          {/* 3. Propiedad Intelectual */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">03.</span>
              {es ? 'Propiedad Intelectual y Licencias' : 'Intellectual Property Rights'}
            </h2>
            <p>
              {es 
                ? 'Todos los elementos que forman parte de DailySet (código fuente, interfaces, diseños, gráficos, logotipos, marcas y algoritmos de sobrecarga) son propiedad exclusiva de DailySet o sus licenciantes, estando protegidos por la legislación de propiedad intelectual.'
                : 'All trademarks, logos, visual layouts, animations, proprietary overload algorithms, and source code belong to DailySet and its licensors, protected by international copyright laws.'}
            </p>
            <p>
              {es 
                ? 'Conservas en todo momento la titularidad sobre los datos personales y registros de entrenamiento que introduces en la plataforma. Nos otorgas una licencia mundial, no exclusiva y gratuita exclusivamente para almacenar, procesar y mostrar dicha información dentro del servicio.'
                : 'You retain full ownership of all training logs, sets, and notes you record. You grant DailySet a worldwide, non-exclusive license solely to process and display that data to provide the service.'}
            </p>
          </section>

          {/* 4. Disponibilidad del Servicio */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">04.</span>
              {es ? 'Disponibilidad y Modificaciones' : 'Service Availability and Updates'}
            </h2>
            <p>
              {es 
                ? 'Nos esforzamos por ofrecer la máxima disponibilidad continua del servicio. No obstante, el servicio puede experimentar interrupciones programadas por mantenimiento o actualizaciones. DailySet no garantiza un funcionamiento 100% ininterrumpido en todo momento, pero cuenta con persistencia local para permitir continuar entrenamientos ante fallos de conexión.'
                : 'While we aim for maximum uptime, temporary maintenance windows or network interruptions may occur. DailySet includes local offline persistence to safeguard active workout logs whenever connectivity fluctuates.'}
            </p>
          </section>

          {/* 5. Limitación de Responsabilidad */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">05.</span>
              {es ? 'Limitación de Responsabilidad' : 'Limitation of Liability'}
            </h2>
            <p>
              {es 
                ? 'En la máxima medida permitida por la ley aplicable, DailySet no será responsable de daños indirectos, incidentales, lesiones físicas resultantes de la práctica deportiva, o pérdida de datos fuera de nuestro control razonable.'
                : 'To the maximum extent permitted by law, DailySet shall not be liable for indirect damages, athletic injuries, or data disruptions outside of our reasonable control.'}
            </p>
          </section>

          {/* 6. Cancelación y Baja */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">06.</span>
              {es ? 'Cancelación y Baja de Cuenta' : 'Account Termination'}
            </h2>
            <p>
              {es 
                ? 'Puedes solicitar la baja de tu cuenta en cualquier instante desde el apartado de Perfil > Configuración de la aplicación. Al confirmar la baja, todos tus datos personales y entrenamientos se eliminarán de forma irreversible de nuestras bases de datos.'
                : 'You may close your account at any time through Profile > Settings. Upon deletion, your personal records and workouts are irreversibly wiped from production databases.'}
            </p>
          </section>

          {/* 7. Ley Aplicable y Jurisdicción */}
          <section className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
              <span className="text-[var(--color-primary)] font-mono">07.</span>
              {es ? 'Ley Aplicable y Jurisdicción' : 'Governing Law'}
            </h2>
            <p>
              {es 
                ? 'Estos términos se rigen e interpretan de conformidad con las leyes de España y la normativa de la Unión Europea. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes.'
                : 'These terms are governed by the laws of Spain and the European Union. Any disputes will be subject to the competent courts of Spain.'}
            </p>
          </section>

          {/* Contacto legal */}
          <section className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-black uppercase text-sm">
              <Mail size={16} className="text-[var(--color-primary)]" />
              <span>{es ? 'Consultas Legales' : 'Legal Inquiries'}</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {es 
                ? 'Para cualquier consulta sobre estos Términos y Condiciones, puedes contactarnos en legal@dailyset.app o soporte@dailyset.app.'
                : 'For any inquiries regarding these Terms of Service, please reach out to legal@dailyset.app.'}
            </p>
          </section>
        </div>

        {/* Footer navegación */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/privacidad"
            className="text-xs font-bold text-[var(--color-primary)] hover:underline uppercase tracking-wider"
          >
            {es ? '← Ver Política de Privacidad' : '← View Privacy Policy'}
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
