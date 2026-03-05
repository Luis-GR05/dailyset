export interface SerieSesion {
    kg: number;
    reps: number;
}

export interface EjercicioSesion {
    nombre: string;
    series: SerieSesion[];
}

export interface Sesion {
    id: string;
    fecha: string; // "YYYY-MM-DD"
    rutina: string;
    puntuacion: number; // 1-5
    duracionMin: number;
    ejercicios: EjercicioSesion[];
}

export const SESIONES: Sesion[] = [
    // Enero 2026
    {
        id: "1", fecha: "2026-01-02", rutina: "Torso - hipertrofia", puntuacion: 5, duracionMin: 65,
        ejercicios: [
            { nombre: "Press de Banca", series: [{ kg: 80, reps: 8 }, { kg: 80, reps: 8 }, { kg: 75, reps: 10 }] },
            { nombre: "Press Inclinado", series: [{ kg: 60, reps: 10 }, { kg: 60, reps: 10 }] },
            { nombre: "Aperturas", series: [{ kg: 14, reps: 15 }, { kg: 14, reps: 12 }] },
        ]
    },
    {
        id: "2", fecha: "2026-01-05", rutina: "Pierna - fuerza", puntuacion: 4, duracionMin: 75,
        ejercicios: [
            { nombre: "Sentadilla", series: [{ kg: 100, reps: 5 }, { kg: 100, reps: 5 }, { kg: 95, reps: 6 }] },
            { nombre: "Peso Muerto", series: [{ kg: 120, reps: 4 }, { kg: 115, reps: 5 }] },
            { nombre: "Prensa", series: [{ kg: 180, reps: 10 }, { kg: 180, reps: 10 }] },
        ]
    },
    {
        id: "3", fecha: "2026-01-08", rutina: "Día de Empuje A", puntuacion: 4, duracionMin: 55,
        ejercicios: [
            { nombre: "Press Militar", series: [{ kg: 50, reps: 8 }, { kg: 50, reps: 8 }] },
            { nombre: "Fondos en Paralelas", series: [{ kg: 0, reps: 15 }, { kg: 0, reps: 12 }] },
        ]
    },
    {
        id: "4", fecha: "2026-01-12", rutina: "Tirón A", puntuacion: 5, duracionMin: 60,
        ejercicios: [
            { nombre: "Dominadas", series: [{ kg: 0, reps: 10 }, { kg: 0, reps: 9 }, { kg: 0, reps: 8 }] },
            { nombre: "Remo con Barra", series: [{ kg: 70, reps: 10 }, { kg: 70, reps: 10 }] },
        ]
    },
    {
        id: "5", fecha: "2026-01-15", rutina: "Torso - hipertrofia", puntuacion: 4, duracionMin: 70,
        ejercicios: [
            { nombre: "Press de Banca", series: [{ kg: 82, reps: 8 }, { kg: 80, reps: 9 }] },
            { nombre: "Cruce de Poleas", series: [{ kg: 20, reps: 15 }, { kg: 20, reps: 12 }] },
        ]
    },
    {
        id: "6", fecha: "2026-01-19", rutina: "Pierna - fuerza", puntuacion: 3, duracionMin: 80,
        ejercicios: [
            { nombre: "Sentadilla", series: [{ kg: 102, reps: 5 }, { kg: 100, reps: 6 }] },
            { nombre: "Extensión de Cuádriceps", series: [{ kg: 60, reps: 12 }, { kg: 60, reps: 10 }] },
        ]
    },
    {
        id: "7", fecha: "2026-01-22", rutina: "Día de Empuje A", puntuacion: 5, duracionMin: 58,
        ejercicios: [
            { nombre: "Press Militar", series: [{ kg: 52, reps: 8 }, { kg: 50, reps: 9 }] },
            { nombre: "Press Inclinado", series: [{ kg: 62, reps: 10 }, { kg: 60, reps: 10 }] },
        ]
    },
    {
        id: "8", fecha: "2026-01-26", rutina: "Tirón A", puntuacion: 4, duracionMin: 62,
        ejercicios: [
            { nombre: "Dominadas", series: [{ kg: 0, reps: 11 }, { kg: 0, reps: 10 }] },
            { nombre: "Remo en Polea", series: [{ kg: 55, reps: 12 }, { kg: 55, reps: 12 }] },
        ]
    },
    {
        id: "9", fecha: "2026-01-29", rutina: "Torso - hipertrofia", puntuacion: 5, duracionMin: 68,
        ejercicios: [
            { nombre: "Press de Banca", series: [{ kg: 85, reps: 7 }, { kg: 82, reps: 8 }] },
            { nombre: "Aperturas", series: [{ kg: 16, reps: 12 }, { kg: 16, reps: 10 }] },
        ]
    },
    // Diciembre 2025
    {
        id: "10", fecha: "2025-12-01", rutina: "Pierna - fuerza", puntuacion: 4, duracionMin: 74,
        ejercicios: [
            { nombre: "Sentadilla", series: [{ kg: 95, reps: 6 }, { kg: 95, reps: 5 }] },
            { nombre: "Peso Muerto", series: [{ kg: 110, reps: 5 }, { kg: 110, reps: 4 }] },
        ]
    },
    {
        id: "11", fecha: "2025-12-04", rutina: "Tirón A", puntuacion: 4, duracionMin: 55,
        ejercicios: [
            { nombre: "Remo con Barra", series: [{ kg: 65, reps: 10 }, { kg: 65, reps: 10 }] },
        ]
    },
    {
        id: "12", fecha: "2025-12-07", rutina: "Torso - hipertrofia", puntuacion: 3, duracionMin: 60,
        ejercicios: [
            { nombre: "Press de Banca", series: [{ kg: 78, reps: 8 }, { kg: 78, reps: 7 }] },
        ]
    },
    {
        id: "13", fecha: "2025-12-11", rutina: "Día de Empuje A", puntuacion: 5, duracionMin: 50,
        ejercicios: [
            { nombre: "Press Militar", series: [{ kg: 48, reps: 10 }, { kg: 48, reps: 9 }] },
        ]
    },
    {
        id: "14", fecha: "2025-12-14", rutina: "Tirón A", puntuacion: 4, duracionMin: 58,
        ejercicios: [
            { nombre: "Dominadas", series: [{ kg: 0, reps: 9 }, { kg: 0, reps: 8 }] },
        ]
    },
    {
        id: "15", fecha: "2025-12-18", rutina: "Pierna - fuerza", puntuacion: 5, duracionMin: 78,
        ejercicios: [
            { nombre: "Sentadilla", series: [{ kg: 97, reps: 5 }, { kg: 95, reps: 6 }] },
            { nombre: "Peso Muerto", series: [{ kg: 112, reps: 4 }, { kg: 110, reps: 5 }] },
        ]
    },
    {
        id: "16", fecha: "2025-12-21", rutina: "Torso - hipertrofia", puntuacion: 4, duracionMin: 65,
        ejercicios: [
            { nombre: "Press de Banca", series: [{ kg: 80, reps: 8 }, { kg: 78, reps: 9 }] },
            { nombre: "Remo en Polea", series: [{ kg: 50, reps: 12 }, { kg: 50, reps: 12 }] },
        ]
    },
    {
        id: "17", fecha: "2025-12-25", rutina: "Día de Empuje A", puntuacion: 3, duracionMin: 45,
        ejercicios: [
            { nombre: "Press Inclinado", series: [{ kg: 58, reps: 10 }, { kg: 58, reps: 9 }] },
        ]
    },
    {
        id: "18", fecha: "2025-12-28", rutina: "Tirón A", puntuacion: 5, duracionMin: 62,
        ejercicios: [
            { nombre: "Dominadas", series: [{ kg: 0, reps: 10 }, { kg: 5, reps: 8 }] },
            { nombre: "Remo con Barra", series: [{ kg: 67, reps: 10 }, { kg: 67, reps: 9 }] },
        ]
    },
    // Noviembre 2025
    {
        id: "19", fecha: "2025-11-03", rutina: "Torso - hipertrofia", puntuacion: 4, duracionMin: 63,
        ejercicios: [
            { nombre: "Press de Banca", series: [{ kg: 77, reps: 8 }, { kg: 75, reps: 10 }] },
        ]
    },
    {
        id: "20", fecha: "2025-11-06", rutina: "Pierna - fuerza", puntuacion: 4, duracionMin: 72,
        ejercicios: [
            { nombre: "Sentadilla", series: [{ kg: 92, reps: 6 }, { kg: 90, reps: 7 }] },
        ]
    },
    {
        id: "21", fecha: "2025-11-10", rutina: "Tirón A", puntuacion: 5, duracionMin: 57,
        ejercicios: [
            { nombre: "Dominadas", series: [{ kg: 0, reps: 9 }, { kg: 0, reps: 8 }] },
        ]
    },
    {
        id: "22", fecha: "2025-11-13", rutina: "Día de Empuje A", puntuacion: 3, duracionMin: 48,
        ejercicios: [
            { nombre: "Press Militar", series: [{ kg: 45, reps: 10 }, { kg: 45, reps: 9 }] },
        ]
    },
    {
        id: "23", fecha: "2025-11-17", rutina: "Torso - hipertrofia", puntuacion: 4, duracionMin: 66,
        ejercicios: [
            { nombre: "Press de Banca", series: [{ kg: 78, reps: 8 }, { kg: 76, reps: 9 }] },
        ]
    },
    {
        id: "24", fecha: "2025-11-20", rutina: "Pierna - fuerza", puntuacion: 5, duracionMin: 76,
        ejercicios: [
            { nombre: "Sentadilla", series: [{ kg: 95, reps: 5 }, { kg: 93, reps: 6 }] },
            { nombre: "Peso Muerto", series: [{ kg: 108, reps: 5 }, { kg: 105, reps: 5 }] },
        ]
    },
    {
        id: "25", fecha: "2025-11-24", rutina: "Tirón A", puntuacion: 4, duracionMin: 60,
        ejercicios: [
            { nombre: "Remo con Barra", series: [{ kg: 63, reps: 10 }, { kg: 63, reps: 9 }] },
        ]
    },
    {
        id: "26", fecha: "2025-11-27", rutina: "Día de Empuje A", puntuacion: 4, duracionMin: 52,
        ejercicios: [
            { nombre: "Press Inclinado", series: [{ kg: 56, reps: 10 }, { kg: 55, reps: 10 }] },
        ]
    },
    // Octubre 2025
    {
        id: "27", fecha: "2025-10-02", rutina: "Torso - hipertrofia", puntuacion: 4, duracionMin: 61,
        ejercicios: [{ nombre: "Press de Banca", series: [{ kg: 75, reps: 8 }, { kg: 73, reps: 9 }] }]
    },
    {
        id: "28", fecha: "2025-10-05", rutina: "Pierna - fuerza", puntuacion: 3, duracionMin: 70,
        ejercicios: [{ nombre: "Sentadilla", series: [{ kg: 88, reps: 6 }, { kg: 88, reps: 5 }] }]
    },
    {
        id: "29", fecha: "2025-10-09", rutina: "Tirón A", puntuacion: 5, duracionMin: 55,
        ejercicios: [{ nombre: "Dominadas", series: [{ kg: 0, reps: 8 }, { kg: 0, reps: 7 }] }]
    },
    {
        id: "30", fecha: "2025-10-12", rutina: "Día de Empuje A", puntuacion: 4, duracionMin: 49,
        ejercicios: [{ nombre: "Press Militar", series: [{ kg: 43, reps: 10 }, { kg: 43, reps: 9 }] }]
    },
    {
        id: "31", fecha: "2025-10-16", rutina: "Torso - hipertrofia", puntuacion: 4, duracionMin: 63,
        ejercicios: [{ nombre: "Press Inclinado", series: [{ kg: 53, reps: 10 }, { kg: 53, reps: 9 }] }]
    },
    {
        id: "32", fecha: "2025-10-19", rutina: "Pierna - fuerza", puntuacion: 5, duracionMin: 73,
        ejercicios: [{ nombre: "Peso Muerto", series: [{ kg: 105, reps: 5 }, { kg: 102, reps: 5 }] }]
    },
    {
        id: "33", fecha: "2025-10-23", rutina: "Tirón A", puntuacion: 3, duracionMin: 54,
        ejercicios: [{ nombre: "Remo con Barra", series: [{ kg: 61, reps: 10 }, { kg: 60, reps: 10 }] }]
    },
    {
        id: "34", fecha: "2025-10-26", rutina: "Día de Empuje A", puntuacion: 4, duracionMin: 50,
        ejercicios: [{ nombre: "Press Militar", series: [{ kg: 44, reps: 9 }, { kg: 42, reps: 10 }] }]
    },
    {
        id: "35", fecha: "2025-10-30", rutina: "Torso - hipertrofia", puntuacion: 4, duracionMin: 60,
        ejercicios: [{ nombre: "Press de Banca", series: [{ kg: 76, reps: 8 }, { kg: 74, reps: 9 }] }]
    },
    // Septiembre 2025
    {
        id: "36", fecha: "2025-09-01", rutina: "Pierna - fuerza", puntuacion: 4, duracionMin: 68,
        ejercicios: [{ nombre: "Sentadilla", series: [{ kg: 85, reps: 6 }, { kg: 83, reps: 7 }] }]
    },
    {
        id: "37", fecha: "2025-09-04", rutina: "Tirón A", puntuacion: 5, duracionMin: 58,
        ejercicios: [{ nombre: "Dominadas", series: [{ kg: 0, reps: 7 }, { kg: 0, reps: 6 }] }]
    },
    {
        id: "38", fecha: "2025-09-08", rutina: "Torso - hipertrofia", puntuacion: 4, duracionMin: 60,
        ejercicios: [{ nombre: "Press de Banca", series: [{ kg: 72, reps: 8 }, { kg: 70, reps: 10 }] }]
    },
    {
        id: "39", fecha: "2025-09-11", rutina: "Día de Empuje A", puntuacion: 3, duracionMin: 46,
        ejercicios: [{ nombre: "Press Militar", series: [{ kg: 40, reps: 10 }, { kg: 40, reps: 8 }] }]
    },
    {
        id: "40", fecha: "2025-09-15", rutina: "Pierna - fuerza", puntuacion: 5, duracionMin: 71,
        ejercicios: [{ nombre: "Sentadilla", series: [{ kg: 87, reps: 6 }, { kg: 85, reps: 6 }] }]
    },
    {
        id: "41", fecha: "2025-09-18", rutina: "Tirón A", puntuacion: 4, duracionMin: 56,
        ejercicios: [{ nombre: "Remo con Barra", series: [{ kg: 58, reps: 10 }, { kg: 58, reps: 9 }] }]
    },
    {
        id: "42", fecha: "2025-09-22", rutina: "Torso - hipertrofia", puntuacion: 4, duracionMin: 62,
        ejercicios: [{ nombre: "Press de Banca", series: [{ kg: 73, reps: 8 }, { kg: 71, reps: 9 }] }]
    },
    {
        id: "43", fecha: "2025-09-25", rutina: "Día de Empuje A", puntuacion: 5, duracionMin: 50,
        ejercicios: [{ nombre: "Press Inclinado", series: [{ kg: 50, reps: 10 }, { kg: 50, reps: 10 }] }]
    },
    {
        id: "44", fecha: "2025-09-29", rutina: "Pierna - fuerza", puntuacion: 4, duracionMin: 74,
        ejercicios: [{ nombre: "Peso Muerto", series: [{ kg: 100, reps: 5 }, { kg: 98, reps: 5 }] }]
    },
    // Agosto 2025
    {
        id: "45", fecha: "2025-08-03", rutina: "Tirón A", puntuacion: 4, duracionMin: 54,
        ejercicios: [{ nombre: "Dominadas", series: [{ kg: 0, reps: 6 }, { kg: 0, reps: 5 }] }]
    },
    {
        id: "46", fecha: "2025-08-07", rutina: "Torso - hipertrofia", puntuacion: 3, duracionMin: 57,
        ejercicios: [{ nombre: "Press de Banca", series: [{ kg: 68, reps: 8 }, { kg: 68, reps: 7 }] }]
    },
    {
        id: "47", fecha: "2025-08-10", rutina: "Pierna - fuerza", puntuacion: 5, duracionMin: 70,
        ejercicios: [{ nombre: "Sentadilla", series: [{ kg: 80, reps: 6 }, { kg: 80, reps: 5 }] }]
    },
    {
        id: "48", fecha: "2025-08-14", rutina: "Día de Empuje A", puntuacion: 4, duracionMin: 47,
        ejercicios: [{ nombre: "Press Militar", series: [{ kg: 38, reps: 10 }, { kg: 38, reps: 9 }] }]
    },
    {
        id: "49", fecha: "2025-08-17", rutina: "Tirón A", puntuacion: 4, duracionMin: 55,
        ejercicios: [{ nombre: "Remo con Barra", series: [{ kg: 55, reps: 10 }, { kg: 55, reps: 10 }] }]
    },
    {
        id: "50", fecha: "2025-08-21", rutina: "Torso - hipertrofia", puntuacion: 5, duracionMin: 62,
        ejercicios: [{ nombre: "Press de Banca", series: [{ kg: 70, reps: 8 }, { kg: 68, reps: 9 }] }]
    },
    {
        id: "51", fecha: "2025-08-24", rutina: "Pierna - fuerza", puntuacion: 4, duracionMin: 68,
        ejercicios: [{ nombre: "Sentadilla", series: [{ kg: 82, reps: 6 }, { kg: 80, reps: 6 }] }]
    },
    {
        id: "52", fecha: "2025-08-28", rutina: "Día de Empuje A", puntuacion: 3, duracionMin: 45,
        ejercicios: [{ nombre: "Press Militar", series: [{ kg: 39, reps: 10 }, { kg: 38, reps: 10 }] }]
    },
    {
        id: "53", fecha: "2025-08-31", rutina: "Tirón A", puntuacion: 4, duracionMin: 57,
        ejercicios: [{ nombre: "Dominadas", series: [{ kg: 0, reps: 7 }, { kg: 0, reps: 6 }] }]
    },
];
