interface TituloPaginaProps {
  titulo: string;
  subtitulo?: string;
  className?: string;
}

export default function TituloPagina({ titulo, subtitulo, className = '' }: TituloPaginaProps) {
  return (
    <div className={className}>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
        {titulo}
      </h1>
      {subtitulo && (
        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
          {subtitulo}
        </p>
      )}
    </div>
  );
}
