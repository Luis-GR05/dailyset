// src/data/textos/soporte.ts
// Textos de src/paginas/SoporteChatPage.tsx y de su espejo en la app (app/(app)/perfil/soporte.tsx).
// Compartido web ↔ app: edítalo en la web y ejecuta `npm run sync:web` en la app.
import { definirTextos } from '../../lib/textos';

export const textosSoporte = definirTextos(
  {
    soporteTecnicoDailyset: 'Soporte Técnico | DailySet',
    soporteTecnico: 'Soporte Técnico',
    asistenciaDirectaParaTuCuenta: 'Asistencia directa para tu cuenta y entrenamientos',
    volverAlPerfil: 'Volver al Perfil',
    canalEscritoDirecto: 'Canal Escrito Directo',
    siNecesitasAdjuntarCapturasDe: 'Si necesitas adjuntar capturas de pantalla o vídeos de un fallo, puedes escribirnos directamente a nuestro correo oficial:',
    consejoDeSoporte: 'Consejo de Soporte',
    paraDudasSobreLaPolitica: 'Para dudas sobre la política de datos o exportar tu historial a Excel/CSV, puedes acceder directamente a Perfil > Configuración > Privacidad y Datos.',
  },
  {
    soporteTecnicoDailyset: 'Technical Support | DailySet',
    soporteTecnico: 'Technical Support',
    asistenciaDirectaParaTuCuenta: 'Direct help for your account and workouts',
    volverAlPerfil: 'Back to Profile',
    canalEscritoDirecto: 'Direct Email Channel',
    siNecesitasAdjuntarCapturasDe: 'For bug reports requiring video or screenshot attachments, feel free to email our engineers directly:',
    consejoDeSoporte: 'Support Tip',
    paraDudasSobreLaPolitica: 'For data export queries or GDPR compliance, you can export your workouts directly in Profile > Settings > Privacy & Data.',
  }
);
