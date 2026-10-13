// src/data/textos/restablecerPassword.ts
// Textos de src/paginas/RestablecerPasswordPage.tsx y de su espejo en la app (app/restablecer-password.tsx).
// Compartido web ↔ app: edítalo en la web y ejecuta `npm run sync:web` en la app.
import { definirTextos } from '../../lib/textos';

export const textosRestablecerPassword = definirTextos(
  {
    restablecerContrasenaDailyset: 'Restablecer Contraseña | DailySet',
    laContrasenaDebeTenerAl: 'La contraseña debe tener al menos 6 caracteres.',
    lasContrasenasNoCoincidenAsegurate: 'Las contraseñas no coinciden. Asegúrate de escribirlas idénticas.',
    verificandoEnlaceDeSeguridad: 'Verificando enlace de seguridad...',
    contrasenaActualizada: '¡Contraseña Actualizada!',
    tuContrasenaHaSidoRestablecida: 'Tu contraseña ha sido restablecida correctamente. Ya puedes acceder con tus nuevas credenciales.',
    iniciarSesion: 'Iniciar Sesión',
    enlaceCaducadoOInvalido: 'Enlace Caducado o Inválido',
    elEnlaceDeRecuperacionYa: 'El enlace de recuperación ya ha sido utilizado o ha superado el tiempo límite de seguridad. Solicita uno nuevo para continuar.',
    solicitarNuevoEnlace: 'Solicitar Nuevo Enlace',
    volverAIniciarSesion: 'Volver a Iniciar Sesión',
    nuevaContrasena: 'Nueva Contraseña',
    introduceTuNuevaClaveDe: 'Introduce tu nueva clave de acceso para tu cuenta de DailySet.',
    cuenta: 'Cuenta:',
    nuevaContrasena2: 'Nueva contraseña',
    confirmarNuevaContrasena: 'Confirmar nueva contraseña',
    actualizando: 'Actualizando...',
    guardarNuevaContrasena: 'Guardar Nueva Contraseña',
  },
  {
    restablecerContrasenaDailyset: 'Reset Password | DailySet',
    laContrasenaDebeTenerAl: 'Password must be at least 6 characters.',
    lasContrasenasNoCoincidenAsegurate: 'Passwords do not match.',
    verificandoEnlaceDeSeguridad: 'Verifying security link...',
    contrasenaActualizada: 'Password Updated!',
    tuContrasenaHaSidoRestablecida: 'Your password has been successfully reset. You can now sign in with your new credentials.',
    iniciarSesion: 'Sign In',
    enlaceCaducadoOInvalido: 'Expired or Invalid Link',
    elEnlaceDeRecuperacionYa: 'This password recovery link has already been used or has expired. Please request a new one.',
    solicitarNuevoEnlace: 'Request New Link',
    volverAIniciarSesion: 'Back to Sign In',
    nuevaContrasena: 'New Password',
    introduceTuNuevaClaveDe: 'Enter your new access password for your DailySet account.',
    cuenta: 'Account:',
    nuevaContrasena2: 'New password',
    confirmarNuevaContrasena: 'Confirm new password',
    actualizando: 'Updating...',
    guardarNuevaContrasena: 'Save New Password',
  }
);
