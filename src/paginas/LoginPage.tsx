import Logo from "../componentes/Logo";
import { LoginForm } from "../componentes";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-neutral-800/30 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                
                {/* Cabecera del Login */}
                <div className="flex flex-col items-center space-y-4">
                    <Logo />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Bienvenido de nuevo</h1>
                        <p className="text-neutral-400 mt-2">Introduce tus credenciales para entrenar</p>
                    </div>
                </div>

                {/* Formulario */}
                <LoginForm />

                {/* Footer del Login */}
                <div className="text-center pt-4">
                    <p className="text-neutral-500 text-sm">
                        ¿No tienes cuenta?{' '}
                        <a href="/registro" className="text-accent hover:underline font-bold">
                            Regístrate gratis
                        </a>
                    </p>
                </div>
            </div>
            
            {/* Decoración sutil de fondo para nivel premium */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-700/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full"></div>
            </div>
        </div>
    );
}