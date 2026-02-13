import ImagenPlaceholder from './ImagenPlaceholder';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({ children, className = '', hoverable = true }: CardProps) {
  return (
    <div className={`card ${hoverable ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface CardRutinaProps {
  nombre: string;
  ejercicios: number;
  duracion: number;
}

export function CardRutina({ nombre, ejercicios, duracion }: CardRutinaProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-6">
        <ImagenPlaceholder size="md" />
        <div>
          <h3 className="font-bold text-white text-lg">{nombre}</h3>
          <p className="text-neutral-400 text-sm">{ejercicios} ejercicios - {duracion} min</p>
        </div>
      </div>
    </Card>
  );
}

interface CardEjercicioProps {
  nombre: string;
  grupo: string;
}

export function CardEjercicio({ nombre, grupo }: CardEjercicioProps) {
  return (
    <Card className="overflow-hidden">
      <div className="w-full aspect-square bg-neutral-800 flex items-center justify-center">
        <ImagenPlaceholder size="lg" className="bg-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white text-sm">{nombre}</h3>
        <p className="text-neutral-400 text-xs">{grupo}</p>
      </div>
    </Card>
  );
}

interface CardMesProps {
  nombre: string;
  seleccionado: boolean;
}

export function CardMes({ nombre, seleccionado }: CardMesProps) {
  return (
    <div
      className={`bg-neutral-900 rounded-2xl p-6 border transition-all cursor-pointer text-center ${seleccionado
          ? "border-[#DBF059]"
          : "border-neutral-800 hover:border-neutral-600"
        }`}
    >
      <h3 className="font-bold text-white mb-4">{nombre}</h3>
      <div className="w-16 h-16 mx-auto border-2 border-neutral-600 rounded-xl flex items-center justify-center">
        <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
}

interface CardEstadisticaProps {
  titulo: string;
  valor: string;
  color?: string;
}

export function CardEstadistica({ titulo, valor, color = "text-[#4361EE]" }: CardEstadisticaProps) {
  return (
    <Card className="p-6 text-center" hoverable={false}>
      <p className="text-neutral-400 text-sm mb-2">{titulo}</p>
      <p className={`text-3xl font-bold ${color}`}>{valor}</p>
    </Card>
  );
}
