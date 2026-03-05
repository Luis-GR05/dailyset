import { Link } from "react-router-dom";
import { Input } from "../";

export default function LoginForm() {
  return (
    <form className="space-y-5 w-full" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">Email</span>
        <Input
          type="email"
          placeholder="atleta@dailyset.com"
          className="bg-white/5 border-white/10 rounded-2xl py-5 text-white w-full transition-all"
          style={{ '--focus-border': 'var(--color-accent)' } as React.CSSProperties}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between px-4">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Password</span>
          <button
            type="button"
            className="text-[10px] font-black transition-colors uppercase tracking-tighter"
            style={{ color: 'var(--color-accent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          >
            ¿Olvidaste tu clave?
          </button>
        </div>
        <Input
          type="password"
          placeholder="••••••••"
          className="bg-white/5 border-white/10 rounded-2xl py-5 text-white w-full transition-all"
        />
      </div>

      <Link to="/dashboard" className="block pt-2">
        <button
          className="group relative w-full overflow-hidden text-black font-black py-4 rounded-full transition-all active:scale-95 uppercase text-sm tracking-widest italic"
          style={{
            backgroundColor: 'var(--color-primary)',
            boxShadow: '0 15px 30px var(--color-primary-glow)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-hover)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)'; }}
        >
          <span className="relative z-10 italic">Iniciar Sesión</span>
        </button>
      </Link>
    </form>
  );
}