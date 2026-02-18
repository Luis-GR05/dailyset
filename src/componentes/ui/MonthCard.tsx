import { useState } from 'react';
import MesCalendario from './MesCalendario';
import Card from './Card';

interface MonthCardProps {
    mes: number;
    anio: number;
    entrenamientos: number[];
}

export default function MonthCard({ mes, anio, entrenamientos }: MonthCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const nombreMes = new Date(anio, mes).toLocaleString('es-ES', { month: 'long' });

    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className={`
            relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer border
            ${isOpen ? 'bg-neutral-900 border-[#DBF059] shadow-[0_0_30px_rgba(219,240,89,0.15)] col-span-full md:col-span-2 row-span-2' : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800'}
        `}
        >
            <div className="p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white capitalize">{nombreMes}</h3>
                    <p className="text-sm text-neutral-400 font-medium">{anio}</p>
                </div>

                <div className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${isOpen ? 'bg-[#DBF059] text-black' : 'bg-neutral-800 text-neutral-300'}`}>
                    <span className="font-bold">{entrenamientos.length}</span>
                    <span className="text-xs font-bold uppercase">Sesiones</span>
                </div>
            </div>

            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden px-6">
                    <div className="pt-4 border-t border-neutral-800">
                        <MesCalendario mes={mes} anio={anio} entrenamientos={entrenamientos} />

                        <div className="mt-4 flex gap-4 text-sm">
                            <div className="flex-1 bg-neutral-800/50 rounded-xl p-3 text-center">
                                <p className="text-neutral-400 text-xs uppercase mb-1">Volumen</p>
                                <p className="text-white font-bold">45.2k <span className="text-[#DBF059]">kg</span></p>
                            </div>
                            <div className="flex-1 bg-neutral-800/50 rounded-xl p-3 text-center">
                                <p className="text-neutral-400 text-xs uppercase mb-1">Intensidad</p>
                                <p className="text-white font-bold">Alta</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}