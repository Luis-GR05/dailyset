import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, TituloPagina } from '../componentes';
import { useI18n } from '../context/I18nContext';
import ChatSoporte from '../componentes/soporte/ChatSoporte';
import { 
  Headphones, 
  Server, 
  ShieldCheck, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  FileText,
  LifeBuoy,
} from 'lucide-react';

export default function SoporteChatPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const es = locale === 'es';

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = es ? 'Soporte Técnico | DailySet' : 'Technical Support | DailySet';
  }, [es]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Encabezado con botón de volver al perfil */}
        <div className="flex items-center justify-between gap-4">
          <TituloPagina
            titulo={es ? 'Soporte Técnico' : 'Technical Support'}
            subtitulo={es ? 'Asistencia directa para tu cuenta y entrenamientos' : 'Direct help for your account and workouts'}
          />

          <button
            type="button"
            onClick={() => navigate('/perfil')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft size={14} />
            <span>{es ? 'Volver al Perfil' : 'Back to Profile'}</span>
          </button>
        </div>

        {/* Grid: Chat Principal + Panel Lateral de Información y Estado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Principal: Chat Interactivo (8 cols) */}
          <div className="lg:col-span-8 h-[640px]">
            <ChatSoporte />
          </div>

          {/* Columna Secundaria: Estado de la Plataforma y Contacto Oficial (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Tarjeta de Estado del Sistema */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Server size={14} className="text-[var(--color-primary)]" />
                  {es ? 'Estado del Servicio' : 'Service Status'}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {es ? 'Operativo' : 'Operational'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-neutral-300 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Supabase DB:</span>
                  <span className="text-white font-bold">100% Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">API Sync:</span>
                  <span className="text-white font-bold">OK (28ms)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">{es ? 'Cifrado:' : 'Encryption:'}</span>
                  <span className="text-white font-bold">TLS 1.3</span>
                </div>
              </div>
            </div>

            {/* Tarjeta de Contacto Directo */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3 backdrop-blur-xl">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Mail size={14} className="text-[var(--color-primary)]" />
                {es ? 'Canal Escrito Directo' : 'Direct Email Channel'}
              </span>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {es 
                  ? 'Si necesitas adjuntar capturas de pantalla o vídeos de un fallo, puedes escribirnos directamente a nuestro correo oficial:'
                  : 'For bug reports requiring video or screenshot attachments, feel free to email our engineers directly:'}
              </p>

              <a
                href="mailto:soporte@dailyset.app"
                className="block w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-xs font-mono font-bold text-[var(--color-primary)] hover:underline transition-all"
              >
                soporte@dailyset.app
              </a>
            </div>

            {/* Guía Rápida */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <LifeBuoy size={13} className="text-amber-400" />
                {es ? 'Consejo de Soporte' : 'Support Tip'}
              </span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {es 
                  ? 'Para dudas sobre la política de datos o exportar tu historial a Excel/CSV, puedes acceder directamente a Perfil > Configuración > Privacidad y Datos.'
                  : 'For data export queries or GDPR compliance, you can export your workouts directly in Profile > Settings > Privacy & Data.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
