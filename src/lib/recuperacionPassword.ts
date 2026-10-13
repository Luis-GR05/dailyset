// src/lib/recuperacionPassword.ts
// Lógica compartida (web ↔ app) del restablecimiento de contraseña.

export function traducirErrorAuth(mensaje: string, locale: string): string {
  if (!mensaje) {
    return locale === 'es'
      ? 'Ha ocurrido un error al actualizar la contraseña.'
      : 'An error occurred while updating the password.';
  }

  const m = mensaje.toLowerCase();

  if (
    m.includes('different from the old password') ||
    m.includes('same as the old password') ||
    m.includes('should be different')
  ) {
    return locale === 'es'
      ? 'La nueva contraseña debe ser diferente a tu contraseña anterior. Por favor, elige una clave distinta que no hayas utilizado previamente en esta cuenta.'
      : 'The new password must be different from your old password. Please choose a different password.';
  }

  if (m.includes('at least 6') || m.includes('minimum 6') || m.includes('least 6 characters')) {
    return locale === 'es'
      ? 'La contraseña debe tener al menos 6 caracteres.'
      : 'Password must be at least 6 characters.';
  }

  if (m.includes('passwords do not match') || m.includes('no coinciden')) {
    return locale === 'es'
      ? 'Las contraseñas no coinciden. Asegúrate de escribirlas idénticas.'
      : 'Passwords do not match.';
  }

  if (
    m.includes('auth session missing') ||
    m.includes('session not found') ||
    m.includes('not authenticated') ||
    m.includes('jwt expired') ||
    m.includes('token has expired') ||
    m.includes('otp_expired') ||
    m.includes('access_denied')
  ) {
    return locale === 'es'
      ? 'El enlace de recuperación ha caducado o ya ha sido utilizado. Por favor, solicita un nuevo enlace.'
      : 'The recovery link has expired or has already been used. Please request a new one.';
  }

  if (m.includes('rate limit') || m.includes('too many requests')) {
    return locale === 'es'
      ? 'Demasiadas solicitudes en poco tiempo. Por favor, espera unos minutos antes de volver a intentarlo.'
      : 'Too many requests. Please wait a few minutes before trying again.';
  }

  if (m.includes('weak') || m.includes('pwned') || m.includes('compromised')) {
    return locale === 'es'
      ? 'La contraseña es demasiado débil o común. Añade letras mayúsculas, números o símbolos para hacerla más segura.'
      : 'Password is too weak or compromised. Please choose a stronger password.';
  }

  if (m.includes('network') || m.includes('failed to fetch')) {
    return locale === 'es'
      ? 'Error de conexión. Comprueba tu conexión a internet e inténtalo de nuevo.'
      : 'Connection error. Please check your internet connection.';
  }

  // Si no coincide con ninguno conocido, retornar mensaje en español amigable
  return locale === 'es'
    ? 'No se pudo actualizar la contraseña. Asegúrate de introducir una clave válida y diferente.'
    : mensaje;
}

/** Supabase devuelve este error si la clave nueva ya es la actual: la cuenta ya está lista. */
export function esMismaPassword(err: unknown): boolean {
  const e = err as { message?: string; code?: string } | null;
  const m = (e?.message || '').toLowerCase();
  return (
    e?.code === 'same_password' ||
    m.includes('different from the old password') ||
    m.includes('same as the old password') ||
    m.includes('should be different')
  );
}

/** Error que indica que el enlace de recuperación ya no sirve (sesión caducada o inexistente). */
export function esSesionRecuperacionInvalida(err: unknown): boolean {
  const m = ((err as { message?: string } | null)?.message || '').toLowerCase();
  return m.includes('auth session missing') || m.includes('jwt expired') || m.includes('session not found');
}

export interface DatosEnlaceRecuperacion {
  /** Código PKCE (?code=...) */
  code?: string;
  /** Tokens del flujo implícito (#access_token=...&refresh_token=...) */
  accessToken?: string;
  refreshToken?: string;
  /** El proveedor indicó que el enlace caducó o fue denegado */
  invalido: boolean;
}

/** Parser propio: URLSearchParams no está completo en React Native. */
function parsearParametros(texto: string): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const par of texto.split('&')) {
    if (!par) continue;
    const i = par.indexOf('=');
    const clave = decodeURIComponent((i >= 0 ? par.slice(0, i) : par).replace(/\+/g, ' '));
    const valor = decodeURIComponent((i >= 0 ? par.slice(i + 1) : '').replace(/\+/g, ' '));
    mapa.set(clave, valor);
  }
  return mapa;
}

/** Lee los parámetros que Supabase añade a la URL del correo de recuperación. */
export function leerEnlaceRecuperacion(url: string): DatosEnlaceRecuperacion {
  const iHash = url.indexOf('#');
  const hash = iHash >= 0 ? url.slice(iHash + 1) : '';
  const sinHash = iHash >= 0 ? url.slice(0, iHash) : url;
  const iQuery = sinHash.indexOf('?');
  const query = iQuery >= 0 ? sinHash.slice(iQuery + 1) : '';
  const q = parsearParametros(query);
  const h = parsearParametros(hash);
  const descripcionError = (q.get('error_description') || h.get('error_description') || '').toLowerCase();
  const invalido =
    h.get('error') === 'access_denied' ||
    q.get('error') === 'access_denied' ||
    hash.includes('otp_expired') ||
    hash.includes('error_code=403') ||
    descripcionError.includes('expired');
  return {
    code: q.get('code') || undefined,
    accessToken: h.get('access_token') || undefined,
    refreshToken: h.get('refresh_token') || undefined,
    invalido,
  };
}
