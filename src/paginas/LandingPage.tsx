import { Link } from 'react-router-dom';
import Logo from '../componentes/shared/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-8 py-6">
        <Logo size="lg" />
        <Link to="/login">
          <button className="bg-[#4361EE] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#3651D6] transition-all">
            Empezar
          </button>
        </Link>
      </header>

      <section className="relative flex flex-col items-center justify-center text-center py-32 md:py-44 px-8 overflow-hidden">
        <div className="w-32 h-32 bg-neutral-800 rounded-2xl flex items-center justify-center mb-8">
          <svg className="w-16 h-16 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight mb-6">
          DOMINA TU PROGRESO
        </h2>
        <p className="text-neutral-400 text-lg mb-10 max-w-md">
          La app definitiva para tus entrenamientos de fuerza
        </p>
        <Link to="/login">
          <button className="bg-[#DBF059] text-black px-12 py-4 rounded-full font-display font-bold text-sm uppercase tracking-wide hover:bg-[#c8dc42] hover:scale-105 transition-all">
            Empezar
          </button>
        </Link>
      </section>

      <section className="bg-[#121212] py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-2xl font-display font-bold mb-3">Lo que nos hace diferente</h3>
          <p className="text-center text-neutral-400 mb-14 max-w-lg mx-auto">
            Diseña tus rutinas y deja que la app gestione el entrenamiento por ti
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 text-center hover:border-[#DBF059]/30 transition-all">
              <div className="w-24 h-24 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">Sin Plantillas Rígidas</h4>
              <p className="text-neutral-400 text-sm">Crea rutinas 100% personalizadas</p>
            </div>

            <div className="bg-neutral-800 border-2 border-[#DBF059] rounded-2xl p-6 text-center">
              <div className="w-24 h-24 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">Sobrecarga Progresiva</h4>
              <p className="text-neutral-400 text-sm">Seguimiento automático de tu progreso</p>
            </div>

            <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 text-center hover:border-[#DBF059]/30 transition-all">
              <div className="w-24 h-24 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">Rápido y Offline</h4>
              <p className="text-neutral-400 text-sm">Funciona sin conexión a internet</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-2xl font-display font-bold mb-14">Cómo funciona DailySet</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#DBF059] text-black rounded-full flex items-center justify-center font-display font-black text-xl mb-4">
                1
              </div>
              <p className="font-bold">Diseña</p>
            </div>

            <div className="hidden md:block w-28 h-0.5 bg-neutral-700"></div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#DBF059] text-black rounded-full flex items-center justify-center font-display font-black text-xl mb-4">
                2
              </div>
              <p className="font-bold">Registra</p>
            </div>

            <div className="hidden md:block w-28 h-0.5 bg-neutral-700"></div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#DBF059] text-black rounded-full flex items-center justify-center font-display font-black text-xl mb-4">
                3
              </div>
              <p className="font-bold">Analiza</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-28 px-8 overflow-hidden">
        <div className="absolute -top-20 right-10 w-80 h-80 bg-[#DBF059]/20 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-[#4361EE]/25 blur-[100px] rounded-full"></div>
        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-[#DBF059]/10 blur-[80px] rounded-full"></div>
        
        <div className="relative max-w-2xl mx-auto text-center bg-[#4361EE] rounded-3xl p-14">
          <h3 className="text-3xl md:text-4xl font-display font-black mb-4">
            Deja el papel en el pasado.
          </h3>
          <p className="text-white/80 mb-8">
            Empieza a controlar tu mejor versión hoy mismo.
          </p>
          <Link to="/login">
            <button className="bg-[#DBF059] text-black px-10 py-4 rounded-full font-display font-bold text-sm uppercase tracking-wide hover:bg-[#c8dc42] hover:scale-105 transition-all">
              Comenzar
            </button>
          </Link>
        </div>
      </section>

      <footer className="bg-[#121212] py-8 px-8 text-center">
        <p className="text-neutral-500 text-sm">
          &copy; 2026 DailySet - Tu compañero de entrenamiento
        </p>
      </footer>
    </div>
  );
}