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
    // --- FUERZA ---
    // Fuerza - Torso
    { id: 3, nombre: "Remo con Barra", grupo: "Torso / Espalda", categoria: "Fuerza", descripcion: "Inclínate hacia delante 45°, tira de la barra hacia el abdomen manteniendo los codos pegados.", videoUrl: "https://www.youtube.com/embed/RUOWyV6P4Jg", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" },
    { id: 10, nombre: "Dominadas", grupo: "Torso / Espalda", categoria: "Fuerza", descripcion: "Cuélgate de la barra y tira de tu cuerpo hacia arriba hasta que la barbilla pase la barra.", videoUrl: "https://www.youtube.com/embed/aAggnpPyR6E", imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=800" },
    { id: 11, nombre: "Press Inclinado con Mancuernas", grupo: "Torso / Pecho", categoria: "Fuerza", descripcion: "En un banco inclinado, empuja las mancuernas hacia arriba controlando el movimiento.", videoUrl: "https://www.youtube.com/embed/8iPEnn-ltC8", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800" },
    // Fuerza - Pierna
    { id: 1, nombre: "Sentadilla Libre", grupo: "Pierna / Glúteo", categoria: "Fuerza", descripcion: "Coloca la barra sobre la parte alta de la espalda, desciende hasta que los muslos estén paralelos al suelo.", videoUrl: "https://www.youtube.com/embed/U3HlPAOpiXQ", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800" },
    { id: 2, nombre: "Peso Muerto", grupo: "Pierna / Espalda", categoria: "Fuerza", descripcion: "Mantén la espalda recta, agarra la barra y eleva las caderas hasta quedar erguido.", videoUrl: "https://www.youtube.com/embed/wYREQkVtvEc", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" },
    { id: 12, nombre: "Prensa de Piernas", grupo: "Pierna", categoria: "Fuerza", descripcion: "Siéntate en la máquina de prensa y empuja la plataforma con las piernas, pero sin bloquear las rodillas.", videoUrl: "https://www.youtube.com/embed/WvzJq1g_U_8", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" },
    { id: 13, nombre: "Hip Thrust", grupo: "Pierna / Glúteo", categoria: "Fuerza", descripcion: "Apoya la espalda alta en un banco, coloca la barra en la cadera y empuja hacia arriba apretando los glúteos.", videoUrl: "https://www.youtube.com/embed/Zp26q4BY5CE", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" },

    // --- CARDIO ---
    // Cardio - Torso y Cuerpo completo
    { id: 6, nombre: "Salto a la Comba", grupo: "Torso y Pierna", categoria: "Cardio", descripcion: "Salta con los pies juntos o alternando, manteniendo el ritmo durante el tiempo establecido.", videoUrl: "https://www.youtube.com/embed/FJmRQ5iZXxg", imageUrl: "https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&q=80&w=800" },
    { id: 14, nombre: "Máquina de Remo", grupo: "Torso y Pierna", categoria: "Cardio", descripcion: "Empuja primero con las piernas y luego tira del manillar hacia el pecho, manteniendo la espalda recta.", videoUrl: "https://www.youtube.com/embed/zbfBf0ZqNvs", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" },
    { id: 15, nombre: "Battle Ropes", grupo: "Torso", categoria: "Cardio", descripcion: "Mueve las cuerdas de forma alterna o simultánea creando ondas potentes continuamente.", videoUrl: "https://www.youtube.com/embed/GwnGGuDMBmQ", imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800" },
    // Cardio - Pierna
    { id: 4, nombre: "Cinta de Correr", grupo: "Pierna", categoria: "Cardio", descripcion: "Mantén un ritmo constante y la postura erguida durante toda la sesión.", videoUrl: "https://www.youtube.com/embed/8i4A0K8XGEA", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=800" },
    { id: 5, nombre: "Bicicleta Estática", grupo: "Pierna", categoria: "Cardio", descripcion: "Ajusta el sillín a la altura de la cadera y pedalea con cadencia moderada-alta.", videoUrl: "https://www.youtube.com/embed/M-pWvN33kVE", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=800" },
    { id: 16, nombre: "Escaladora", grupo: "Pierna", categoria: "Cardio", descripcion: "Sube escalones a un ritmo constante, manteniendo el torso recto sin apoyarte en exceso.", videoUrl: "https://www.youtube.com/embed/bWz-7gK9_J0", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" },

    // --- EMPUJE ---
    // Empuje - Torso
    { id: 7, nombre: "Press de Banca", grupo: "Torso / Pecho", categoria: "Empuje", descripcion: "Baja la barra lentamente hacia el pecho, manteniendo los codos a 45 grados.", videoUrl: "https://www.youtube.com/embed/rxD321l2svE", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" },
    { id: 8, nombre: "Press Militar", grupo: "Torso / Hombro", categoria: "Empuje", descripcion: "De pie o sentado, empuja la barra por encima de la cabeza hasta la extensión completa.", videoUrl: "https://www.youtube.com/embed/eIq5CB9EfZA", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800" },
    { id: 9, nombre: "Fondos en Paralelas", grupo: "Torso / Tríceps", categoria: "Empuje", descripcion: "Baja el cuerpo hasta que los hombros estén a la altura de los codos, luego empuja hacia arriba.", videoUrl: "https://www.youtube.com/embed/wjUmnZH528Y", imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800" },
    { id: 17, nombre: "Flexiones", grupo: "Torso / Pecho", categoria: "Empuje", descripcion: "Mantén el cuerpo recto y baja hasta que el pecho roce el suelo, luego empuja para extender brazos.", videoUrl: "https://www.youtube.com/embed/_l3ySVKYVJ8", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800" },
    // Empuje - Pierna
    { id: 18, nombre: "Sentadilla Búlgara", grupo: "Pierna", categoria: "Empuje", descripcion: "Apoya un pie atrás en un banco y baja la cadera hasta que la rodilla trasera casi toque el suelo.", videoUrl: "https://www.youtube.com/embed/2C-uNgKwPLE", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800" },
    { id: 19, nombre: "Elevación de Talones", grupo: "Pierna / Gemelo", categoria: "Empuje", descripcion: "Empuja el peso con las puntas de los pies para elevar los talones al máximo.", videoUrl: "https://www.youtube.com/embed/JbyjNymZOt0", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" },

    // --- TRACCIÓN ---
    // Tracción - Torso
    { id: 20, nombre: "Jalón al Pecho", grupo: "Torso / Espalda", categoria: "Tracción", descripcion: "Siéntate y tira de la barra ancha hacia la parte superior del pecho con la espalda recta.", videoUrl: "https://www.youtube.com/embed/EUIri47Epcg", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" },
    { id: 21, nombre: "Curl de Bíceps", grupo: "Torso / Bíceps", categoria: "Tracción", descripcion: "Con mancuernas o barra, flexiona los codos para llevar el peso hacia los hombros controladamente.", videoUrl: "https://www.youtube.com/embed/in7PaeYlhrM", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" },
    { id: 22, nombre: "Pull-over", grupo: "Torso / Espalda", categoria: "Tracción", descripcion: "Apoyando alta espalda en un banco, baja una mancuerna por tras de la cabeza y devuelve sobre pecho.", videoUrl: "https://www.youtube.com/embed/FK4qhKCF2K8", imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800" },
    // Tracción - Pierna
    { id: 23, nombre: "Peso Muerto Rumano", grupo: "Pierna / Isquiotibial", categoria: "Tracción", descripcion: "Con las rodillas semi-rígidas, baja la barra empujando la cadera hacia atrás sintiendo el estiramiento.", videoUrl: "https://www.youtube.com/embed/_oyxCn2iSjU", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" },
    { id: 24, nombre: "Curl Femoral", grupo: "Pierna / Isquiotibial", categoria: "Tracción", descripcion: "En la máquina, flexiona las rodillas para llevar los talones hacia los glúteos de forma controlada.", videoUrl: "https://www.youtube.com/embed/1Tq3QdNC5LE", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" },
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
