import { Link } from 'react-router-dom';
import { Input, Boton, Logo } from '../componentes';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden md:flex flex-1 items-center justify-center">
        <Logo size="lg" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-neutral-900 rounded-3xl p-8 border border-neutral-800">
          <div className="flex items-center justify-between mb-8">
            <Link to="/">
              <Boton variant="primary">Volver</Boton>
            </Link>
            <h2 className="text-2xl font-display font-bold text-white">Iniciar Sesión</h2>
          </div>

          <form className="space-y-6">
            <Input label="Email" type="email" placeholder="Value" />
            <Input label="Password" type="password" placeholder="Value" />

            <Link to="/dashboard">
              <Boton variant="secondary" className="w-full mt-4">
                Sign In
              </Boton>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}