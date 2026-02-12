import { Link } from 'react-router-dom';
import { AppLayout, Card, ImagenPlaceholder } from "../componentes";

export default function HistorialDiaPage() {
  const resumen = {
    rutina: "Torso - hipertrofia",
    puntuacion: 5,
    volumen: "45000kg",
    duracion: "00:15:21",
  };

  const ejercicios = [
    {
      id: 1, nombre: "Press de Banca", series: 4, volumen: "750kg",
      detalles: [
        { serie: "S1", peso: "37.5kg", reps: 5 },
        { serie: "S2", peso: "37.5kg", reps: 5 },
        { serie: "S3", peso: "37.5kg", reps: 5 },
        { serie: "S4", peso: "37.5kg", reps: 5 },
      ],
    },
    {
      id: 2, nombre: "Press Inclinado", series: 3, volumen: "480kg",
      detalles: [
        { serie: "S1", peso: "40kg", reps: 8 },
        { serie: "S2", peso: "40kg", reps: 7 },
        { serie: "S3", peso: "40kg", reps: 5 },
      ],
    },
    {
      id: 3, nombre: "Aperturas con Mancuernas", series: 3, volumen: "252kg",
      detalles: [
        { serie: "S1", peso: "14kg", reps: 12 },
        { serie: "S2", peso: "14kg", reps: 10 },
        { serie: "S3", peso: "14kg", reps: 8 },
      ],
    },
    {
      id: 4, nombre: "Extensión de Tríceps", series: 3, volumen: "300kg",
      detalles: [
        { serie: "S1", peso: "20kg", reps: 12 },
        { serie: "S2", peso: "22kg", reps: 10 },
        { serie: "S3", peso: "22kg", reps: 8 },
      ],
    },
    {
      id: 5, nombre: "Press Francés", series: 3, volumen: "375kg",
      detalles: [
        { serie: "S1", peso: "25kg", reps: 10 },
        { serie: "S2", peso: "25kg", reps: 8 },
        { serie: "S3", peso: "25kg", reps: 7 },
      ],
    },
    {
      id: 6, nombre: "Fondos en Paralelas", series: 3, volumen: "225kg",
      detalles: [
        { serie: "S1", peso: "BW", reps: 15 },
        { serie: "S2", peso: "BW", reps: 12 },
        { serie: "S3", peso: "BW", reps: 10 },
      ],
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/historial">
            <button className="text-white hover:text-neutral-300 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <Card className="px-6 py-4 flex-1" hoverable={false}>
            <h1 className="text-xl font-bold text-white text-center">Lunes, 24 de Enero, 2026</h1>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4" hoverable={false}>
            <p className="text-neutral-400 text-xs mb-1">Rutina realizada:</p>
            <p className="text-[#DBF059] font-bold text-sm">{resumen.rutina}</p>
          </Card>
          <Card className="p-4" hoverable={false}>
            <p className="text-neutral-400 text-xs mb-1">Puntuación sesión:</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-4 h-4 ${star <= resumen.puntuacion ? "text-[#DBF059]" : "text-neutral-600"}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </Card>
          <Card className="p-4" hoverable={false}>
            <p className="text-neutral-400 text-xs mb-1">Volumen Total:</p>
            <p className="text-white font-bold text-sm">{resumen.volumen}</p>
          </Card>
          <Card className="p-4" hoverable={false}>
            <p className="text-neutral-400 text-xs mb-1">Duración:</p>
            <p className="text-white font-bold text-sm">{resumen.duracion}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {ejercicios.map((ejercicio) => (
            <Card key={ejercicio.id} className="p-6" hoverable={false}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <ImagenPlaceholder size="sm" />
                  <div>
                    <h3 className="font-bold text-white text-lg">{ejercicio.nombre}</h3>
                    <p className="text-neutral-400 text-sm">{ejercicio.series} series - {ejercicio.volumen}</p>
                  </div>
                </div>
                <button className="text-neutral-400 hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ejercicio.detalles.map((detalle, index) => (
                  <div key={index} className="bg-neutral-800 rounded-lg px-3 py-2 text-center">
                    <p className="text-[#DBF059] text-xs font-bold">{detalle.serie}:</p>
                    <p className="text-white text-xs">{detalle.peso} x {detalle.reps}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}