import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Rutina {
    id: number;
    nombre: string;
    categoria: string;
    duracion: number;
    ejerciciosIds: number[];
}

interface RutinasContextType {
    rutinas: Rutina[];
    agregarRutina: (r: Omit<Rutina, 'id'>) => void;
    editarRutina: (r: Rutina) => void;
    eliminarRutina: (id: number) => void;
}

const RutinasContext = createContext<RutinasContextType | undefined>(undefined);

const RUTINAS_INICIALES: Rutina[] = [
    { id: 1, nombre: "Torso - hipertrofia", duracion: 75, categoria: "Fuerza", ejerciciosIds: [7, 3] },
    { id: 2, nombre: "Running 5K", duracion: 30, categoria: "Cardio", ejerciciosIds: [4] },
    { id: 3, nombre: "Press Militar y Tríceps", duracion: 50, categoria: "Empuje", ejerciciosIds: [8, 9] },
    { id: 4, nombre: "Pierna - fuerza", duracion: 60, categoria: "Fuerza", ejerciciosIds: [1, 2] },
    { id: 5, nombre: "Natación", duracion: 45, categoria: "Cardio", ejerciciosIds: [5, 6] },
    { id: 6, nombre: "Pecho - Aperturas", duracion: 65, categoria: "Empuje", ejerciciosIds: [7, 9] },
];

export function RutinasProvider({ children }: { children: ReactNode }) {
    const [rutinas, setRutinas] = useState<Rutina[]>(RUTINAS_INICIALES);

    const agregarRutina = (r: Omit<Rutina, 'id'>) => {
        setRutinas(prev => [...prev, { ...r, id: Date.now() }]);
    };

    const editarRutina = (r: Rutina) => {
        setRutinas(prev => prev.map(ru => ru.id === r.id ? r : ru));
    };

    const eliminarRutina = (id: number) => {
        setRutinas(prev => prev.filter(ru => ru.id !== id));
    };

    return (
        <RutinasContext.Provider value={{ rutinas, agregarRutina, editarRutina, eliminarRutina }}>
            {children}
        </RutinasContext.Provider>
    );
}

export function useRutinas() {
    const ctx = useContext(RutinasContext);
    if (!ctx) throw new Error('useRutinas debe usarse dentro de RutinasProvider');
    return ctx;
}
