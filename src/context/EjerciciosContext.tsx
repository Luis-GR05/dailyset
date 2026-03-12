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

const EJERCICIOS_INICIALES: Ejercicio[] = [
    { id: 1, nombre: "Sentadilla Libre", grupo: "Pierna / glúteos", categoria: "Fuerza", descripcion: "Coloca la barra sobre la parte alta de la espalda, desciende hasta que los muslos estén paralelos al suelo.", videoUrl: "https://www.youtube.com/embed/NHD0vH7XXgw", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800" },
    { id: 2, nombre: "Peso Muerto", grupo: "Espalda / pierna", categoria: "Fuerza", descripcion: "Mantén la espalda recta, agarra la barra y eleva las caderas hasta quedar erguido.", videoUrl: "https://www.youtube.com/embed/op9kVnSso6Q", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" },
    { id: 3, nombre: "Remo con Barra", grupo: "Espalda / bíceps", categoria: "Fuerza", descripcion: "Inclínate hacia delante 45°, tira de la barra hacia el abdomen manteniendo los codos pegados.", videoUrl: "https://www.youtube.com/embed/G8l_8chR5BE", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" },
    { id: 4, nombre: "Cinta de Correr", grupo: "Cuerpo completo", categoria: "Cardio", descripcion: "Mantén un ritmo constante y la postura erguida durante toda la sesión.", videoUrl: "https://www.youtube.com/embed/-kSpyVFYXoA", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=800" },
    { id: 5, nombre: "Bicicleta Estática", grupo: "Piernas", categoria: "Cardio", descripcion: "Ajusta el sillín a la altura de la cadera y pedalea con cadencia moderada-alta.", videoUrl: "https://www.youtube.com/embed/9glAfFz8OVo", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=800" },
    { id: 6, nombre: "Salto a la Comba", grupo: "Cardio vascular", categoria: "Cardio", descripcion: "Salta con los pies juntos o alternando, manteniendo el ritmo durante el tiempo establecido.", videoUrl: "https://www.youtube.com/embed/PwMFBdsHZEI", imageUrl: "https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&q=80&w=800" },
    { id: 7, nombre: "Press de Banca", grupo: "Pecho / tríceps", categoria: "Empuje", descripcion: "Baja la barra lentamente hacia el pecho, manteniendo los codos a 45 grados.", videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" },
    { id: 8, nombre: "Press Militar", grupo: "Hombro / tríceps", categoria: "Empuje", descripcion: "De pie o sentado, empuja la barra por encima de la cabeza hasta la extensión completa.", videoUrl: "https://www.youtube.com/embed/4I6gCfiIHlw", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800" },
    { id: 9, nombre: "Fondos en Paralelas", grupo: "Pecho / tríceps", categoria: "Empuje", descripcion: "Baja el cuerpo hasta que los hombros estén a la altura de los codos, luego empuja hacia arriba.", videoUrl: "https://www.youtube.com/embed/2z8JmcrW-As", imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800" },
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
