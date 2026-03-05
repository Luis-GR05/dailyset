import { useState } from "react";
import { AppLayout, TituloPagina } from "../componentes";

export default function PerfilConfigPage() {
  const [nombre, setNombre] = useState("JUAN PÉREZ");
  const [editando, setEditando] = useState(false);
  const [unidadesKg, setUnidadesKg] = useState(true);
  const [notificaciones, setNotificaciones] = useState(false);

  const handleGuardarNombre = () => {
    setEditando(false);
  };

  const handleCerrarSesion = () => {
    if(confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      window.location.href = "/login";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-10 max-w-4xl mx-auto">
        <TituloPagina titulo="Configuración del Sistema" />

        <div className="space-y-3">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">Datos de Usuario</h3>
          
          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all group">
              <div className="flex-1 mr-4">
                <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mb-1">Nombre de usuario</p>
                {editando ? (
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value.toUpperCase())}
                    className="bg-white/10 border-b border-[#DBF059] text-white font-black italic uppercase outline-none w-full py-1"
                    autoFocus
                  />
                ) : (
                  <p className="text-white font-black italic uppercase">{nombre}</p>
                )}
              </div>
              
              <button 
                onClick={() => editando ? handleGuardarNombre() : setEditando(true)}
                className="text-[#DBF059] text-[10px] font-black uppercase tracking-widest hover:scale-110 transition-all"
              >
                {editando ? "GUARDAR" : "MODIFICAR"}
              </button>
            </div>

            <div className="px-6 py-5 rounded-xl bg-white/[0.02] cursor-not-allowed opacity-70">
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mb-1">Correo electrónico</p>
              <p className="text-white font-black italic lowercase">juan.perez@email.com</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">Preferencias Técnicas</h3>
          
          <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-2 backdrop-blur-xl space-y-1">
            <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer" onClick={() => setUnidadesKg(!unidadesKg)}>
              <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">
                Unidades de peso ({unidadesKg ? "Kilogramos" : "Libras"})
              </span>
              <button className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${unidadesKg ? 'bg-[#DBF059]' : 'bg-neutral-700'}`}>
                <div className={`w-4 h-4 bg-black rounded-full absolute top-0.5 transition-all duration-300 ${unidadesKg ? 'right-0.5' : 'left-0.5 bg-white'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between px-6 py-5 rounded-xl hover:bg-white/5 transition-all cursor-pointer" onClick={() => setNotificaciones(!notificaciones)}>
              <span className="text-zinc-300 font-black text-[11px] italic tracking-widest uppercase">Notificaciones de descanso</span>
              <button className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${notificaciones ? 'bg-[#DBF059]' : 'bg-neutral-700'}`}>
                <div className={`w-4 h-4 bg-black rounded-full absolute top-0.5 transition-all duration-300 ${notificaciones ? 'right-0.5' : 'left-0.5 bg-white'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2 italic">Seguridad y Cuenta</h3>
          
          <div className="flex flex-col md:flex-row gap-3">
            <button 
              onClick={() => alert("Cambio de contraseña enviado")}
              className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
            >
              Cambiar contraseña
            </button>
            <button 
              onClick={handleCerrarSesion}
              className="flex-1 border border-red-500/30 text-red-500 py-4 rounded-xl font-black italic uppercase text-[10px] tracking-[0.2em] hover:bg-red-500/10 transition-all active:scale-95"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}