import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../componentes/shared/Logo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "../context/I18nContext";
import {
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Matriz de 3x3 puntos decorativa característica del estilo de las referencias
function DotMatrix({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-3 gap-1 w-5 h-5 ${className}`}>
      {[...Array(9)].map((_, i) => (
        <span key={i} className="w-1 h-1 rounded-full bg-[var(--color-primary)] opacity-80" />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);
  const { locale } = useI18n();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterEnviado, setNewsletterEnviado] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterEnviado(true);
      setTimeout(() => setNewsletterEnviado(false), 4000);
      setNewsletterEmail("");
    }
  };

  useGSAP(
    () => {
      // Entrada del Hero
      const tl = gsap.timeline();
      tl.from(".hero-word", {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.18,
        ease: "power4.out",
      })
        .from(
          ".hero-subcontent",
          { y: 25, opacity: 0, duration: 0.8, ease: "power3.out" },
          "-=0.4"
        )
        .from(
          ".hero-visual-card",
          { scale: 0.95, opacity: 0, duration: 1.0, ease: "power3.out" },
          "-=0.6"
        );

      // Ticker tape continuo
      gsap.to(".ticker-inner", {
        x: "-50%",
        duration: 22,
        repeat: -1,
        ease: "none",
      });

      // Animación de las tarjetas bento y atletas
      gsap.utils.toArray<Element>(".animate-on-scroll").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      });
    },
    { scope: container }
  );

  const tickerWords = locale === "es"
    ? [
        "DAILYSET",
        "DISCIPLINA",
        "SOBRECARGA PROGRESIVA",
        "FUERZA REAL",
        "RENDIMIENTO",
        "RUTINAS IA",
        "MÉTRICAS PRECISAS",
        "CONSTANCIA",
      ]
    : [
        "DAILYSET",
        "DISCIPLINE",
        "PROGRESSIVE OVERLOAD",
        "REAL STRENGTH",
        "PERFORMANCE",
        "AI ROUTINES",
        "ACCURATE METRICS",
        "CONSISTENCY",
      ];

  return (
    <div
      ref={container}
      className="min-h-screen selection:bg-[var(--color-primary)] selection:text-black overflow-x-hidden font-sans"
      style={{ backgroundColor: "var(--color-black)", color: "var(--color-white)" }}
    >
      {/* ─── 1. BARRA SUPERIOR EDITORIAL ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 md:px-12 py-4"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 80%, transparent 100%)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-8">
          <Logo size="md" />
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-black uppercase tracking-widest text-neutral-300 hover:text-white px-3 py-2 transition-colors"
          >
            {locale === "es" ? "Entrar" : "Login"}
          </Link>
          <Link to="/registro">
            <button
              className="group px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <span>{locale === "es" ? "Empezar Gratis" : "Start Free"}</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </header>

      {/* ─── 2. HERO: ESTRUCTURA "MOTION. DISCIPLINE. RESULT." (REFERENCIA 3) ─── */}
      <section className="relative min-h-[92vh] flex flex-col pt-28 pb-0 overflow-hidden">
        {/* Fondo sutil con gradiente */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/10 blur-[160px] pointer-events-none -z-10" />

        {/* Encabezado tres columnas "Motion. Discipline. Result." */}
        <div className="px-5 sm:px-8 md:px-12 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start border-b border-white/10 pb-8">
            <div className="hero-word">
              <h1
                className="font-black uppercase tracking-tight text-white leading-none"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
              >
                Motion.
              </h1>
            </div>

            <div className="hero-word">
              <h1
                className="font-black uppercase tracking-tight leading-none"
                style={{ color: 'var(--color-primary)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
              >
                Discipline.
              </h1>
            </div>

            <div className="hero-word flex flex-col lg:items-end lg:text-right">
              <h1
                className="font-black uppercase tracking-tight text-white leading-none"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
              >
                Result.
              </h1>
            </div>
          </div>
        </div>

        {/* Fotografía Hero ancho completo */}
        <div className="hero-visual-card relative flex-1 overflow-hidden bg-neutral-950" style={{ minHeight: '50vh' }}>
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600&auto=format&fit=crop"
            alt="Atleta entrenando fuerza"
            className="w-full h-full object-cover object-center opacity-70 filter grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          {/* Widget flotante */}
          <div className="absolute top-4 left-4 sm:top-auto sm:bottom-8 sm:left-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 max-w-[260px] sm:max-w-xs z-10">
            <DotMatrix />
            <div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                {locale === "es" ? "Tu Centro de Entrenamiento" : "Your Workout Hub"}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base sm:text-xl font-black text-white">4.9 ★</span>
                <span className="text-[11px] sm:text-xs text-neutral-400">
                  {locale === "es" ? "2.8k Atletas activos" : "2.8k Active Athletes"}
                </span>
              </div>
            </div>
          </div>

          {/* Botón flotante esquina inferior derecha */}
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10">
            <Link to="/registro">
              <button
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-widest text-black flex items-center gap-2 transition-all cursor-pointer shadow-2xl hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <span>{locale === "es" ? "EMPEZAR HOY" : "START TODAY"}</span>
                <ArrowUpRight size={15} />
              </button>
            </Link>
          </div>
        </div>
      </section>


      {/* ─── 3. BANNER EDITORIAL DE RESISTENCIA Y FRANJA AMARILLA (REFERENCIA 1) ─── */}
      <section id="filosofia" className="relative py-20 px-5 sm:px-8 md:px-12 bg-black overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Imagen deportiva en blanco y negro con la franja horizontal atravesando */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] sm:aspect-[16/10]">
            <img
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop"
              alt="Corredor en asfalto"
              className="w-full h-full object-cover grayscale contrast-125 brightness-90"
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* Franja horizontal amarillo flúor cortando la imagen (idéntica a la referencia 1) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 right-0 py-3 sm:py-4 px-4 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl z-10"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-black)" }}
            >
              <div className="space-y-0.5">
                <span className="font-black text-base sm:text-xl tracking-tighter uppercase font-mono">
                  DAILYSET™
                </span>
                <p className="text-[10px] sm:text-xs font-bold max-w-sm leading-tight text-black/90">
                  {locale === "es"
                    ? "Celebramos a los atletas que no persiguen atajos, sino la constancia diaria como filosofía innegociable."
                    : "We celebrate athletes who don't chase shortcuts, but build consistency as an uncompromising mindset."}
                </p>
              </div>

              <Link to="/registro" className="shrink-0">
                <button className="bg-black hover:bg-neutral-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95">
                  {locale === "es" ? "REGÍSTRATE AHORA +" : "REGISTER NOW +"}
                </button>
              </Link>
            </div>
          </div>

          {/* Tipografía editorial de impacto a la derecha (Referencia 1) */}
          <div className="lg:col-span-5 space-y-6 lg:pl-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-primary)] font-mono">
                {locale === "es" ? "FILOSOFÍA 365" : "PHILOSOPHY 365"}
              </span>
              <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-tight text-white leading-[0.95]">
                365 {locale === "es" ? "días de foco," : "days of focus,"}{" "}
                <span className="bg-white text-black px-2 py-0.5 inline-block my-1">
                  {locale === "es" ? "constancia y" : "breath, and"}
                </span>{" "}
                {locale === "es" ? "fuerza pura." : "controlled energy."}
              </h2>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed">
              {locale === "es"
                ? "Diseñado para quienes compiten contra sus propias marcas, no contra el reloj. Entra, encuentra tu ritmo y empuja cada serie un paso más allá."
                : "Designed for athletes who race against themselves, not the clock. Step in, find your rhythm, and push past your limit one set at a time."}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-bold text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                <span>{locale === "es" ? "Sobrecarga Progresiva" : "Progressive Overload"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>{locale === "es" ? "Métricas Reales" : "Real Metrics"}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 4. TICKER INFINITO TAPE MARQUEE ─── */}
      <div
        className="relative overflow-hidden py-4 border-y border-white/10"
        style={{ backgroundColor: "rgba(212,251,52,0.06)" }}
      >
        <div className="ticker-inner flex whitespace-nowrap" style={{ width: "max-content" }}>
          {[...tickerWords, ...tickerWords, ...tickerWords, ...tickerWords].map((word, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 px-6 text-xs sm:text-sm font-black tracking-widest uppercase font-mono"
              style={{
                color: i % 2 === 0 ? "var(--color-primary)" : "var(--color-white)",
              }}
            >
              {word} <span style={{ color: "var(--color-primary)", opacity: 0.6 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── 5. "DAILYSET EN MOVIMIENTO" & NÚMERO GRÁFICO (REFERENCIA 2) ─── */}
      <section id="en-movimiento" className="relative py-24 px-5 sm:px-8 md:px-12 bg-neutral-950 overflow-hidden">
        {/* Número gráfico gigante amarillo flúor recortado en el fondo (como el "42" de la ref 2) */}
        <div
          className="absolute -right-10 top-0 text-[260px] sm:text-[360px] md:text-[460px] font-black leading-none select-none pointer-events-none opacity-20 -z-0 font-mono tracking-tighter"
          style={{ color: "var(--color-primary)" }}
        >
          01
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Columna Izquierda: Texto y Botón "VER TODAS" */}
            <div className="lg:col-span-4 space-y-5">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-primary)] font-mono">
                {locale === "es" ? "PROGRAMAS & RUTINAS" : "PROGRAMS & ROUTINES"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                {locale === "es" ? "DailySet en Movimiento" : "DailySet in Motion"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {locale === "es"
                  ? "Cada serie cuenta una historia. Un vistazo a la energía, el foco y el esfuerzo diario que definen la excelencia atlética."
                  : "Every stride tells a story. A look back at the energy, focus, and grit that defined endurance."}
              </p>
              <Link to="/registro">
                <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer">
                  {locale === "es" ? "VER TODAS LAS RUTINAS" : "VIEW ALL ROUTINES"}
                </button>
              </Link>
            </div>

            {/* Columna Derecha: Tarjetas horizontales de entrenamiento */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tarjeta 1 */}
              <div className="group rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/60 p-4 space-y-3 transition-all hover:border-[var(--color-primary)]/40 hover:-translate-y-1">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop"
                    alt="Fuerza y Powerlifting"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white">
                    {locale === "es" ? "Fuerza Pura" : "Pure Strength"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h4 className="font-black text-white text-base">Power & Hypertrophy</h4>
                    <p className="text-xs text-neutral-400">4 {locale === "es" ? "días / sem · RIR progresivo" : "days/wk · progressive RIR"}</p>
                  </div>
                  <span className="text-xs font-black font-mono text-[var(--color-primary)]">
                    95% {locale === "es" ? "éxito" : "success"}
                  </span>
                </div>
              </div>

              {/* Tarjeta 2 */}
              <div className="group rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/60 p-4 space-y-3 transition-all hover:border-[var(--color-primary)]/40 hover:-translate-y-1">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop"
                    alt="Acondicionamiento y movilidad"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white">
                    {locale === "es" ? "Resistencia & HIIT" : "Endurance & HIIT"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h4 className="font-black text-white text-base">Conditioning Pro</h4>
                    <p className="text-xs text-neutral-400">5 {locale === "es" ? "días / sem · Alta intensidad" : "days/wk · High intensity"}</p>
                  </div>
                  <span className="text-xs font-black font-mono text-[var(--color-primary)]">
                    98% {locale === "es" ? "éxito" : "success"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. BENTO ATLETAS: "TRAIN LIKE A PRO" (REFERENCIA 3) ─── */}
      <section id="atletas" className="py-24 px-5 sm:px-8 md:px-12 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Encabezado con matriz de puntos y Swipe indicator */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DotMatrix />
                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  {locale === "es" ? "Metodología de Élite" : "Elite Coaching"}
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                TRAIN LIKE A PRO
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-primary)]">
              <span>{locale === "es" ? "DISCIPLINA DIARIA" : "DAILY DISCIPLINE"}</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Grid de Atletas y Rutinas de Élite */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Atleta 1 */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/80 p-6 sm:p-8 flex flex-col justify-between aspect-[16/10] sm:aspect-[16/9] group">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=900&auto=format&fit=crop"
                alt="Coach Max Davis"
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="relative z-10 flex items-start justify-between">
                <DotMatrix />
                <Link to="/registro">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                    {locale === "es" ? "VER PROGRAMA ↗" : "BOOK A SESSION ↗"}
                  </span>
                </Link>
              </div>

              <div className="relative z-10 flex items-end justify-between gap-4 pt-12">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase">
                    Max Davis
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {locale === "es" ? "Especialista en Hipertrofia & Fuerza Máxima" : "Hypertrophy & Strength Coach"}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl sm:text-2xl font-black text-white block">9.000h</span>
                  <span className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider">
                    {locale === "es" ? "+700 atletas" : "+700 students"}
                  </span>
                </div>
              </div>
            </div>

            {/* Atleta 2 */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/80 p-6 sm:p-8 flex flex-col justify-between aspect-[16/10] sm:aspect-[16/9] group">
              <img
                src="https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?q=80&w=900&auto=format&fit=crop"
                alt="Coach Alex Mercer"
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="relative z-10 flex items-start justify-between">
                <DotMatrix />
                <Link to="/registro">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                    {locale === "es" ? "VER PROGRAMA ↗" : "BOOK A SESSION ↗"}
                  </span>
                </Link>
              </div>

              <div className="relative z-10 flex items-end justify-between gap-4 pt-12">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase">
                    Alex Mercer
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {locale === "es" ? "Acondicionamiento Físico & Resistencia" : "Conditioning & Endurance Coach"}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl sm:text-2xl font-black text-white block">5.200h</span>
                  <span className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider">
                    {locale === "es" ? "+450 atletas" : "+450 students"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Banner tipográfico inferior "ELEVATE YOUR WORKOUT GAME" */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 p-8 sm:p-12 text-center bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950">
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-tight">
              <span style={{ color: "var(--color-primary)" }}>Elevate</span>{" "}
              <span className="text-white">Your</span>{" "}
              <span style={{ color: "var(--color-primary)" }}>Training</span>{" "}
              <span className="text-white">Game</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto mt-3">
              {locale === "es"
                ? "Una plataforma diseñada para quienes no se conforman con entrenar sin datos. Domina tu progreso."
                : "A platform built for those who never settle for training in the dark. Master your discipline."}
            </p>
          </div>

        </div>
      </section>

      {/* ─── 7. CITA DE PRENSA Y LOGOS PATROCINADORES (REFERENCIA 4) ─── */}
      <section className="py-20 px-5 sm:px-8 md:px-12 bg-neutral-950 border-t border-white/5 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 font-mono">
            {locale === "es" ? "LO QUE DICEN DE NOSOTROS" : "THEY WRITE ABOUT US"}
          </span>

          <h3 className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            &ldquo;
            {locale === "es"
              ? "REVOLUCIONANDO EL ENTRENAMIENTO DE FUERZA CON MÉTRICAS EN TIEMPO REAL, INTELIGENCIA ARTIFICIAL Y UNA DISCIPLINA INQUEBRANTABLE."
              : "REVOLUTIONIZING FITNESS TRAINING WITH AI INSIGHTS, PROGRESSIVE OVERLOAD, AND A THRIVING DISCIPLINE."}
            &rdquo;
          </h3>

          <p className="text-xs text-[var(--color-primary)] font-mono font-bold tracking-widest">
            — DailySet Endurance & Fitness Weekly
          </p>

          {/* Marcas / Medios de prensa de referencia */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-50 grayscale hover:grayscale-0 transition-all text-xs sm:text-sm font-black tracking-widest uppercase font-mono text-neutral-400">
            <span>Men&apos;sHealth</span>
            <span>RUNNER&apos;S WORLD</span>
            <span>IRONMAN</span>
            <span>TRIATHLETE</span>
            <span>FITNESS PRO</span>
          </div>
        </div>
      </section>

      {/* ─── 8. SECCIÓN DIVIDIDA: "DA EL PRIMER PASO HOY" (REFERENCIA 4) ─── */}
      <section id="comenzar" className="py-20 px-5 sm:px-8 md:px-12 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

          {/* Columna Izquierda: Atleta con iluminación de alto contraste */}
          <div className="rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] sm:aspect-auto sm:min-h-[420px]">
            <img
              src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop"
              alt="Ciclista y atleta"
              className="w-full h-full object-cover grayscale contrast-125"
            />
          </div>

          {/* Columna Derecha: Tarjeta oscura con tipografía y CTA flúor */}
          <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-8 sm:p-12 flex flex-col justify-center space-y-6">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-primary)] font-mono">
              {locale === "es" ? "EL MOMENTO ES HOY" : "THE MOMENT IS NOW"}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              {locale === "es"
                ? "DA EL PRIMER PASO HOY — ELIGE TU PROGRAMA Y COMIENZA A ENTRENAR!"
                : "TAKE THE FIRST STEP TODAY — CHOOSE YOUR PROGRAM AND START TRAINING!"}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md">
              {locale === "es"
                ? "Crea rutinas personalizadas, registra cada carga y lleva tu cuerpo al siguiente escalón de rendimiento."
                : "Create custom workouts, track every single set, and elevate your physique to the next level."}
            </p>

            <div>
              <Link to="/registro">
                <button
                  className="px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-black transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {locale === "es" ? "COMENZAR GRATIS" : "GET STARTED"}
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 9. EL GRAN BLOQUE AMARILLO FLÚOR CORPORATIVO (REFERENCIA 4) ─── */}
      <section
        className="w-full py-16 sm:py-20 px-5 sm:px-8 md:px-14 select-none"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-black)" }}
      >
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Fila superior: Titular impactante a la izquierda y Suscripción a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-black leading-none">
                {locale === "es"
                  ? "TU CAMINO HACIA LA MAESTRÍA COMIENZA AQUÍ Y AHORA"
                  : "YOUR JOURNEY TO MASTERY STARTS HERE AND NOW"}
              </h2>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/registro">
                  <button className="px-6 py-2.5 rounded-full bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-neutral-900 transition-all cursor-pointer">
                    {locale === "es" ? "Crear Cuenta Gratis" : "Create Free Account"}
                  </button>
                </Link>
                <Link to="/login">
                  <button className="px-6 py-2.5 rounded-full border-2 border-black text-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all cursor-pointer">
                    {locale === "es" ? "Iniciar Sesión" : "Login"}
                  </button>
                </Link>
              </div>
            </div>

            {/* Newsletter box (idéntico a la referencia 4) */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-black block">
                {locale === "es"
                  ? "SUSCRÍBETE PARA CONSEJOS Y PROGRAMAS EXCLUSIVOS"
                  : "SUBSCRIBE FOR EXCLUSIVE TRAINING TIPS AND UPDATES"}
              </span>

              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={locale === "es" ? "Introduce tu email" : "Enter your email"}
                    required
                    className="w-full bg-black/10 border border-black/20 rounded-full px-4 py-2.5 text-black placeholder:text-black/60 text-xs font-bold outline-none focus:border-black transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-black text-white font-black text-xs uppercase tracking-wider hover:bg-neutral-900 transition-all cursor-pointer shrink-0"
                >
                  {locale === "es" ? "Suscribirse" : "Subscribe"}
                </button>
              </form>

              {newsletterEnviado && (
                <p className="text-xs font-bold text-black flex items-center gap-1 mt-1">
                  <CheckCircle2 size={13} />
                  <span>{locale === "es" ? "¡Gracias por unirte a DailySet!" : "Thanks for joining DailySet!"}</span>
                </p>
              )}
            </div>
          </div>

          {/* Enlaces de navegación en columnas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-black/15 text-xs font-black uppercase tracking-wider text-black/80">
            <div className="space-y-2">
              <p className="text-black font-black text-sm">{locale === "es" ? "Plataforma" : "Platform"}</p>
              <p><Link to="/registro" className="hover:underline">{locale === "es" ? "Mis Rutinas" : "My Routines"}</Link></p>
              <p><Link to="/registro" className="hover:underline">{locale === "es" ? "Ejercicios" : "Exercises"}</Link></p>
              <p><Link to="/registro" className="hover:underline">{locale === "es" ? "Entrenamiento" : "Workout"}</Link></p>
            </div>
            <div className="space-y-2">
              <p className="text-black font-black text-sm">{locale === "es" ? "Utilidades" : "Utilities"}</p>
              <p><Link to="/registro" className="hover:underline">{locale === "es" ? "Temporizador" : "Timer"}</Link></p>
              <p><Link to="/registro" className="hover:underline">{locale === "es" ? "Cronómetro" : "Stopwatch"}</Link></p>
              <p><Link to="/registro" className="hover:underline">{locale === "es" ? "Pasos Diarios" : "Daily Steps"}</Link></p>
            </div>
            <div className="space-y-2">
              <p className="text-black font-black text-sm">{locale === "es" ? "Comunidad" : "Community"}</p>
              <p><a href="#atletas" className="hover:underline">{locale === "es" ? "Atletas" : "Athletes"}</a></p>
              <p><a href="#filosofia" className="hover:underline">{locale === "es" ? "Filosofía" : "Philosophy"}</a></p>
              <p><a href="#comenzar" className="hover:underline">{locale === "es" ? "Guía Pro" : "Pro Guide"}</a></p>
            </div>
            <div className="space-y-2">
              <p className="text-black font-black text-sm">{locale === "es" ? "Legal" : "Legal"}</p>
              <p><a href="#" className="hover:underline">{locale === "es" ? "Privacidad" : "Privacy"}</a></p>
              <p><a href="#" className="hover:underline">{locale === "es" ? "Términos" : "Terms"}</a></p>
              <p><a href="#" className="hover:underline">{locale === "es" ? "Cookies" : "Cookies"}</a></p>
            </div>
          </div>

          {/* TIPOGRAFÍA CONDENSADA GIGANTE A ANCHO COMPLETO: "DAILYSET" (REFERENCIA 4) */}
          <div className="pt-6 border-t border-black/15 overflow-hidden text-center">
            <h1
              className="text-[16vw] font-black leading-none tracking-tighter uppercase text-black select-none pointer-events-none"
              style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
            >
              DAILYSET
            </h1>
          </div>

          {/* Barra final de Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-black/70 pt-2 border-t border-black/10 gap-2">
            <span>© 2026 DailySet. All Rights Reserved.</span>
            <span>Terms and conditions · Privacy policy · Cookies</span>
          </div>

        </div>
      </section>
    </div>
  );
}
