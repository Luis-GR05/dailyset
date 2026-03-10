import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Ejercicio {
    id: number;
    nombre: string;
    grupo: string;
    categoria: string;
    descripcion: string;
}

interface EjerciciosContextType {
    ejercicios: Ejercicio[];
    agregarEjercicio: (e: Omit<Ejercicio, 'id'>) => void;
    editarEjercicio: (e: Ejercicio) => void;
    eliminarEjercicio: (id: number) => void;
}

const EjerciciosContext = createContext<EjerciciosContextType | undefined>(undefined);

const EJERCICIOS_INICIALES: Ejercicio[] = [
    { id: 1, nombre: "Sentadilla Libre", grupo: "Pierna / glúteos", categoria: "Fuerza", descripcion: "Coloca la barra sobre la parte alta de la espalda, desciende hasta que los muslos estén paralelos al suelo." },
    { id: 2, nombre: "Peso Muerto", grupo: "Espalda / pierna", categoria: "Fuerza", descripcion: "Mantén la espalda recta, agarra la barra y eleva las caderas hasta quedar erguido." },
    { id: 3, nombre: "Remo con Barra", grupo: "Espalda / bíceps", categoria: "Fuerza", descripcion: "Inclínate hacia delante 45°, tira de la barra hacia el abdomen manteniendo los codos pegados." },
    { id: 4, nombre: "Cinta de Correr", grupo: "Cuerpo completo", categoria: "Cardio", descripcion: "Mantén un ritmo constante y la postura erguida durante toda la sesión." },
    { id: 5, nombre: "Bicicleta Estática", grupo: "Piernas", categoria: "Cardio", descripcion: "Ajusta el sillín a la altura de la cadera y pedalea con cadencia moderada-alta." },
    { id: 6, nombre: "Salto a la Comba", grupo: "Cardio vascular", categoria: "Cardio", descripcion: "Salta con los pies juntos o alternando, manteniendo el ritmo durante el tiempo establecido." },
    { id: 7, nombre: "Press de Banca", grupo: "Pecho / tríceps", categoria: "Empuje", descripcion: "Baja la barra lentamente hacia el pecho, manteniendo los codos a 45 grados." },
    { id: 8, nombre: "Press Militar", grupo: "Hombro / tríceps", categoria: "Empuje", descripcion: "De pie o sentado, empuja la barra por encima de la cabeza hasta la extensión completa." },
    { id: 9, nombre: "Fondos en Paralelas", grupo: "Pecho / tríceps", categoria: "Empuje", descripcion: "Baja el cuerpo hasta que los hombros estén a la altura de los codos, luego empuja hacia arriba." },
];

export function EjerciciosProvider({ children }: { children: ReactNode }) {
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>(EJERCICIOS_INICIALES);

    const agregarEjercicio = (e: Omit<Ejercicio, 'id'>) => {
        setEjercicios(prev => [...prev, { ...e, id: Date.now() }]);
    };

    const editarEjercicio = (e: Ejercicio) => {
        setEjercicios(prev => prev.map(ej => ej.id === e.id ? e : ej));
    };

    const eliminarEjercicio = (id: number) => {
        setEjercicios(prev => prev.filter(ej => ej.id !== id));
    };

    return (
        <EjerciciosContext.Provider value={{ ejercicios, agregarEjercicio, editarEjercicio, eliminarEjercicio }}>
            {children}
        </EjerciciosContext.Provider>
    );
}

export function useEjercicios() {
    const ctx = useContext(EjerciciosContext);
    if (!ctx) throw new Error('useEjercicios debe usarse dentro de EjerciciosProvider');
    return ctx;
}
