import { AppLayout } from '../componentes';
import Boton from '../componentes/ui/Boton';
import Input from '../componentes/ui/Input';

export default function PerfilPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Mi Perfil</h1>
          <p className="text-neutral-400 mt-2">Gestiona tu información y preferencias de entrenamiento.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Foto y Stats */}
          <section className="space-y-6">
            <div className="bg-neutral-800/50 p-8 rounded-3xl border border-white/5 text-center">
              <div className="w-32 h-32 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center text-black text-4xl font-black">
                JD
              </div>
              <h2 className="text-xl font-bold">Juan Doe</h2>
              <p className="text-neutral-500 text-sm">Miembro desde Feb 2026</p>
            </div>
            
            <div className="bg-neutral-800/50 p-6 rounded-3xl border border-white/5">
              <h3 className="text-sm font-bold uppercase text-neutral-500 mb-4">Logros</h3>
              <div className="flex gap-3 flex-wrap">
                {[' 7 Días', ' 500kg', ' Pro'].map(badge => (
                  <span key={badge} className="bg-neutral-900 px-3 py-1 rounded-full text-xs border border-white/10">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Columna Derecha: Formulario */}
          <section className="lg:col-span-2 bg-neutral-800/50 p-8 rounded-3xl border border-white/5">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre de usuario" type="text" placeholder="juandoe_fit" />
                <Input label="Email" type="email" placeholder="juan@ejemplo.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Peso (kg)" type="number" placeholder="80" />
                <Input label="Altura (cm)" type="number" placeholder="180" />
                <Input label="Edad" type="number" placeholder="25" />
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <Boton variant="primary">Guardar Cambios</Boton>
              </div>
            </form>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}