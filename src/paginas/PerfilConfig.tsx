import { AppLayout, TituloPagina, Card } from "../componentes";

export default function PerfilConfigPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <TituloPagina titulo="Configuración Perfil" />

        <div className="space-y-4">
          <h3 className="text-neutral-400 text-xs uppercase tracking-wide">Datos Personales</h3>

          <Card className="px-6 py-4 flex items-center justify-between" hoverable={false}>
            <div>
              <p className="text-neutral-500 text-xs">Nombre de usuario</p>
              <p className="text-white">Juan Pérez</p>
            </div>
            <button className="text-neutral-400 hover:text-white transition-all text-sm">
              Editar
            </button>
          </Card>

          <Card className="px-6 py-4" hoverable={false}>
            <p className="text-neutral-500 text-xs">Correo electrónico</p>
            <p className="text-white">juan.perez@email.com</p>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-neutral-400 text-xs uppercase tracking-wide">Preferencias</h3>

          <Card className="px-6 py-4 flex items-center justify-between" hoverable={false}>
            <span className="text-white">Unidades de peso (kg / lbs)</span>
            <button className="w-12 h-6 bg-[#4361EE] rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </button>
          </Card>

          <Card className="px-6 py-4 flex items-center justify-between" hoverable={false}>
            <span className="text-white">Notificaciones de descanso</span>
            <button className="w-12 h-6 bg-neutral-600 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
            </button>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-neutral-400 text-xs uppercase tracking-wide">Seguridad</h3>

          <div className="flex flex-col md:flex-row gap-4">
            <button className="flex-1 bg-[#DBF059] text-black py-3 md:py-4 rounded-2xl font-bold hover:bg-[#c8dc42] transition-all text-sm md:text-base">
              Cambiar contraseña
            </button>
            <button className="flex-1 border-2 border-red-500 text-red-500 py-3 md:py-4 rounded-2xl font-bold hover:bg-red-500/10 transition-all border-dashed text-sm md:text-base">
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}