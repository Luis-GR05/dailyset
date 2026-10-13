// Lógica COMPARTIDA web/app (se copia a dailyset-app con scripts/sincronizar-web.mjs).
import { supabase } from './supabaseClient';

/** Borra todos los datos del usuario (RGPD art. 17): social, series, sesiones, rutinas y perfil. */
export async function eliminarDatosCuenta(userId: string) {
  await supabase.from('social_seguidores').delete().or(`seguidor_id.eq.${userId},seguido_id.eq.${userId}`);
  
  const { data: userSessions } = await supabase
    .from('sesiones_entrenamiento')
    .select('id')
    .eq('usuario_id', userId);
  
  if (userSessions && userSessions.length > 0) {
    const sessionIds = userSessions.map(s => s.id);
    await supabase.from('series').delete().in('sesion_id', sessionIds);
  }

  await supabase.from('sesiones_entrenamiento').delete().eq('usuario_id', userId);
  await supabase.from('rutinas').delete().eq('usuario_id', userId);
  await supabase.from('perfiles').delete().eq('id', userId);
}
