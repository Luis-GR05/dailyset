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

const RUTINAS_INICIALES: Rutina[] = [
    // Fuerza
    { id: 1, nombre: "Fuerza - Torso (Hipertrofia)", duracion: 75, categoria: "Fuerza", ejerciciosIds: [3, 10, 11], imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" },
    { id: 2, nombre: "Fuerza - Pierna (Pesada)", duracion: 60, categoria: "Fuerza", ejerciciosIds: [1, 2, 12, 13], imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800" },
    // Cardio
    { id: 3, nombre: "Cardio - Torso (Remo y Cuerdas)", duracion: 30, categoria: "Cardio", ejerciciosIds: [14, 15, 6], imageUrl: "https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&q=80&w=800" },
    { id: 4, nombre: "Cardio - Pierna (HIIT)", duracion: 45, categoria: "Cardio", ejerciciosIds: [4, 5, 16], imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=800" },
    // Empuje
    { id: 5, nombre: "Empuje - Torso (Pecho y Hombro)", duracion: 50, categoria: "Empuje", ejerciciosIds: [7, 8, 9, 17], imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" },
    { id: 6, nombre: "Empuje - Pierna (Cuádriceps y Gemelo)", duracion: 40, categoria: "Empuje", ejerciciosIds: [18, 19], imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800" },
    // Tracción
    { id: 7, nombre: "Tracción - Torso (Espalda y Bíceps)", duracion: 55, categoria: "Tracción", ejerciciosIds: [20, 21, 22], imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=800" },
    { id: 8, nombre: "Tracción - Pierna (Isquiosurales)", duracion: 40, categoria: "Tracción", ejerciciosIds: [23, 24], imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" },
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
