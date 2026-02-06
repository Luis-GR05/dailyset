export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-around">
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 bg-gray-700 rounded mb-1"></div>
        <span className="text-xs">Dashboard</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 bg-gray-700 rounded mb-1"></div>
        <span className="text-xs">Historial</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 bg-gray-700 rounded mb-1"></div>
        <span className="text-xs">Ejercicios</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 bg-gray-700 rounded mb-1"></div>
        <span className="text-xs">Estadísticas</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 bg-gray-700 rounded mb-1"></div>
        <span className="text-xs">Perfil</span>
      </div>
    </div>
  );
}