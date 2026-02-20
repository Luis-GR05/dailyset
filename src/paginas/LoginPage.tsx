import { Link } from 'react-router-dom';
import { Input, Boton, Logo } from '../componentes';
import DotGrid from '../componentes/FondoAnimado';
// Asegúrate de que la ruta de importación sea la correcta para tu proyecto

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-[#0a0a0a]">
      
      {/* FONDO DE PUNTOS INTERACTIVO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotGrid
          dotSize={4}
          gap={20}
          baseColor="#271E37"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* CONTENIDO (Sobre el fondo) */}
      <div className="relative z-10 flex w-full min-h-screen">
        
        {/* Lado Izquierdo: Logo (Visible solo en escritorio) */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <Logo size="lg" />
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <Link to="/">
                <Boton variant="primary">Volver</Boton>
              </Link>
              <h2 className="text-2xl font-display font-bold text-white">Iniciar Sesión</h2>
            </div>

            <form className="space-y-6">
              <Input label="Email" type="email" placeholder="tu@email.com" />
              <Input label="Password" type="password" placeholder="••••••••" />

              <Link to="/dashboard">
                <Boton variant="secondary" className="w-full mt-4">
                  Sign In
                </Boton>
              </Link>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}