import Card from './Card';

export default function ResumenEstadisticas() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="p-6 text-center">
                <h3 className="text-neutral-400 text-sm uppercase font-bold mb-2">Volumen Total</h3>
                <p className="text-3xl font-bold text-white">125.4 <span className="text-[#DBF059] text-xl">Ton</span></p>
            </Card>

            <Card className="p-6 text-center">
                <h3 className="text-neutral-400 text-sm uppercase font-bold mb-2">Intensidad</h3>
                <p className="text-3xl font-bold text-white">Alta 🔥</p>
            </Card>

            <Card className="p-6 text-center">
                <h3 className="text-neutral-400 text-sm uppercase font-bold mb-2">Disciplina</h3>
                <p className="text-3xl font-bold text-white">85% 🎯</p>
            </Card>
        </div>
    );
}

