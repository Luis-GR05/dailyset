export const RUTINAS_DATA: Record<string, any[]> = {
    "Fuerza - Torso (Hipertrofia)": [
        { 
            id: 3, 
            nombre: "Remo con Barra", 
            series: [
                { numero: 1, anterior: "60KG x 10", kg: 60, reps: 10, completada: true },
                { numero: 2, anterior: "60KG x 10", kg: 65, reps: 8, completada: false }
            ] 
        },
        { 
            id: 10, 
            nombre: "Dominadas", 
            series: [
                { numero: 1, anterior: "BW x 10", kg: 0, reps: 10, completada: false },
                { numero: 2, anterior: "BW x 8", kg: 0, reps: 8, completada: false }
            ] 
        },
        { 
            id: 11, 
            nombre: "Press Inclinado con Mancuernas", 
            series: [
                { numero: 1, anterior: "20KG x 12", kg: 22, reps: 10, completada: false },
                { numero: 2, anterior: "20KG x 12", kg: 22, reps: 10, completada: false }
            ] 
        }
    ],
    "Fuerza - Pierna (Pesada)": [
        { 
            id: 1, 
            nombre: "Sentadilla Libre", 
            series: [
                { numero: 1, anterior: "80KG x 5", kg: 85, reps: 5, completada: true },
                { numero: 2, anterior: "85KG x 5", kg: 85, reps: 5, completada: true }
            ] 
        },
        { 
            id: 2, 
            nombre: "Peso Muerto", 
            series: [
                { numero: 1, anterior: "100KG x 3", kg: 105, reps: 3, completada: false }
            ] 
        },
        { 
            id: 12, 
            nombre: "Prensa de Piernas", 
            series: [
                { numero: 1, anterior: "200KG x 10", kg: 220, reps: 8, completada: false }
            ] 
        },
        { 
            id: 13, 
            nombre: "Hip Thrust", 
            series: [
                { numero: 1, anterior: "120KG x 8", kg: 130, reps: 8, completada: false },
                { numero: 2, anterior: "120KG x 8", kg: 130, reps: 8, completada: false }
            ] 
        }
    ],
    "Cardio - Torso (Remo y Cuerdas)": [
        { 
            id: 14, 
            nombre: "Máquina de Remo", 
            series: [
                { numero: 1, anterior: "5 min", kg: 0, reps: 1, completada: true }
            ] 
        },
        { 
            id: 15, 
            nombre: "Battle Ropes", 
            series: [
                { numero: 1, anterior: "30 seg", kg: 0, reps: 1, completada: false },
                { numero: 2, anterior: "30 seg", kg: 0, reps: 1, completada: false }
            ] 
        },
        { 
            id: 6, 
            nombre: "Salto a la Comba", 
            series: [
                { numero: 1, anterior: "5 min", kg: 0, reps: 1, completada: false }
            ] 
        }
    ],
    "Cardio - Pierna (HIIT)": [
        { 
            id: 4, 
            nombre: "Cinta de Correr", 
            series: [
                { numero: 1, anterior: "10 min", kg: 0, reps: 1, completada: false },
                { numero: 2, anterior: "10 min", kg: 0, reps: 1, completada: false }
            ] 
        },
        { 
            id: 5, 
            nombre: "Bicicleta Estática", 
            series: [
                { numero: 1, anterior: "15 min", kg: 0, reps: 1, completada: false }
            ] 
        },
        { 
            id: 16, 
            nombre: "Escaladora", 
            series: [
                { numero: 1, anterior: "10 min", kg: 0, reps: 1, completada: false }
            ] 
        }
    ],
    "Empuje - Torso (Pecho y Hombro)": [
        { 
            id: 7, 
            nombre: "Press de Banca", 
            series: [
                { numero: 1, anterior: "60KG x 8", kg: 65, reps: 6, completada: true },
                { numero: 2, anterior: "65KG x 6", kg: 65, reps: 6, completada: false }
            ] 
        },
        { 
            id: 8, 
            nombre: "Press Militar", 
            series: [
                { numero: 1, anterior: "40KG x 10", kg: 42, reps: 8, completada: false },
                { numero: 2, anterior: "40KG x 10", kg: 42, reps: 8, completada: false }
            ] 
        },
        { 
            id: 9, 
            nombre: "Fondos en Paralelas", 
            series: [
                { numero: 1, anterior: "BW x 12", kg: 0, reps: 15, completada: false },
                { numero: 2, anterior: "BW x 10", kg: 0, reps: 12, completada: false }
            ] 
        },
        { 
            id: 17, 
            nombre: "Flexiones", 
            series: [
                { numero: 1, anterior: "BW x 20", kg: 0, reps: 25, completada: false }
            ] 
        }
    ],
    "Empuje - Pierna (Cuádriceps y Gemelo)": [
        { 
            id: 18, 
            nombre: "Sentadilla Búlgara", 
            series: [
                { numero: 1, anterior: "20KG x 10", kg: 24, reps: 8, completada: false },
                { numero: 2, anterior: "20KG x 10", kg: 24, reps: 8, completada: false }
            ] 
        },
        { 
            id: 19, 
            nombre: "Elevación de Talones", 
            series: [
                { numero: 1, anterior: "60KG x 15", kg: 65, reps: 15, completada: false },
                { numero: 2, anterior: "60KG x 15", kg: 65, reps: 15, completada: false },
                { numero: 3, anterior: "60KG x 15", kg: 65, reps: 15, completada: false }
            ] 
        }
    ],
    "Tracción - Torso (Espalda y Bíceps)": [
        { 
            id: 20, 
            nombre: "Jalón al Pecho", 
            series: [
                { numero: 1, anterior: "50KG x 12", kg: 55, reps: 10, completada: false },
                { numero: 2, anterior: "50KG x 12", kg: 55, reps: 10, completada: false }
            ] 
        },
        { 
            id: 21, 
            nombre: "Curl de Bíceps", 
            series: [
                { numero: 1, anterior: "12KG x 12", kg: 14, reps: 10, completada: false },
                { numero: 2, anterior: "12KG x 12", kg: 14, reps: 10, completada: false }
            ] 
        },
        { 
            id: 22, 
            nombre: "Pull-over", 
            series: [
                { numero: 1, anterior: "20KG x 12", kg: 22, reps: 10, completada: false }
            ] 
        }
    ],
    "Tracción - Pierna (Isquiosurales)": [
        { 
            id: 23, 
            nombre: "Peso Muerto Rumano", 
            series: [
                { numero: 1, anterior: "80KG x 10", kg: 85, reps: 8, completada: false },
                { numero: 2, anterior: "80KG x 10", kg: 85, reps: 8, completada: false }
            ] 
        },
        { 
            id: 24, 
            nombre: "Curl Femoral", 
            series: [
                { numero: 1, anterior: "40KG x 12", kg: 45, reps: 10, completada: false },
                { numero: 2, anterior: "40KG x 12", kg: 45, reps: 10, completada: false }
            ] 
        }
    ]
};