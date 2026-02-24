interface MesCalendarioProps {
    mes: number;
    anio: number;
    entrenamientos: number[];
    onDiaClick?: (dia: number) => void;
}

export default function MesCalendario({ mes, anio, entrenamientos, onDiaClick }: MesCalendarioProps) {
    const primerDiaSemana = new Date(anio, mes, 1).getDay();
    const primerDiaAjustado = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();

    const diasArray = Array.from({ length: diasEnMes }, (_, i) => i + 1);
    const diasVacios = Array.from({ length: primerDiaAjustado }, (_, i) => i);

    return (
        <div className="mb-4">
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia) => (
                    <span key={dia} className="text-neutral-500 text-xs font-bold">{dia}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-3 gap-x-1">
                {diasVacios.map((_, i) => <div key={`e-${i}`} />)}
                {diasArray.map((dia) => {
                    const entrenado = entrenamientos.includes(dia);
                    return (
                        <div
                            key={dia}
                            onClick={entrenado && onDiaClick ? (e) => { e.stopPropagation(); onDiaClick(dia); } : undefined}
                            className={`flex flex-col items-center ${entrenado && onDiaClick ? 'cursor-pointer' : ''}`}
                        >
                            <span className={`text-sm ${entrenado
                                ? 'text-white font-bold border-b-2 border-[#DBF059] pb-0.5'
                                : 'text-neutral-500'
                                }`}>
                                {dia}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
