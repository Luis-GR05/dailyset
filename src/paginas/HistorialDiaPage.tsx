import { Link, useParams, useNavigate } from 'react-router-dom';
import { AppLayout, Card, ImagenPlaceholder } from "../componentes";
import { useHistorial } from "../context/HistorialContext";

export default function HistorialDiaPage() {
  const { fecha } = useParams<{ fecha: string }>();
  const navigate = useNavigate();
  const { getSesionPorFecha } = useHistorial();

  const sesion = getSesionPorFecha(fecha ?? '');

  if (!sesion) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-neutral-400 text-lg">No se encontró sesión para esta fecha.</p>
          <button onClick={() => navigate('/historial')} className="text-[#4361EE] hover:underline">
            ← Volver al historial
          </button>
        </div>
      </AppLayout>
    );
  }

  const volumenTotal = sesion.ejercicios.reduce((total, ej) =>
    total + ej.series.reduce((t, s) => t + s.kg * s.reps, 0), 0);

  const fecha_ = new Date(sesion.fecha + 'T12:00:00');
  const fechaLegible = fecha_.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <Link to="/historial" className="self-start md:self-auto">
            <button className="text-white hover:text-neutral-300 transition-all p-2 -ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <Card className="px-6 py-4 flex-1 w-full" hoverable={false}>
            <h1 className="text-lg md:text-xl font-bold text-white text-center">{capitalize(fechaLegible)}</h1>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4" hoverable={false}>
            <p className="text-neutral-400 text-xs mb-1">Rutina realizada:</p>
            <p className="text-[#DBF059] font-bold text-sm">{sesion.rutina}</p>
          </Card>
          <Card className="p-4" hoverable={false}>
            <p className="text-neutral-400 text-xs mb-1">Puntuación:</p>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-4 h-4 ${star <= sesion.puntuacion ? 'text-[#DBF059]' : 'text-neutral-600'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </Card>
          <Card className="p-4" hoverable={false}>
            <p className="text-neutral-400 text-xs mb-1">Volumen Total:</p>
            <p className="text-white font-bold text-sm">{volumenTotal.toLocaleString('es-ES')} kg</p>
          </Card>
          <Card className="p-4" hoverable={false}>
            <p className="text-neutral-400 text-xs mb-1">Duración:</p>
            <p className="text-white font-bold text-sm">{sesion.duracionMin} min</p>
          </Card>
        </div>

        <div className="space-y-4">
          {sesion.ejercicios.map((ejercicio, i) => {
            const volEj = ejercicio.series.reduce((t, s) => t + s.kg * s.reps, 0);
            return (
              <Card key={i} className="p-6" hoverable={false}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <ImagenPlaceholder size="sm" />
                    <div>
                      <h3 className="font-bold text-white text-lg">{ejercicio.nombre}</h3>
                      <p className="text-neutral-400 text-sm">{ejercicio.series.length} series · {volEj} kg</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ejercicio.series.map((serie, j) => (
                    <div key={j} className="bg-neutral-800 rounded-lg px-3 py-2 text-center">
                      <p className="text-[#DBF059] text-xs font-bold">S{j + 1}:</p>
                      <p className="text-white text-xs">{serie.kg > 0 ? `${serie.kg}kg` : 'BW'} × {serie.reps}</p>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}