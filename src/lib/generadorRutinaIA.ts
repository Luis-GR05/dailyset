// Lógica COMPARTIDA web/app (se copia a dailyset-app con scripts/sincronizar-web.mjs).
// Generador de rutinas del asistente "Rutina con IA" de Mis Rutinas.
import type { Ejercicio } from '../context/EjerciciosContext';
import { RUTINAS_PREDEFINIDAS } from '../data/rutinasPredefinidas';

export interface WizardAnswers {
    objetivo: 'ganar_musculo' | 'perder_peso' | 'resistencia' | 'flexibilidad' | '';
    nivel: 'principiante' | 'intermedio' | 'avanzado' | '';
    dias: 2 | 3 | 4 | 5 | 0;
    duracion: 30 | 45 | 60 | 90 | 0;
    equipamiento: 'ninguno' | 'basico' | 'completo' | '';
    zona: 'completo' | 'superior' | 'inferior' | 'core' | '';
}
export interface EjercicioIA { id: number; nombre: string; grupo: string; series: number; reps: number; tiempo?: number; desc: string; }
export interface RutinaGeneradaIA { nombre: string; categoria: string; duracion: number; nivel: string; objetivo: string; zona: string; color: string; ejercicios: EjercicioIA[]; }

export function generarRutinaIA(answers: WizardAnswers, ejerciciosDB: Ejercicio[], locale: string): RutinaGeneradaIA | null {
    // Si todavía están cargando los ejercicios, usar los ejercicios verificados de las rutinas predefinidas
    const fallbackEjercicios: Ejercicio[] = RUTINAS_PREDEFINIDAS.flatMap(r => r.ejercicios.map(e => ({
        id: e.id,
        nombre: e.nombre,
        grupo: r.categoria,
        musculosPrimarios: [],
        musculosSecundarios: [],
        categoriaEjercicio: r.categoria.toLowerCase(),
        dificultad: r.nivel.toLowerCase(),
        descripcion: '',
        instruccionesPasos: [],
        esPublico: true,
    })));
    const pool = (ejerciciosDB && ejerciciosDB.length > 0) ? ejerciciosDB : fallbackEjercicios;
    if (!pool.length) return null;
    const catMap: Record<string, string[]> = {
        ganar_musculo: ['strength', 'fuerza'],
        perder_peso: ['strength', 'cardio', 'plyometrics', 'fuerza'],
        resistencia: ['cardio', 'plyometrics'],
        flexibilidad: ['stretching', 'flexibility', 'movilidad'],
    };
    const zonaMap: Record<string, string[]> = {
        completo: [],
        superior: ['chest', 'back', 'shoulder', 'bicep', 'tricep', 'deltoid', 'pectoral', 'espalda', 'hombro', 'pecho', 'lat'],
        inferior: ['leg', 'glute', 'quad', 'hamstring', 'calf', 'pierna', 'glúteo', 'cuádricep', 'isquio', 'gemelo'],
        core: ['abs', 'core', 'abdominal', 'abdominales', 'lumbar'],
    };
    const equipMap: Record<string, string[]> = {
        ninguno: ['body only', 'cuerpo', ''],
        basico: ['body only', 'dumbbell', 'barbell', 'mancuerna', 'barra', 'kettlebell', 'cable', ''],
        completo: [],
    };
    const numMap: Record<number, number> = { 30: 4, 45: 5, 60: 6, 90: 8 };
    const n = numMap[answers.duracion] ?? 5;
    const setsMap: Record<string, { series: number; reps: number; tiempo?: number; desc: string }> = {
        ganar_musculo: { series: 4, reps: 10, desc: '4 × 10 reps' },
        perder_peso: { series: 3, reps: 15, desc: '3 × 15 reps' },
        resistencia: { series: 3, reps: 20, desc: '3 × 20 reps' },
        flexibilidad: { series: 3, reps: 0, tiempo: 30, desc: '3 × 30 seg' },
    };
    const sr = setsMap[answers.objetivo] ?? { series: 3, reps: 12, desc: '3 × 12 reps' };
    function matches(e: Ejercicio, relaxLevel: number): boolean {
        if (relaxLevel < 2) {
            const cats = catMap[answers.objetivo] ?? [];
            if (cats.length > 0) { const ec = (e.categoriaEjercicio ?? '').toLowerCase(); if (!cats.some(c => ec.includes(c))) return false; }
        }
        const zonaKw = zonaMap[answers.zona] ?? [];
        if (zonaKw.length > 0) {
            const allM = [(e.grupo ?? ''), ...(e.musculosPrimarios ?? [])].join(' ').toLowerCase();
            if (!zonaKw.some(k => allM.includes(k))) return false;
        }
        if (answers.equipamiento !== 'completo') {
            const eqKw = equipMap[answers.equipamiento] ?? [];
            const eq = (e.equipamiento ?? '').toLowerCase();
            if (!eqKw.some(k => !k || eq.includes(k))) return false;
        }
        if (relaxLevel === 0 && answers.nivel) { if (e.dificultad?.toLowerCase() !== answers.nivel) return false; }
        return true;
    }
    // Deduplicar pool por ID para asegurar que no haya repetidos
    const uniquePool = Array.from(new Map(pool.map(e => [e.id, e])).values());
    let filtered: Ejercicio[] = [];
    for (let relax = 0; relax <= 3; relax++) {
        filtered = uniquePool.filter(e => matches(e, relax));
        if (filtered.length >= n) break;
    }
    if (filtered.length < n) filtered = [...uniquePool];
    const uniqueFiltered = Array.from(new Map(filtered.map(e => [e.id, e])).values());
    const selected = [...uniqueFiltered].sort(() => Math.random() - 0.5).slice(0, n);
    const lblObjetivo: Record<string,string> = { ganar_musculo: locale==='es'?'Ganar Músculo':'Build Muscle', perder_peso: locale==='es'?'Perder Peso':'Fat Loss', resistencia: locale==='es'?'Resistencia':'Endurance', flexibilidad: locale==='es'?'Flexibilidad':'Flexibility' };
    const lblZona: Record<string,string> = { completo: locale==='es'?'Cuerpo Completo':'Full Body', superior: locale==='es'?'Tren Superior':'Upper Body', inferior: locale==='es'?'Tren Inferior':'Lower Body', core: 'Core' };
    const lblNivel: Record<string,string> = { principiante: locale==='es'?'Principiante':'Beginner', intermedio: locale==='es'?'Intermedio':'Intermediate', avanzado: locale==='es'?'Avanzado':'Advanced' };
    const catRutina: Record<string,string> = { ganar_musculo:'Fuerza', perder_peso:'Cardio', resistencia:'Cardio', flexibilidad:'Movilidad' };
    const colorRutina: Record<string,string> = { ganar_musculo:'#DBF059', perder_peso:'#f59e0b', resistencia:'#4361EE', flexibilidad:'#34d399' };
    const zona = lblZona[answers.zona] ?? ''; const objetivo = lblObjetivo[answers.objetivo] ?? '';
    return {
        nombre: locale==='es'?`Rutina ${zona} · ${objetivo}`:`${zona} Routine · ${objetivo}`,
        categoria: catRutina[answers.objetivo] ?? 'Fuerza',
        duracion: answers.duracion, nivel: lblNivel[answers.nivel] ?? '', objetivo, zona,
        color: colorRutina[answers.objetivo] ?? '#DBF059',
        ejercicios: selected.map(e => ({ id: e.id, nombre: e.nombre, grupo: e.grupo ?? '', series: sr.series, reps: sr.reps, tiempo: sr.tiempo, desc: sr.desc })),
    };
}
