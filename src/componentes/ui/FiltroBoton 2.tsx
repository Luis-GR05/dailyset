interface FiltroBotonProps {
  nombre: string;
  activo: boolean;
  onClick?: () => void;
}

export default function FiltroBoton({ nombre, activo, onClick }: FiltroBotonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn-pill ${activo ? "active" : ""}`}
    >
      {nombre}
    </button>
  );
}
