interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
}

export default function Card({ children, className = '', hoverable = true }: CardProps) {
    return (
        <div className={`card ${hoverable ? 'hover:border-neutral-500 ' : ''} ${className}`}>
            {children}
        </div>
    );
}


export function ExerciseCard() {
    return (
        <>
            <Card className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-2">Press de Banca</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="badge badge-accent">Pecho</span>
                            <span className="px-3 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-full font-medium">
                                Mancuernas
                            </span>
                            <span className="px-3 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-full font-medium">
                                Fuerza
                            </span>
                        </div>
                    </div>
                    <button className="text-neutral-400 hover:text-accent transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </button>
                </div>
            </Card>
        </>
    );
}

export function WorkoutCard() {
    return (
        <>
            <Card className="p-6">
                <div className="mb-4">
                    <h3 className="text-white font-display font-bold text-xl mb-2">Torso - hipertrofia</h3>
                    <p className="text-neutral-400 text-sm">6 ejercicios - 75 min</p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-accent/20 text-accent text-xs rounded-full font-bold">
                            Fuerza
                        </span>
                        <span className="px-3 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-full font-medium">
                            Cardio
                        </span>
                        <span className="px-3 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-full font-medium">
                            Empleo
                        </span>
                    </div>

                    <button className="text-accent font-display font-bold hover:text-accent-hover transition-colors flex items-center gap-1">
                        Iniciar
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </Card>
        </>
    );
}
