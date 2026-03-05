import React from 'react';
import { AppLayout, TituloPagina, Card, BotonPrimario } from "../componentes";
import LineChartElement from '../componentes/charts/LineChartElement';

export default function EjercicioDetallePage() {
  const ejercicio = {
    nombre: "Press de Banca",
    descripcion: "Baja la barra lentamente hacia el pecho, manteniendo los codos a 45 grados.",
  };

  const historial = [
    { fecha: "29 Enero", peso: 80, reps: 5 },
    { fecha: "18 Marzo", peso: 95, reps: 6 },
    { fecha: "7 Junio", peso: 110, reps: 8 },
    { fecha: "14 Septiembre", peso: 135, reps: 6 },
    { fecha: "23 Diciembre", peso: 145, reps: 8 },
  ];

  const datosResumen = historial.map((item) => ({
    name: item.fecha,
    value: item.peso,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TituloPagina titulo={ejercicio.nombre} />
          <BotonPrimario>+ Añadir a Rutina</BotonPrimario>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="aspect-video flex items-center justify-center" hoverable={false}>
            <div className="text-center">
              <svg className="w-16 h-16 text-neutral-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6" hoverable={false}>
              <h3 className="font-bold mb-2" style={{ color: 'var(--color-primary)' }}>Descripción</h3>
              <p className="text-neutral-300 text-sm">{ejercicio.descripcion}</p>
            </Card>

            <Card className="p-6" hoverable={false}>
              <LineChartElement
                items={datosResumen}
                title="Progreso de peso (kg)"
                height={120}
                showGrid={false}
                lineColor="#ff9900"
              />
            </Card>
          </div>
        </div>

        <Card className="p-6" hoverable={false}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--color-primary)' }}>Historial</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <span className="text-neutral-400 font-bold">Fecha</span>
            <span className="text-neutral-400 font-bold">Peso</span>
            <span className="text-neutral-400 font-bold">Reps</span>
            {historial.map((item, index) => (
              <React.Fragment key={index}>
                <span className="text-white">{item.fecha}</span>
                <span className="text-white">{item.peso} kg</span>
                <span className="text-white">{item.reps}</span>
              </React.Fragment>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
