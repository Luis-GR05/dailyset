interface TituloPaginaProps {
  titulo: string;
  className?: string;
}

export default function TituloPagina({ titulo, className = '' }: TituloPaginaProps) {
  return (
    <h1 className={`text-2xl sm:text-3xl font-black tracking-tight text-white ${className}`}>
      {titulo}
    </h1>
  );
}
