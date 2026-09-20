interface MesCalendarioProps {
    mes: number;
    anio: number;
    entrenamientos?: number[];
    diasEntrenados?: number[];
    onDiaClick?: (dia: number) => void;
    diaSeleccionado?: number | null;
}

export default function MesCalendario({
    mes,
    anio,
    entrenamientos,
    diasEntrenados,
    onDiaClick,
    diaSeleccionado,
}: MesCalendarioProps) {
    const listaEntrenados = diasEntrenados ?? entrenamientos ?? [];
    const primerDiaSemana = new Date(anio, mes, 1).getDay();
    const primerDiaAjustado = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();

    const hoy = new Date();
    const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() === mes;
    const diaHoy = esMesActual ? hoy.getDate() : -1;

    const diasArray = Array.from({ length: diasEnMes }, (_, i) => i + 1);
    const diasVacios = Array.from({ length: primerDiaAjustado }, (_, i) => i);

    return (
        <div className="mb-2">
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia) => (
                    <span key={dia} className="text-neutral-500 text-xs font-bold py-1">{dia}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {diasVacios.map((_, i) => <div key={`e-${i}`} className="h-9" />)}
                {diasArray.map((dia) => {
                    const entrenado = listaEntrenados.includes(dia);
                    const seleccionado = diaSeleccionado === dia;
                    const esHoy = dia === diaHoy;

                    return (
                        <button
                            key={dia}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onDiaClick) onDiaClick(dia);
                            }}
                            className={`h-9 w-full rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer ${
                                seleccionado
                                    ? 'bg-[var(--color-primary)] text-black font-black shadow-lg scale-105 z-10'
                                    : entrenado
                                    ? 'bg-white/10 text-white font-bold hover:bg-white/20 hover:scale-105'
                                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            } ${esHoy && !seleccionado ? 'border border-[var(--color-primary)]/50' : ''}`}
                            title={entrenado ? `Día ${dia}: Entrenamiento registrado` : `Día ${dia}`}
                        >
                            <span className={`text-xs ${seleccionado ? 'font-black' : entrenado ? 'font-bold text-white' : ''}`}>
                                {dia}
                            </span>
                            {entrenado && (
                                <span
                                    className={`w-1 h-1 rounded-full mt-0.5 ${
                                        seleccionado ? 'bg-black' : 'bg-[var(--color-primary)]'
                                    }`}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
