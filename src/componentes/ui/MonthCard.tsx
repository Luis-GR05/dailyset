import { useHistorial } from "../../context/HistorialContext";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MesCalendario from './MesCalendario';

interface MonthCardProps {
    mes: number;
    anio: number;
}

export default function MonthCard({ mes, anio }: MonthCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { getSesionesPorMes, getMetricasPorMes } = useHistorial();
    const navigate = useNavigate();

    const entrenamientos = getSesionesPorMes(mes, anio);
    const { volumenKg, intensidad } = getMetricasPorMes(mes, anio);
    const nombreMes = new Date(anio, mes).toLocaleString('es-ES', { month: 'long' });
    const sinSesiones = entrenamientos.length === 0;
    const volumenDisplay = volumenKg >= 1000 ? `${(volumenKg / 1000).toFixed(1)}k` : `${volumenKg}`;

    const handleDiaClick = (dia: number) => {
        const mm = String(mes + 1).padStart(2, '0');
        const dd = String(dia).padStart(2, '0');
        navigate(`/historial/${anio}-${mm}-${dd}`);
    };

    return (
        <div
            onClick={() => !sinSesiones && setIsOpen(!isOpen)}
            className={`
        relative overflow-hidden rounded-3xl transition-all duration-500 border
        ${sinSesiones
                    ? 'bg-neutral-900/20 border-neutral-800/50 opacity-50 cursor-default'
                    : isOpen
                        ? 'bg-neutral-900 border-[#DBF059] shadow-[0_0_30px_rgba(219,240,89,0.15)] cursor-pointer'
                        : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 cursor-pointer'}
      `}
        >
            <div className="p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white capitalize">{nombreMes}</h3>
                    <p className="text-sm text-neutral-400">{anio}</p>
                </div>

                {sinSesiones ? (
                    <div className="px-4 py-2 rounded-full bg-neutral-800/50 text-neutral-600">
                        <span className="text-xs font-bold uppercase">Sin datos</span>
                    </div>
                ) : (
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${isOpen ? 'bg-[#DBF059] text-black' : 'bg-neutral-800 text-neutral-300'}`}>
                        <span className="font-bold">{entrenamientos.length}</span>
                        <span className="text-xs font-bold uppercase">Sesiones</span>
                    </div>
                )}
            </div>

            {!sinSesiones && (
                <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden px-6">
                        <div className="pt-4 border-t border-neutral-800">
                            <MesCalendario mes={mes} anio={anio} entrenamientos={entrenamientos} onDiaClick={handleDiaClick} />
                            <div className="mt-4 flex gap-4">
                                <div className="flex-1 bg-neutral-800/50 rounded-xl p-3 text-center">
                                    <p className="text-neutral-400 text-xs uppercase mb-1">Volumen</p>
                                    <p className="text-white font-bold text-sm">{volumenDisplay} <span className="text-[#DBF059]">kg</span></p>
                                </div>
                                <div className="flex-1 bg-neutral-800/50 rounded-xl p-3 text-center">
                                    <p className="text-neutral-400 text-xs uppercase mb-1">Intensidad</p>
                                    <p className="text-white font-bold text-sm">{intensidad}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}