import Logo from '../shared/Logo';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <Logo size="lg" />
        </div>
        <p className="text-neutral-300">Cargando...</p>
        <div className="mt-8">
          <div className="w-8 h-8 border-2 border-[#DBF059] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
