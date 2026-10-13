// Lógica COMPARTIDA web/app (se copia a dailyset-app con scripts/sincronizar-web.mjs).
// Puntuación 1-5 de una sesión de entrenamiento (Índice de Carga Proyectada).

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

export function calcularPuntuacion(args: {
    ejercicios: { series: { kg: number; reps: number; completada: boolean }[] }[];
}) {
    // Ecuación (Índice de Carga Proyectada):
    // S = ( V_total / (N_ex * S̄) ) * ω
    // donde V_total = Σ (kg * reps * series) de lo completado,
    // N_ex = nº ejercicios, S̄ = promedio series por ejercicio, ω escala a 1-5.
    //
    // Nota: N_ex * S̄ = totalSeries, así que la expresión equivale a:
    // S = (V_total / totalSeries) * ω

    const ejerciciosConTrabajo = args.ejercicios
        .map(e => ({
            totalSeries: e.series.filter(s => s.completada).length,
            volumen: e.series.reduce((t, s) => t + (s.completada ? (s.kg * s.reps) : 0), 0),
        }))
        .filter(e => e.totalSeries > 0);

    const N_ex = ejerciciosConTrabajo.length;
    const totalSeries = ejerciciosConTrabajo.reduce((t, e) => t + e.totalSeries, 0);
    const V_total = ejerciciosConTrabajo.reduce((t, e) => t + e.volumen, 0);

    if (N_ex === 0 || totalSeries === 0 || V_total <= 0) return 1;

    const S_bar = totalSeries / N_ex;
    const omega = 0.005; // escala empírica: ~600 de (kg*reps) por serie → ~3 puntos
    const raw = (V_total / (N_ex * S_bar)) * omega;
    return Math.round(clamp(raw, 1, 5));
}
