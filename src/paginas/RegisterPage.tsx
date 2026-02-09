// paginas/RegisterPage.tsx
import { AppLayout, RegisterForm, Logo } from '../componentes';

export const RegisterPage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Logo />
            <h1 className="text-3xl font-bold mt-4">DAILYSET</h1>
            <p className="text-neutral-400 mt-2">Únete a la comunidad</p>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              Crear Cuenta
            </h2>

            <RegisterForm />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-400">
                ¿Ya tienes cuenta?{" "}
                <a href="/login" className="text-accent font-medium hover:text-accent/80">
                  Inicia Sesión
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};