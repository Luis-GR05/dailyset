import { Input } from '../';

export default function FormularioRegistro() {
    return (
        <form className="space-y-5 w-full" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">Nombre</span>
                <Input
                    type="text"
                    placeholder="Tu nombre"
                    className="bg-white/5 border-white/10 rounded-2xl py-5 text-white w-full transition-all"
                />
            </div>

            <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">Email</span>
                <Input
                    type="email"
                    placeholder="atleta@dailyset.com"
                    className="bg-white/5 border-white/10 rounded-2xl py-5 text-white w-full transition-all"
                />
            </div>

            <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">Password</span>
                <Input
                    type="password"
                    placeholder="Contraseña"
                    className="bg-white/5 border-white/10 rounded-2xl py-5 text-white w-full transition-all"
                />
            </div>

            <div className="space-y-2 pb-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">Confirmar Password</span>
                <Input
                    type="password"
                    placeholder="Repite contraseña"
                    className="bg-white/5 border-white/10 rounded-2xl py-5 text-white w-full transition-all"
                />
            </div>

            <button
                className="w-full text-black font-black py-4 rounded-full transition-all active:scale-95 uppercase text-sm tracking-widest italic"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    boxShadow: '0 15px 30px var(--color-primary-glow)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)'; }}
            >
                Registrarse Ahora
            </button>
        </form>
    );
}