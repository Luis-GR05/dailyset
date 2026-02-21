import { Link } from 'react-router-dom';
import { Input, Logo } from '../componentes';
import DotGrid from '../componentes/FondoAnimado';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-[#0a0a0a]">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotGrid
          dotSize={4} gap={20} baseColor="#271E37" activeColor="#5227FF"
          proximity={120} shockRadius={250} shockStrength={5}
          resistance={750} returnDuration={1.5}
        />
      </div>

      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none" 
           style={{ background: 'radial-gradient(circle at 20% 50%, #5227FF 0%, transparent 50%)' }}>
      </div>

      <div className="relative z-10 flex w-full min-h-screen">
        
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 relative">
          
          <div className="absolute top-1/4 translate-y-[-100px] flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md animate-bounce-slow">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] bg-neutral-800" />
              ))}
            </div>
            <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">+10K Atletas</span>
          </div>

          <div className="text-center group">
            <Logo size="xl" className="transition-transform duration-500 group-hover:scale-105" />
            
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#DBF059]"></div>
              <p className="text-[#DBF059] font-black tracking-[0.4em] text-xs uppercase italic">
                Domina tu progreso
              </p>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#DBF059]"></div>
            </div>
          </div>

          <div className="absolute bottom-1/4 translate-y-[100px] grid grid-cols-2 gap-8 text-center border-t border-white/5 pt-8 w-64">
            <div>
              <p className="text-white font-black text-xl italic">100%</p>
              <p className="text-neutral-500 text-[9px] uppercase tracking-tighter">Enfoque</p>
            </div>
            <div>
              <p className="text-[#DBF059] font-black text-xl italic">∞</p>
              <p className="text-neutral-500 text-[9px] uppercase tracking-tighter">Consistencia</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-2xl rounded-[40px] p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white mb-2 italic">BIENVENIDO</h2>
              <div className="h-1 w-12 bg-[#DBF059] mx-auto rounded-full mb-4"></div>
              <p className="text-neutral-400 text-sm">Tu próximo set empieza aquí</p>
            </div>

            <form className="space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">Email</span>
                <Input type="email" placeholder="atleta@dailyset.com" className="bg-white/5 border-white/5 focus:border-[#DBF059]/50 rounded-2xl py-5 transition-all" />
              </div>
              
              <div className="space-y-2 pb-2">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">Contraseña</span>
                <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/5 focus:border-[#DBF059]/50 rounded-2xl py-5 transition-all" />
              </div>

              <button className="group relative w-full overflow-hidden bg-[#DBF059] text-black font-black py-5 rounded-2xl transition-all hover:pr-8 active:scale-95 shadow-[0_15px_30px_rgba(219,240,89,0.15)]">
                <span className="relative z-10">INICIAR SESIÓN</span>
                <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all font-bold">→</span>
              </button>
            </form>

            <div className="text-center mt-10">
              <p className="text-neutral-500 text-sm">
                ¿Nuevo en DailySet?{' '}
                <Link to="/registro" className="text-white font-black hover:text-[#DBF059] transition-colors ml-1 uppercase text-xs tracking-wider">
                  Únete a la élite
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}} />
    </div>
  );
}