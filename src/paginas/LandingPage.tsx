import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../componentes/shared/Logo';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.hero-content > *', {
      y: 30,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power4.out'
    });

    gsap.to('.hero-icon', {
      y: -15,
      rotation: 5,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.btn-cta', {
      scale: 1.05,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.bg-blob', {
      x: "random(-50, 50)",
      y: "random(-50, 50)",
      scale: "random(0.8, 1.2)",
      duration: "random(4, 8)",
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: {
        amount: 2,
        from: "random"
      }
    });

    const features = gsap.utils.toArray('.feature-card');
    features.forEach((card: any, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: index * 0.1
      });

      gsap.to(card, {
        y: -5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.5
      });
    });

    gsap.from('.step-item', {
      scrollTrigger: {
        trigger: '.steps-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.7)'
    });

    gsap.from('.cta-container', {
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      scale: 0.8,
      opacity: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.5)'
    });

  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6">
        <Logo size="lg" />
        <Link to="/login">
          <button className="bg-[#4361EE] text-white px-4 py-2 md:px-6 rounded-full font-bold text-sm hover:bg-[#3651D6] transition-all">
            Empezar
          </button>
        </Link>
      </header>

      <section className="hero-content relative flex flex-col items-center justify-center text-center py-20 md:py-32 lg:py-44 px-4 md:px-8 overflow-hidden">
        <div className="hero-icon w-24 h-24 md:w-32 md:h-32 bg-neutral-800 rounded-2xl flex items-center justify-center mb-6 md:mb-8 mx-auto">
          <svg className="w-12 h-12 md:w-16 md:h-16 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl md:text-5xl lg:text-7xl font-display font-black uppercase tracking-tight mb-4 md:mb-6">
          DOMINA TU PROGRESO
        </h2>
        <p className="text-neutral-400 text-base md:text-lg mb-8 md:mb-10 max-w-md px-4 mx-auto">
          La app definitiva para tus entrenamientos de fuerza
        </p>
        <Link to="/login">
          <button className="btn-cta bg-[#DBF059] text-black px-8 py-3 md:px-12 md:py-4 rounded-full font-display font-bold text-sm uppercase tracking-wide hover:bg-[#c8dc42] hover:scale-105 transition-all">
            Empezar
          </button>
        </Link>
      </section>

      <section className="features-section bg-[#121212] py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-xl md:text-2xl font-display font-bold mb-3">Lo que nos hace diferente</h3>
          <p className="text-center text-neutral-400 mb-10 md:mb-14 max-w-lg mx-auto text-sm md:text-base">
            Diseña tus rutinas y deja que la app gestione el entrenamiento por ti
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="feature-card bg-neutral-800 border border-neutral-700 rounded-2xl p-6 text-center hover:border-[#DBF059]/30 transition-all">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">Sin Plantillas Rígidas</h4>
              <p className="text-neutral-400 text-sm">Crea rutinas 100% personalizadas</p>
            </div>

            <div className="feature-card bg-neutral-800 border-2 border-[#DBF059] rounded-2xl p-6 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">Sobrecarga Progresiva</h4>
              <p className="text-neutral-400 text-sm">Seguimiento automático de tu progreso</p>
            </div>

            <div className="feature-card bg-neutral-800 border border-neutral-700 rounded-2xl p-6 text-center hover:border-[#DBF059]/30 transition-all">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">Rápido y Offline</h4>
              <p className="text-neutral-400 text-sm">Funciona sin conexión a internet</p>
            </div>
          </div>
        </div>
      </section>

      <section className="steps-section py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-xl md:text-2xl font-display font-bold mb-10 md:mb-14">Cómo funciona DailySet</h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            <div className="step-item flex flex-col items-center">
              <div className="w-14 h-14 bg-[#DBF059] text-black rounded-full flex items-center justify-center font-display font-black text-xl mb-4">
                1
              </div>
              <p className="font-bold">Diseña</p>
            </div>

            <div className="step-item hidden md:block w-28 h-0.5 bg-neutral-700"></div>

            <div className="step-item flex flex-col items-center">
              <div className="w-14 h-14 bg-[#DBF059] text-black rounded-full flex items-center justify-center font-display font-black text-xl mb-4">
                2
              </div>
              <p className="font-bold">Registra</p>
            </div>

            <div className="step-item hidden md:block w-28 h-0.5 bg-neutral-700"></div>

            <div className="step-item flex flex-col items-center">
              <div className="w-14 h-14 bg-[#DBF059] text-black rounded-full flex items-center justify-center font-display font-black text-xl mb-4">
                3
              </div>
              <p className="font-bold">Analiza</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section relative py-16 md:py-28 px-4 md:px-8 overflow-hidden">
        <div className="bg-blob absolute -top-20 right-10 w-80 h-80 bg-[#DBF059]/20 blur-[120px] rounded-full"></div>
        <div className="bg-blob absolute -bottom-20 -left-10 w-72 h-72 bg-[#4361EE]/25 blur-[100px] rounded-full"></div>
        <div className="bg-blob absolute top-1/2 right-1/3 w-40 h-40 bg-[#DBF059]/10 blur-[80px] rounded-full"></div>

        <div className="cta-container relative max-w-2xl mx-auto text-center bg-[#4361EE] rounded-3xl p-8 md:p-14">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-black mb-4">
            Deja el papel en el pasado.
          </h3>
          <p className="text-white/80 mb-6 md:mb-8 text-sm md:text-base">
            Empieza a controlar tu mejor versión hoy mismo.
          </p>
          <Link to="/login">
            <button className="btn-cta bg-[#DBF059] text-black px-8 py-3 md:px-10 md:py-4 rounded-full font-display font-bold text-sm uppercase tracking-wide hover:bg-[#c8dc42] hover:scale-105 transition-all">
              Comenzar
            </button>
          </Link>
        </div>
      </section>

      <footer className="bg-[#121212] py-6 md:py-8 px-4 md:px-8 text-center">
        <p className="text-neutral-500 text-sm">
          &copy; 2026 DailySet - Tu compañero de entrenamiento
        </p>
      </footer>
    </div>
  );
}