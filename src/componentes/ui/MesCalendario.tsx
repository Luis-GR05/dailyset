
interface MesCalendarioProps {
    mes: number;
    anio: number;
    entrenamientos: number[];
}

export default function MesCalendario({ mes, anio, entrenamientos }: MesCalendarioProps) {
    const nombreMes = new Date(anio, mes).toLocaleString('es-ES', { month: 'long' });
    const primerDiaSemana = new Date(anio, mes, 1).getDay();
    const primerDiaAjustado = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();

    const diasArray = Array.from({ length: diasEnMes }, (_, i) => i + 1);
    const diasVacios = Array.from({ length: primerDiaAjustado }, (_, i) => i);

    return (
        <div className="mb-6">
            <h3 className="text-white font-bold capitalize mb-4 text-lg">{nombreMes}</h3>
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia) => (
                    <span key={dia} className="text-neutral-500 text-xs font-bold">{dia}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                {diasVacios.map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {diasArray.map((dia) => {
                    const entrenado = entrenamientos.includes(dia);
                    return (
                        <div key={dia} className="flex flex-col items-center">
                            <span
                                className={`text-sm ${entrenado
                                        ? 'text-white font-bold border-b-2 border-[#DBF059] pb-1'
                                        : 'text-neutral-400'
                                    }`}
                            >
                                {dia}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
