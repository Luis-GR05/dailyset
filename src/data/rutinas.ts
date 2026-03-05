
export const RUTINAS_DATA: Record<string, any[]> = {
    "Torso - hipertrofia": [
        { 
            id: 1, 
            nombre: "Press de Banca", 
            series: [
                { numero: 1, anterior: "50KG x 12", kg: 45, reps: 15, completada: true },
                { numero: 2, anterior: "50KG x 12", kg: 45, reps: 12, completada: true }
            ] 
        },
        { 
            id: 2, 
            nombre: "Remo con Barra", 
            series: [
                { numero: 1, anterior: "60KG x 10", kg: 60, reps: 10, completada: false }
            ] 
        }
    ],
    "Pierna - fuerza": [
        { 
            id: 3, 
            nombre: "Sentadilla", 
            series: [
                { numero: 1, anterior: "80KG x 5", kg: 85, reps: 5, completada: true },
                { numero: 2, anterior: "85KG x 5", kg: 85, reps: 5, completada: true }
            ] 
        },
        { 
            id: 4, 
            nombre: "Peso Muerto", 
            series: [
                { numero: 1, anterior: "100KG x 3", kg: 105, reps: 3, completada: false }
            ] 
        }
    ],
    "Día de Empuje A": [
        { 
            id: 5, 
            nombre: "Press Militar", 
            series: [
                { numero: 1, anterior: "40KG x 10", kg: 40, reps: 10, completada: true },
                { numero: 2, anterior: "40KG x 10", kg: 42, reps: 8, completada: true }
            ] 
        },
        { 
            id: 6, 
            nombre: "Press Inclinado", 
            series: [
                { numero: 1, anterior: "40KG x 10", kg: 40, reps: 12, completada: true },
                { numero: 2, anterior: "40KG x 10", kg: 42, reps: 10, completada: true }
            ] 
        },
        {
            id: 7,
            nombre: "Aperturas con Mancuernas",
            series: [
                { numero: 1, anterior: "14KG x 12", kg: 14, reps: 15, completada: true },
                { numero: 2, anterior: "14KG x 12", kg: 16, reps: 12, completada: false }
            ]
        }
    ],
    "Tirón A": [
        {
            id: 8,
            nombre: "Dominadas",
            series: [
                { numero: 1, anterior: "BW x 10", kg: 0, reps: 10, completada: true },
                { numero: 2, anterior: "BW x 8", kg: 0, reps: 8, completada: true }
            ]
        }
    ]
};