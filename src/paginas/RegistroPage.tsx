import FormularioRegistro from '../componentes/forms/FormularioRegistro';
import Logo from '../componentes/Logo';

export default function RegistroPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-neutral-800/20 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
                
                <div className="flex flex-col items-center space-y-3">
                    <Logo />
                    <div className="text-center">
                        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Crea tu cuenta</h1>
                        <p className="text-neutral-500 text-sm">Empieza a trackear tus sets hoy mismo</p>
                    </div>
                </div>

                <FormularioRegistro />

                <div className="text-center pt-2">
                    <p className="text-neutral-500 text-xs">
                        ¿Ya tienes cuenta?{' '}
                        <a href="/login" className="text-accent hover:text-accent/80 font-bold transition-colors">
                            Inicia sesión
                        </a>
                    </p>
                </div>
            </div>
            
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-800/10 blur-[150px] rounded-full"></div>
            </div>
        </div>
    );
}