import { Input } from "../"; 
import { Link } from "react-router-dom";

export default function LoginForm() {
  return (
    <form className="space-y-5 w-full" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-4">
          Email
        </span>
        <Input 
          type="email" 
          placeholder="atleta@dailyset.com" 
          className="bg-white/5 border-white/10 focus:border-[#DBF059]/50 rounded-2xl py-5 text-white transition-all w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between px-4">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
            Password
          </span>
          <button type="button" className="text-[10px] text-[#4361EE] font-black hover:text-[#DBF059] transition-colors uppercase">
            ¿Olvidaste tu clave?
          </button>
        </div>
        <Input 
          type="password" 
          placeholder="••••••••" 
          className="bg-white/5 border-white/10 focus:border-[#DBF059]/50 rounded-2xl py-5 text-white transition-all w-full"
        />
      </div>

      <button className="w-full bg-[#DBF059] text-black font-black py-4 rounded-full hover:bg-[#c9dd4a] transition-all shadow-[0_10px_30px_rgba(219,240,89,0.3)] active:scale-95 uppercase text-sm tracking-widest mt-4">
        Iniciar Sesión
      </button>
    </form>
  );
}