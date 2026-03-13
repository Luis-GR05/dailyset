import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Ejercicio {
    id: number;
    nombre: string;
    grupo: string;
    categoria: string;
    descripcion: string;
    videoUrl?: string;
    imageUrl?: string;
}

interface EjerciciosContextType {
    ejercicios: Ejercicio[];
    agregarEjercicio: (e: Omit<Ejercicio, 'id'>) => void;
    editarEjercicio: (e: Ejercicio) => void;
    eliminarEjercicio: (id: number) => void;
}

const EjerciciosContext = createContext<EjerciciosContextType | undefined>(undefined);

// Lista vacía: los ejercicios se cargarán desde Supabase cuando se implemente
const EJERCICIOS_INICIALES: Ejercicio[] = [];

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
