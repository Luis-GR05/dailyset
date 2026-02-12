interface TituloPaginaProps {
  titulo: string;
}

export default function TituloPagina({ titulo }: TituloPaginaProps) {
  return (
    <div className="bg-neutral-900 rounded-2xl px-6 py-4 border border-neutral-800">
      <h1 className="text-xl font-bold text-white">{titulo}</h1>
    </div>
  );
}
