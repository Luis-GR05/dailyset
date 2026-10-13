// Lógica COMPARTIDA web/app (se copia a dailyset-app con scripts/sincronizar-web.mjs).
// Exportación RGPD de todos los datos del usuario en CSV.
import type { User } from '../context/AuthContext';
import type { Rutina } from '../context/RutinasContext';
import type { Sesion } from '../context/HistorialContext';

export function generarCSVDatosUsuario(user: User | null | undefined, rutinas: Rutina[], sesiones: Sesion[]): string {
  const lineas: string[] = [];

  // Cabecera informativa RGPD
  lineas.push('# DAILYSET - EXPORTACIÓN DE DATOS PERSONALES (RGPD / GDPR)');
  lineas.push(`# Fecha de exportación: ${new Date().toISOString()}`);
  lineas.push('');

  // 1. DATOS DE PERFIL
  lineas.push('# 1. DATOS DE PERFIL');
  lineas.push('ID,Nombre,NombreUsuario,Email,PesoKg,AlturaCm,Edad,Genero,NivelActividad,Objetivo,UnidadesKg');
  lineas.push(
    [
      `"${user?.id || ''}"`,
      `"${(user?.nombre || '').replace(/"/g, '""')}"`,
      `"${(user?.nombre_usuario || '').replace(/"/g, '""')}"`,
      `"${(user?.email || '').replace(/"/g, '""')}"`,
      user?.pesoKg ?? '',
      user?.alturaCm ?? '',
      user?.edad ?? '',
      `"${user?.genero || ''}"`,
      `"${user?.nivelActividad || ''}"`,
      `"${user?.objetivo || ''}"`,
      user?.unidadesKg ? 'kg' : 'lbs',
    ].join(',')
  );
  lineas.push('');

  // 2. RUTINAS
  lineas.push('# 2. RUTINAS CREADAS');
  lineas.push('ID,Nombre,Categoria,DuracionMinutos,EsPublica');
  rutinas.forEach(r => {
    lineas.push(
      [
        r.id,
        `"${(r.nombre || '').replace(/"/g, '""')}"`,
        `"${r.categoria || ''}"`,
        r.duracion || 0,
        r.is_public ? 'Si' : 'No',
      ].join(',')
    );
  });
  lineas.push('');

  // 3. HISTORIAL DE SESIONES Y SERIES DE ENTRENAMIENTO
  lineas.push('# 3. HISTORIAL DE SESIONES Y SERIES DE ENTRENAMIENTO');
  lineas.push('SesionID,Fecha,Rutina,DuracionMinutos,Puntuacion,Ejercicio,NumeroSerie,Kg,Reps,Completada');
  sesiones.forEach(s => {
    if (!s.ejercicios || s.ejercicios.length === 0) {
      lineas.push([s.id, s.fecha, `"${(s.rutina || '').replace(/"/g, '""')}"`, s.duracionMin || 0, s.puntuacion || '', '', '', '', '', ''].join(','));
    } else {
      s.ejercicios.forEach(ej => {
        if (!ej.series || ej.series.length === 0) {
          lineas.push([s.id, s.fecha, `"${(s.rutina || '').replace(/"/g, '""')}"`, s.duracionMin || 0, s.puntuacion || '', `"${(ej.nombre || '').replace(/"/g, '""')}"`, '', '', '', ''].join(','));
        } else {
          ej.series.forEach(sr => {
            lineas.push([
              s.id,
              s.fecha,
              `"${(s.rutina || '').replace(/"/g, '""')}"`,
              s.duracionMin || 0,
              s.puntuacion || '',
              `"${(ej.nombre || '').replace(/"/g, '""')}"`,
              sr.numero,
              sr.kg,
              sr.reps,
              sr.completada ? 'Si' : 'No',
            ].join(','));
          });
        }
      });
    }
  });
  return lineas.join('\n');
}
