import { AppLayout, TituloPagina, Card } from "../componentes";
import ColumnChart from "../componentes/charts/columnChart";
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const rutinas = [
    { id: 1, nombre: "Rutina A", descripcion: "Pecho y tríceps", seleccionada: false },
    { id: 2, nombre: "Rutina B", descripcion: "Espalda y bíceps", seleccionada: false },
    { id: 3, nombre: "Rutina C", descripcion: "Pierna", seleccionada: false },
  ];

  const diasSemana = [
    { dia: "L", valor1: 1860 },
    { dia: "M", valor1: 2380 },
    { dia: "X", valor1: 2220 },
    { dia: "J", valor1: 4590 },
    { dia: "V", valor1: 1250 },
    { dia: "S", valor1: 0 },
    { dia: "D", valor1: 6220 },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <TituloPagina titulo="Resumen de la actividad" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rutinas.map((rutina) => (
            <Link key={rutina.id} to="/mis-rutinas/entrenamiento" className="block">
              <Card
                className={`p-6 h-full ${rutina.seleccionada ? "border-[#DBF059]" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#4361EE] rounded-full flex items-center justify-center">
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{rutina.nombre}</h3>
                    <p className="text-neutral-400 text-sm">{rutina.descripcion}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>


        <Card className="p-6" hoverable={false}>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="text-center">
                <p className="text-white font-bold text-sm md:text-base">Progreso</p>
                <p className="text-white font-bold text-sm md:text-base">Semanal</p>
              </div>
            </div>

            <div className="flex-1 w-full h-64 md:h-80">
              <ColumnChart
                data={diasSemana}
                xAxisKey="dia"
                bars={[
                  { key: "valor1", color: "var(--color-brand-primary)", name: "Valor 1" },
                ]}
                height="100%"
              />
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}