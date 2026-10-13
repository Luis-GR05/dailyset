// Lógica COMPARTIDA web/app (se copia a dailyset-app con scripts/sincronizar-web.mjs).
// Respuestas automáticas del chat de soporte técnico.

export interface MensajeSoporte {
  id: string;
  remitente: 'usuario' | 'soporte';
  texto: string;
  fecha: string;
  ticketId?: string;
  sugerencias?: string[];
}

export const STORAGE_KEY = 'dailyset_soporte_chat_v1';

// Generador de respuestas técnicas automatizadas inteligentes
export function generarRespuestaSoporte(pregunta: string, es: boolean): { texto: string; ticketId?: string; sugerencias?: string[] } {
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
        ? `He generado tu número de incidencia oficial: ${numTicket}.\n\nTu reporte ha quedado registrado para nuestro equipo de ingenieros. Si lo prefieres, puedes enviarnos los detalles por correo a Info.DailySet@protonmail.com mencionando tu ticket para una respuesta prioritaria en menos de 24 horas.`
        : `I have generated your official ticket reference: ${numTicket}.\n\nYour issue has been logged for our engineering team. You can also email Info.DailySet@protonmail.com quoting this ticket reference for priority response within 24 hours.`,
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
}
