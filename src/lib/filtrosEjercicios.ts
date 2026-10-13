// Lógica COMPARTIDA web/app (se copia a dailyset-app con scripts/sincronizar-web.mjs).
import type { Ejercicio } from '../context/EjerciciosContext';

export const FILTROS_MUSCULARES = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio'];

/** ¿El ejercicio pertenece al grupo muscular del chip de filtro? ('Todos' → siempre). */
export function coincideFiltroMuscular(e: Pick<Ejercicio, 'grupo' | 'categoriaEjercicio' | 'musculosPrimarios' | 'musculosSecundarios' | 'nombre'>, filtro: string): boolean {
    if (filtro === 'Todos') return true;

    const allM = [
        e.grupo ?? '',
        e.categoriaEjercicio ?? '',
        ...(e.musculosPrimarios ?? []),
        ...(e.musculosSecundarios ?? []),
        e.nombre,
    ].join(' ').toLowerCase();

    switch (filtro) {
        case 'Pecho':
            return allM.includes('pecho') || allM.includes('chest') || allM.includes('pectoral');
        case 'Espalda':
            return allM.includes('espalda') || allM.includes('back') || allM.includes('dorsal') || allM.includes('lat') || allM.includes('trapecio');
        case 'Piernas':
            return allM.includes('pierna') || allM.includes('leg') || allM.includes('quad') || allM.includes('cuádricep') || allM.includes('glúteo') || allM.includes('glute') || allM.includes('femoral') || allM.includes('isquio') || allM.includes('gemelo') || allM.includes('calf');
        case 'Hombros':
            return allM.includes('hombro') || allM.includes('shoulder') || allM.includes('deltoid');
        case 'Brazos':
            return allM.includes('brazo') || allM.includes('arm') || allM.includes('bicep') || allM.includes('bícep') || allM.includes('tricep') || allM.includes('trícep') || allM.includes('antebrazo');
        case 'Core':
            return allM.includes('core') || allM.includes('abs') || allM.includes('abdom') || allM.includes('oblicuo') || allM.includes('lumbar');
        case 'Cardio':
            return allM.includes('cardio') || allM.includes('plyometric') || allM.includes('salto') || allM.includes('jump') || allM.includes('burpee') || allM.includes('hiit');
        default:
            return true;
    }
}
