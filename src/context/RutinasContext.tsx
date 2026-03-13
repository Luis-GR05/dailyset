import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Rutina {
    id: number;
    nombre: string;
    categoria: string;
    duracion: number;
    ejerciciosIds: number[];
    imageUrl?: string;
}

interface RutinasContextType {
    rutinas: Rutina[];
    agregarRutina: (r: Omit<Rutina, 'id'>) => void;
    editarRutina: (r: Rutina) => void;
    eliminarRutina: (id: number) => void;
}

const RutinasContext = createContext<RutinasContextType | undefined>(undefined);

// Lista vacía: las rutinas se cargarán desde Supabase cuando se implemente
const RUTINAS_INICIALES: Rutina[] = [];

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
