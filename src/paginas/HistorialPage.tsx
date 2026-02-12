import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, CardMes, Card } from "../componentes";

export default function HistorialPage() {
  const meses = [
    { nombre: "Enero", seleccionado: true },
    { nombre: "Febrero", seleccionado: false },
    { nombre: "Marzo", seleccionado: false },
    { nombre: "Abril", seleccionado: false },
    { nombre: "Mayo", seleccionado: false },
    { nombre: "Junio", seleccionado: false },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <TituloPagina titulo="Historial de entrenamientos" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {meses.map((mes, index) => (
            <Link key={index} to="/historial/2026-01-24" className="block">
              <CardMes nombre={mes.nombre} seleccionado={mes.seleccionado} />
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="px-6 py-4" hoverable={false}>
            <span className="text-neutral-400">Resumen Mensual: </span>
            <span className="text-white font-bold">14 entrenamientos</span>
          </Card>
          <Card className="px-6 py-4" hoverable={false}>
            <span className="text-neutral-400">Volumen Total: </span>
            <span className="text-white font-bold">45000Kg</span>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}