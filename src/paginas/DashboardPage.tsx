import { AppLayout, TituloPagina, Card } from "../componentes";

export default function DashboardPage() {
  const rutinas = [
    { id: 1, nombre: "Rutina A", descripcion: "Pecho y tríceps", seleccionada: false },
    { id: 2, nombre: "Rutina B", descripcion: "Espalda y bíceps", seleccionada: true },
    { id: 3, nombre: "Rutina C", descripcion: "Pierna", seleccionada: false },
  ];

  const diasSemana = [
    { dia: "L", valor1: 60, valor2: 40 },
    { dia: "M", valor1: 80, valor2: 50 },
    { dia: "X", valor1: 20, valor2: 0, rojo: true },
    { dia: "J", valor1: 90, valor2: 70 },
    { dia: "V", valor1: 50, valor2: 30 },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <TituloPagina titulo="Resumen de la actividad" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rutinas.map((rutina) => (
            <Card
              key={rutina.id}
              className={`p-6 ${rutina.seleccionada ? "!border-[#DBF059]" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#4361EE] rounded-full"></div>
                <div>
                  <h3 className="font-bold text-white">{rutina.nombre}</h3>
                  <p className="text-neutral-400 text-sm">{rutina.descripcion}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6" hoverable={false}>
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 bg-neutral-800 rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-white font-bold">Progreso</p>
                <p className="text-white font-bold">Semanal</p>
              </div>
            </div>

            <div className="flex-1 flex items-end justify-around h-40 gap-4">
              {diasSemana.map((dia, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-1 h-32">
                    <div
                      className="w-6 bg-[#DBF059] rounded-t"
                      style={{ height: `${dia.valor1}%` }}
                    ></div>
                    <div
                      className={`w-6 rounded-t ${dia.rojo ? "bg-red-500" : "bg-[#4361EE]"}`}
                      style={{ height: `${dia.valor2 || 10}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-bold">{dia.dia}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}