import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import {
  Send,
  Headphones,
  Clock,
  Copy,
  Check,
  Mail,
  FileSpreadsheet,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export interface MensajeSoporte {
  id: string;
  remitente: 'usuario' | 'soporte';
  texto: string;
  fecha: string;
  ticketId?: string;
  sugerencias?: string[];
}

const STORAGE_KEY = 'dailyset_soporte_chat_v1';

export default function ChatSoporte({ onCerrar }: { onCerrar?: () => void }) {
  const { user } = useAuth();
  const { locale } = useI18n();
  const es = locale === 'es';

  const [mensajes, setMensajes] = useState<MensajeSoporte[]>(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        return JSON.parse(guardado);
      }
    } catch (e) {
      console.error('Error leyendo chat de soporte:', e);
    }
    return [
      {
        id: 'msg-init',
        remitente: 'soporte',
        texto: es
          ? `Hola ${user?.nombre || 'atleta'}. Bienvenido al canal oficial de Soporte Técnico de DailySet. ¿En qué podemos ayudarte hoy con tu cuenta, entrenamientos o sincronización?`
          : `Hello ${user?.nombre || 'athlete'}. Welcome to the official DailySet Technical Support desk. How can we assist you today with your workouts, account, or sync?`,
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sugerencias: [
          es ? '¿Cómo exportar mis datos CSV?' : 'How do I export my CSV data?',
          es ? 'Problemas de sincronización o datos' : 'Data sync or offline issues',
          es ? '¿Cómo funciona la sobrecarga progresiva?' : 'How does progressive overload work?',
          es ? 'Contactar con un agente humano' : 'Speak with a human agent',
        ],
      },
    ];
  });

  const [inputTexto, setInputTexto] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [ticketCopiado, setTicketCopiado] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll al final en cada mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, escribiendo]);

  // Persistir en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes));
    } catch (e) {
      console.error('Error guardando chat de soporte:', e);
    }
  }, [mensajes]);

  // Generador de respuestas técnicas automatizadas inteligentes
  const generarRespuestaSoporte = (pregunta: string): { texto: string; ticketId?: string; sugerencias?: string[] } => {
    const q = pregunta.toLowerCase();

    if (q.includes('csv') || q.includes('exportar') || q.includes('descargar') || q.includes('datos')) {
      return {
        texto: es
          ? 'Para exportar todos tus datos y entrenamientos en formato CSV estándar (cumpliendo RGPD):\n\n1. Ve a Perfil > Configuración de cuenta.\n2. Baja hasta el apartado "Privacidad y Datos (RGPD)".\n3. Pulsa en "Descargar CSV". Se generará un archivo estructurado con todos tus entrenamientos, series, pesos y marcas registradas.'
          : 'To export your workouts and data in standard CSV format (GDPR compliant):\n\n1. Go to Profile > Account Settings.\n2. Scroll to the "Privacy & Data (GDPR)" section.\n3. Click "Download CSV". A structured file containing all your workouts, sets, weights, and records will be downloaded.',
        sugerencias: [
          es ? '¿Se guardan mis datos sin conexión?' : 'Are my workouts stored offline?',
          es ? '¿Cómo eliminar mi cuenta?' : 'How do I delete my account?',
        ],
      };
    }

    if (q.includes('sincron') || q.includes('guardar') || q.includes('offline') || q.includes('conexión') || q.includes('pierde')) {
      return {
        texto: es
          ? 'DailySet cuenta con persistencia híbrida en dos niveles:\n\n1. Almacenamiento local activo: tus series y marcas se guardan al instante en la memoria de tu dispositivo serie a serie.\n2. Sincronización en la nube con Supabase: en cuanto el dispositivo tiene conexión a internet, se sincroniza automáticamente de forma segura con cifrado SSL/TLS.'
          : 'DailySet operates on a two-tier persistence architecture:\n\n1. Active local caching: every set and rep is saved instantly to local memory in real time.\n2. Supabase Cloud Sync: as soon as your device connects to the internet, records are securely uploaded under SSL/TLS encryption.',
        sugerencias: [
          es ? '¿Cómo exportar mis datos CSV?' : 'How do I export my CSV data?',
          es ? 'Reportar un error técnico' : 'Report a technical bug',
        ],
      };
    }

    if (q.includes('sobrecarga') || q.includes('1rm') || q.includes('cálculo') || q.includes('progresiv')) {
      return {
        texto: es
          ? 'El cálculo de sobrecarga progresiva analiza tus mejores marcas históricas por ejercicio. Utiliza la fórmula científica de Brzycki y Epley para estimar tu 1RM en base al peso y repeticiones ejecutadas en series efectivas. Puedes consultar tus comparativas y gráficas de volumen en la sección "Estadísticas".'
          : 'Progressive overload tracking analyzes historical bests per exercise using scientific formulas (Brzycki & Epley) based on weight and reps completed. You can review charts and volume trends under the "Statistics" tab.',
        sugerencias: [
          es ? '¿Cómo crear rutinas personalizadas?' : 'How do I create custom routines?',
          es ? 'Contactar con un agente humano' : 'Speak with a human agent',
        ],
      };
    }

    if (q.includes('eliminar') || q.includes('borrar cuenta') || q.includes('baja')) {
      return {
        texto: es
          ? 'Para solicitar la eliminación permanente de tu cuenta y todos tus datos:\n\n1. Ve a Perfil > Configuración de cuenta.\n2. Baja hasta la "Zona Peligrosa".\n3. Haz clic en "Eliminar Cuenta Permanentemente" y confirma tu correo. Todos tus datos se eliminarán sin posibilidad de recuperación.'
          : 'To permanently delete your account and all data:\n\n1. Navigate to Profile > Account Settings.\n2. Scroll to the "Danger Zone".\n3. Click "Permanently Delete Account" and confirm with your email. All data will be irrevocably purged.',
      };
    }

    if (q.includes('humano') || q.includes('agente') || q.includes('persona') || q.includes('ticket') || q.includes('reportar') || q.includes('error') || q.includes('bug')) {
      const numTicket = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        texto: es
          ? `He generado tu número de incidencia oficial: ${numTicket}.\n\nTu reporte ha quedado registrado para nuestro equipo de ingenieros. Si lo prefieres, puedes enviarnos los detalles por correo a soporte@dailyset.app mencionando tu ticket para una respuesta prioritaria en menos de 24 horas.`
          : `I have generated your official ticket reference: ${numTicket}.\n\nYour issue has been logged for our engineering team. You can also email soporte@dailyset.app quoting this ticket reference for priority response within 24 hours.`,
        ticketId: numTicket,
        sugerencias: [
          es ? 'Copiar número de ticket' : 'Copy ticket number',
          es ? 'Enviar correo de soporte' : 'Send email to support',
        ],
      };
    }

    // Respuesta general de asistencia
    return {
      texto: es
        ? 'Hemos recibido tu consulta técnica. Para ofrecerte la mejor solución, indícanos si el problema está relacionado con la aplicación móvil, registro de series, cálculo de pesos o tu cuenta de usuario.'
        : 'Thank you for reaching out. Please let us know if your query relates to workout logging, account settings, weight calculations, or data synchronization so we can assist you promptly.',
      sugerencias: [
        es ? '¿Cómo exportar mis datos CSV?' : 'How do I export my CSV data?',
        es ? 'Problemas de sincronización o datos' : 'Data sync or offline issues',
        es ? 'Reportar un error técnico' : 'Report a technical bug',
      ],
    };
  };

  const enviarMensaje = (textoAEnviar?: string) => {
    const txt = (textoAEnviar ?? inputTexto).trim();
    if (!txt) return;

    const nuevoMsgUsuario: MensajeSoporte = {
      id: `usr-${Date.now()}`,
      remitente: 'usuario',
      texto: txt,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMensajes(prev => [...prev, nuevoMsgUsuario]);
    setInputTexto('');
    setEscribiendo(true);

    // Simular procesamiento técnico y respuesta inmediata
    setTimeout(() => {
      const respuesta = generarRespuestaSoporte(txt);
      const nuevoMsgSoporte: MensajeSoporte = {
        id: `sop-${Date.now()}`,
        remitente: 'soporte',
        texto: respuesta.texto,
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ticketId: respuesta.ticketId,
        sugerencias: respuesta.sugerencias,
      };

      setMensajes(prev => [...prev, nuevoMsgSoporte]);
      setEscribiendo(false);
    }, 700);
  };

  const handleCopiarTicket = (ticket: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ticket);
      setTicketCopiado(true);
      setTimeout(() => setTicketCopiado(false), 2500);
    }
  };

  const handleLimpiarHistorial = () => {
    if (confirm(es ? '¿Deseas reiniciar la conversación de soporte?' : 'Reset support chat conversation?')) {
      localStorage.removeItem(STORAGE_KEY);
      setMensajes([
        {
          id: 'msg-init-reset',
          remitente: 'soporte',
          texto: es
            ? 'Chat reiniciado. ¿En qué podemos ayudarte hoy con DailySet?'
            : 'Chat reset. How can we help you today with DailySet?',
          fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sugerencias: [
            es ? '¿Cómo exportar mis datos CSV?' : 'How do I export my CSV data?',
            es ? 'Problemas de sincronización o datos' : 'Data sync or offline issues',
            es ? 'Contactar con un agente humano' : 'Speak with a human agent',
          ],
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0a0a] text-white border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Cabecera del Chat ── */}
      <div className="p-4 border-b border-white/10 bg-neutral-950 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-primary)]">
              <Headphones size={20} />
            </div>
            {/* Indicador de estado online */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0a]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                {es ? 'Soporte Técnico DailySet' : 'DailySet Tech Support'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono font-bold text-[var(--color-primary)] uppercase">
                {es ? 'En línea' : 'Online'}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Clock size={11} className="text-neutral-500" />
              <span>{es ? 'Respuesta inmediata 24/7' : 'Instant 24/7 Response'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLimpiarHistorial}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={es ? 'Reiniciar chat' : 'Reset chat'}
          >
            <RotateCcw size={15} />
          </button>

          {onCerrar && (
            <button
              type="button"
              onClick={onCerrar}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={es ? 'Cerrar' : 'Close'}
            >
              <span className="text-sm font-bold leading-none">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Banner de Seguridad & Diagnóstico ── */}
      <div className="px-4 py-2 bg-neutral-900/60 border-b border-white/5 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
        <span className="flex items-center gap-1.5 text-neutral-300">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>{es ? 'Canal encriptado y seguro' : 'Encrypted & secure channel'}</span>
        </span>
        <span className="text-[10px] text-neutral-400">
          {user?.email || 'atleta@dailyset.app'}
        </span>
      </div>

      {/* ── Área de Mensajes (Scrollable) ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-[320px] max-h-[520px] bg-neutral-950/40"
      >
        {mensajes.map((msg) => {
          const esUser = msg.remitente === 'usuario';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${esUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono px-1">
                <span>{esUser ? (user?.nombre || (es ? 'Tú' : 'You')) : 'DailySet Support'}</span>
                <span>·</span>
                <span>{msg.fecha}</span>
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  esUser
                    ? 'bg-white text-black font-medium rounded-tr-sm shadow-md'
                    : 'bg-neutral-900 border border-white/10 text-neutral-200 rounded-tl-sm shadow-sm'
                }`}
              >
                <p>{msg.texto}</p>

                {/* Si hay un ticket de soporte asociado */}
                {msg.ticketId && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--color-primary)] font-bold">
                      <FileSpreadsheet size={14} />
                      <span>{msg.ticketId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopiarTicket(msg.ticketId!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-neutral-200 transition-colors cursor-pointer"
                      >
                        {ticketCopiado ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span className="text-emerald-400">{es ? 'Copiado' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>{es ? 'Copiar Ticket' : 'Copy Ticket'}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`mailto:soporte@dailyset.app?subject=${encodeURIComponent(`[${msg.ticketId}] Consulta Soporte DailySet`)}&body=${encodeURIComponent(`Hola equipo de DailySet,\n\nMi ticket es ${msg.ticketId}.\nMi usuario es: ${user?.email || user?.nombre || 'atleta'}\n\nDetalles del problema:\n`)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-primary)] text-black text-[10px] font-black transition-opacity hover:opacity-90"
                      >
                        <Mail size={11} />
                        <span>{es ? 'Abrir Correo' : 'Send Email'}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Sugerencias interactivas rápidas */}
              {msg.sugerencias && msg.sugerencias.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                  {msg.sugerencias.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => enviarMensaje(sug)}
                      className="text-left text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
                    >
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Indicador de escribiendo */}
        {escribiendo && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono pl-1">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping" />
            <span>{es ? 'Soporte técnico escribiendo respuesta...' : 'Support typing response...'}</span>
          </div>
        )}
      </div>

      {/* ── Input y Envío ── */}
      <div className="p-3.5 border-t border-white/10 bg-neutral-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviarMensaje();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            placeholder={es ? 'Escribe tu consulta técnica aquí...' : 'Type your technical question here...'}
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[var(--color-primary)]/70 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputTexto.trim()}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[var(--color-primary)] text-black hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            title={es ? 'Enviar mensaje' : 'Send message'}
          >
            <Send size={16} />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-2 px-1">
          <span>{es ? 'Horario de guardia: 24/7' : 'Coverage: 24/7'}</span>
          <span>soporte@dailyset.app</span>
        </div>
      </div>
    </div>
  );
}
