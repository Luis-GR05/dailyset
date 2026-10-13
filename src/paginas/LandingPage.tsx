import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../componentes/shared/Logo";
import ConcaveCarousel, { type CarouselItem } from "../componentes/landing/ConcaveCarousel";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "../context/I18nContext";
import {
  ArrowUpRight,
  CheckCircle2,
  Smartphone,
  Zap,
  Timer,
  BarChart3,
  Star,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const DAILY_LETTERS = ["D", "A", "I", "L", "Y"];
const SET_LETTERS = ["S", "E", "T"];

const ROUTINE_ITEMS: CarouselItem[] = [
  {
    id: "r1",
    tag: "Fuerza Pura",
    tagEn: "Pure Strength",
    titulo: "Power & Hypertrophy",
    tituloEn: "Power & Hypertrophy",
    subtitulo: "Powerlifting clásico con RIR progresivo",
    subtituloEn: "Classic powerlifting with progressive RIR",
    detalles: "4 días/sem · Sentadilla, Press, Peso Muerto. Control de sobrecarga milimétrico serie a serie.",
    detallesEn: "4 days/wk · Squat, Bench, Deadlift. Millimetric progressive overload set by set.",
    tasa: "95% éxito",
    tasaEn: "95% success",
    imagen: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "r2",
    tag: "Hipertrofia 365",
    tagEn: "Hypertrophy 365",
    titulo: "Muscle Mass Pro",
    tituloEn: "Muscle Mass Pro",
    subtitulo: "Volumen y densidad muscular máxima",
    subtituloEn: "Maximum muscle volume and density",
    detalles: "5 días/sem · Split Push/Pull/Legs con métricas de volumen y tonelaje semanal automatizadas.",
    detallesEn: "5 days/wk · Push/Pull/Legs split with automated volume & weekly tonnage metrics.",
    tasa: "92% éxito",
    tasaEn: "92% success",
    imagen: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "r3",
    tag: "Atleta Híbrido",
    tagEn: "Hybrid Athlete",
    titulo: "Strength & Endurance",
    tituloEn: "Strength & Endurance",
    subtitulo: "Fuerza + cardio integrados en un único plan",
    subtituloEn: "Strength + cardio integrated in a single plan",
    detalles: "6 días/sem · Combina trabajo de fuerza con zonas de cardio Z2 y HIIT para rendimiento total.",
    detallesEn: "6 days/wk · Combines strength work with Z2 cardio and HIIT for total performance.",
    tasa: "89% éxito",
    tasaEn: "89% success",
    imagen: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "r4",
    tag: "VBT & Velocidad",
    tagEn: "VBT & Speed",
    titulo: "Velocity Based",
    tituloEn: "Velocity Based",
    subtitulo: "Entrenamiento basado en velocidad de barra",
    subtituloEn: "Bar velocity based training protocol",
    detalles: "4 días/sem · VBT con control de m/s por serie. Indicado para deportistas de élite y powerlifters avanzados.",
    detallesEn: "4 days/wk · VBT with m/s control per set. Designed for elite athletes and advanced powerlifters.",
    tasa: "97% élite",
    tasaEn: "97% elite",
    imagen: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "r5",
    tag: "Calistenia",
    tagEn: "Calisthenics",
    titulo: "Bodyweight Mastery",
    tituloEn: "Bodyweight Mastery",
    subtitulo: "Control total del peso corporal",
    subtituloEn: "Total bodyweight control",
    detalles: "5 días/sem · Progresiones hacia muscle-up, planche y handstand. Sin equipamiento necesario.",
    detallesEn: "5 days/wk · Progressions toward muscle-up, planche and handstand. No equipment needed.",
    tasa: "91% éxito",
    tasaEn: "91% success",
    imagen: "https://images.unsplash.com/photo-1616803689943-5601631c7fec?q=80&w=800&auto=format&fit=crop",
  },
];

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
      // 1. Entrada cinematográfica del Hero original
      const tl = gsap.timeline();
      tl.from(".hero-word", {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.18,
        ease: "power4.out",
      }).from(
        ".hero-visual-card",
        { scale: 0.95, opacity: 0, duration: 1.0, ease: "power3.out" },
        "-=0.6"
      );

      // 2. Animación en scroll para el Banner de Filosofía
      gsap.from(".filosofia-image", {
        scale: 1.15,
        opacity: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#filosofia",
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      gsap.from(".filosofia-strip", {
        xPercent: -20,
        opacity: 0,
        duration: 1.0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#filosofia",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".filosofia-text", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".filosofia-text",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      // 3. Animación en scroll para las tarjetas de Rutinas ("DailySet en Movimiento")
      gsap.to(".big-number-parallax", {
        yPercent: -25,
        ease: "none",
        scrollTrigger: {
          trigger: "#en-movimiento",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".routine-card").forEach((card, i) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          delay: i * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // 4. Animación en scroll de la Cita de Prensa & Medios
      gsap.from(".press-quote-box", {
        scale: 0.92,
        opacity: 0,
        y: 40,
        duration: 1.0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".press-quote-box",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".press-logo-item", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".press-logos-container",
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });

      // 5. Animación en scroll de la sección de Descarga de App
      gsap.from(".app-device-card", {
        y: 60,
        opacity: 0,
        rotationY: -10,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#descarga-app",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".app-feature-row", {
        x: -30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".app-features-group",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      // 6. Animación palabra a palabra: gris -> blanco al hacer scroll en #comenzar
      gsap.utils.toArray<HTMLElement>(".moment-word").forEach((word) => {
        gsap.fromTo(
          word,
          { color: "#3f3f46" },
          {
            color: "#ffffff",
            ease: "none",
            scrollTrigger: {
              trigger: word,
              start: "top 88%",
              end: "top 55%",
              scrub: 0.8,
            },
          }
        );
      });

      // Entrada del stat monumental
      gsap.from(".moment-stat", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".moment-stat",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      // Trazado de la línea ondulada atlética que aparece progresivamente según el scroll
      gsap.fromTo(
        ".stat-line-reveal-rect",
        { attr: { width: 0 } },
        {
          attr: { width: 1200 },
          ease: "none",
          scrollTrigger: {
            trigger: ".moment-stat",
            start: "top 80%",
            end: "bottom 35%",
            scrub: 1.2,
          },
        }
      );

      // Entrada de las tarjetas de programa
      gsap.utils.toArray<HTMLElement>(".moment-card").forEach((card, i) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.75,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".moment-cards-row",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // ─── 7. ANIMACIÓN KINÉTICA DE CARGA LETRA A LETRA: "DAILY SET" ───
      const brandTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".brand-letters-wrapper",
          start: "top 95%",
          end: "top 62%",
          scrub: 0.6,
        },
      });

      // Línea de carga progresiva que completa al 100%
      brandTl.fromTo(
        ".brand-loading-bar",
        { width: "0%" },
        { width: "100%", ease: "none" }
      );

      // Letras kinetica DAILY SET letra a letra al unísono con la barra
      brandTl.fromTo(
        ".brand-letter-char",
        {
          opacity: 0.1,
          y: 35,
          scale: 0.94,
          filter: "blur(4px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          stagger: 0.04,
          ease: "power2.out",
        },
        0
      );
    },
    { scope: container }
  );

  return (
    <div
      ref={container}
      className="min-h-screen selection:bg-[var(--color-primary)] selection:text-black overflow-x-clip font-sans"
      style={{ backgroundColor: "var(--color-black)", color: "var(--color-white)", overflowX: "clip" }}
    >
      {/* ─── 1. BARRA SUPERIOR EDITORIAL FIJA ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 md:px-12 py-4"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.65) 85%, transparent 100%)",
          backdropFilter: "blur(18px)",
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

      {/* ─── 2. HERO ORIGINAL: ESTRUCTURA "MOTION. DISCIPLINE. RESULT." SOBRE LA FOTO ─── */}
      <section className="relative min-h-[42vh] sm:min-h-[48vh] flex flex-col pt-16 sm:pt-20 pb-0 overflow-hidden">
        {/* Fondo sutil con gradiente */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/10 blur-[160px] pointer-events-none -z-10" />

        {/* Fotografía Hero con el texto superpuesto encima (más estrecha) */}
        <div className="hero-visual-card relative flex-1 min-h-[34vh] sm:min-h-[40vh] max-h-[420px] overflow-hidden bg-neutral-950 flex flex-col justify-between">
          <img
            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1600&auto=format&fit=crop"
            alt="Corredor atleta portada"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-65 filter grayscale contrast-125"
          />
          {/* Degradados cinemáticos para que el texto sea nítido y legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/25 to-black pointer-events-none" />

          {/* Encabezado tres columnas "Motion. Discipline. Result." SUPERPUESTO ENCIMA DE LA FOTO */}
          <div className="relative z-10 pt-6 sm:pt-8 px-5 sm:px-8 md:px-12 pb-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 items-start border-b border-white/15 pb-4 sm:pb-5">
              <div className="hero-word">
                <h1
                  className="font-black uppercase tracking-tight text-white leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
                  style={{ fontSize: "clamp(2.2rem, 4.4vw, 4.2rem)" }}
                >
                  Motion.
                </h1>
              </div>

              <div className="hero-word">
                <h1
                  className="font-black uppercase tracking-tight leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
                  style={{ color: "var(--color-primary)", fontSize: "clamp(2.2rem, 4.4vw, 4.2rem)" }}
                >
                  Discipline.
                </h1>
              </div>

              <div className="hero-word flex flex-col lg:items-end lg:text-right">
                <h1
                  className="font-black uppercase tracking-tight text-white leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
                  style={{ fontSize: "clamp(2.2rem, 4.4vw, 4.2rem)" }}
                >
                  Result.
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. BANNER EDITORIAL DE RESISTENCIA Y FILOSOFÍA 365 ─── */}
      <section id="filosofia" className="relative py-24 px-5 sm:px-8 md:px-12 bg-black overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Imagen deportiva en blanco y negro con la franja horizontal */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] sm:aspect-[16/10]">
            <img
              src="/Imagenes/dailyset.jpg"
              alt="DailySet atleta"
              className="filosofia-image w-full h-full object-cover grayscale contrast-125 brightness-90 will-change-transform"
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* Franja horizontal amarillo flúor */}
            <div
              className="filosofia-strip absolute top-1/2 -translate-y-1/2 left-0 right-0 py-3 sm:py-4 px-4 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl z-10"
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

          {/* Tipografía editorial de impacto a la derecha */}
          <div className="filosofia-text lg:col-span-5 space-y-6 lg:pl-6">
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

      {/* ─── 6. "DAILYSET EN MOVIMIENTO" ─── */}
      <section id="en-movimiento" className="relative py-24 px-5 sm:px-8 md:px-12 bg-neutral-950 overflow-hidden">

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Encabezado centrado */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-4">
            <div className="space-y-3 max-w-xl">
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                {locale === "es" ? "DailySet en Movimiento" : "DailySet in Motion"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {locale === "es"
                  ? "Cada serie cuenta una historia. Un vistazo a la energía, el foco y el esfuerzo diario que definen la excelencia atlética."
                  : "Every stride tells a story. A look back at the energy, focus, and grit that defined endurance."}
              </p>
            </div>
            <Link to="/registro" className="shrink-0">
              <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap">
                {locale === "es" ? "VER TODAS LAS RUTINAS →" : "VIEW ALL ROUTINES →"}
              </button>
            </Link>
          </div>

        </div>

        {/* Carousel 3D Cóncavo a ancho completo */}
        <div className="w-full relative z-10">
          <ConcaveCarousel items={ROUTINE_ITEMS} locale={locale} autoDrift={true} />
        </div>

      </section>



      {/* ─── 8. SECCIÓN DE DESCARGA DE LA APP ─── */}
      <section id="descarga-app" className="relative py-24 px-5 sm:px-8 md:px-12 bg-neutral-950 border-t border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[var(--color-primary)]/10 blur-[160px] pointer-events-none -z-0" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                {locale === "es"
                  ? "DESCARGA DAILYSET EN IOS Y ANDROID"
                  : "DOWNLOAD DAILYSET ON IOS & ANDROID"}
              </h2>

              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xl">
                {locale === "es"
                  ? "Lleva tu entrenamiento al siguiente nivel. Puedes descargar la app tanto en Apple App Store como en Google Play Store para registrar cada serie, controlar descansos y seguir tus marcas en tiempo real dentro y fuera del gimnasio."
                  : "Take your workouts to the next level. Download the app on both Apple App Store and Google Play Store to track every set, rest timers, and your progress in real-time."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#descarga-app"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open("https://www.apple.com/app-store/", "_blank");
                  }}
                  className="bg-white hover:bg-neutral-100 px-5 py-3 rounded-2xl border border-white/30 shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer group"
                >
                  <img
                    src="/Imagenes/Apple_Store.png"
                    alt="Descargar en Apple App Store"
                    className="h-8 sm:h-9 w-auto object-contain"
                  />
                </a>

                <a
                  href="#descarga-app"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open("https://play.google.com/store", "_blank");
                  }}
                  className="bg-white hover:bg-neutral-100 px-5 py-3 rounded-2xl border border-white/30 shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer group"
                >
                  <img
                    src="/Imagenes/Google_Play_2022_logo.svg.png"
                    alt="Disponible en Google Play"
                    className="h-7 sm:h-8 w-auto object-contain"
                  />
                </a>
              </div>

              <div className="app-features-group grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
                <div className="app-feature-row flex items-center gap-2 text-neutral-300">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
                  <span>{locale === "es" ? "Persistencia 100% Offline" : "100% Offline Ready"}</span>
                </div>
                <div className="app-feature-row flex items-center gap-2 text-neutral-300">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
                  <span>{locale === "es" ? "Sincronización instantánea" : "Instant Cloud Sync"}</span>
                </div>
                <div className="app-feature-row flex items-center gap-2 text-neutral-300">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
                  <span className="flex items-center gap-1.5">
                    <span>4.9</span>
                    <Star size={13} className="text-amber-400 fill-amber-400 inline" />
                    <span>{locale === "es" ? "en ambas tiendas" : "on both stores"}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="app-device-card relative w-full max-w-sm rounded-3xl p-6 bg-gradient-to-b from-neutral-900 to-black border border-white/15 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center text-[var(--color-primary)]">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">DailySet Mobile</h4>
                      <p className="text-[10px] text-neutral-400 font-mono">iOS & Android</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-black text-[10px] font-black uppercase">
                    PRO APP
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-neutral-950/80 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{locale === "es" ? "Entrenamiento Activo" : "Active Workout"}</p>
                        <p className="text-[10px] text-neutral-400">{locale === "es" ? "Persistencia en vivo serie a serie" : "Live set-by-set persistence"}</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                  </div>

                  <div className="p-3 rounded-2xl bg-neutral-950/80 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                        <Timer size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{locale === "es" ? "Temporizador Inteligente" : "Smart Rest Timer"}</p>
                        <p className="text-[10px] text-neutral-400">{locale === "es" ? "Avisos acústicos y hápticos" : "Audio & haptic cues"}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-white">90s</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-neutral-950/80 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                        <BarChart3 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{locale === "es" ? "Análisis & Récords" : "Analytics & PRs"}</p>
                        <p className="text-[10px] text-neutral-400">{locale === "es" ? "Sobrecarga progresiva automática" : "Auto progressive overload"}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[var(--color-primary)]">+8.5 kg</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 9. EL MOMENTO ES HOY — DISEÑO EDITORIAL ATLÉTICO ─── */}
      <section id="comenzar" className="relative bg-black border-t border-white/5 overflow-hidden">

        {/* ── FILA SUPERIOR: LABEL + TEXTO CON REVEAL PALABRA A PALABRA ── */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 pt-20 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Label izquierda */}
          <div className="lg:col-span-3">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-neutral-500 font-mono">
              {locale === "es" ? "[ EL MOMENTO ES HOY // DAILYSET™ ]" : "[ THE MOMENT IS NOW // DAILYSET™ ]"}
            </span>
          </div>

          {/* Párrafo con reveal palabra a palabra */}
          <div className="lg:col-span-9">
            <p className="text-sm sm:text-base font-bold leading-relaxed tracking-wide uppercase">
              {(locale === "es"
                ? "DA EL PRIMER PASO HOY — ELIGE TU PROGRAMA Y COMIENZA A ENTRENAR. CREA RUTINAS PERSONALIZADAS, REGISTRA CADA CARGA Y LLEVA TU CUERPO AL SIGUIENTE ESCALÓN DE RENDIMIENTO."
                : "TAKE THE FIRST STEP TODAY — CHOOSE YOUR PROGRAM AND START TRAINING. CREATE CUSTOM ROUTINES, TRACK EVERY SET AND PUSH YOUR BODY TO THE NEXT LEVEL OF PERFORMANCE."
              ).split(" ").map((word, i) => (
                <span
                  key={i}
                  className="moment-word inline-block mr-[0.35em]"
                  style={{ color: "#3f3f46" }}
                >
                  {word}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* ── STAT MONUMENTAL ── */}
        <div className="moment-stat relative w-full overflow-hidden py-6 sm:py-10">
          {/* SVG ruta atlética decorativa con revelación animada en scroll */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 220"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="stat-line-reveal-clip">
                <rect className="stat-line-reveal-rect" x="0" y="0" width="0" height="220" />
              </clipPath>
            </defs>
            <g clipPath="url(#stat-line-reveal-clip)">
              <path
                d="M0,140 C100,80 180,160 300,120 C420,80 480,160 600,110 C720,60 800,150 920,100 C1040,55 1100,140 1200,100"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="6 6"
                opacity="0.75"
              />
              <circle cx="300" cy="120" r="5" fill="var(--color-primary)" opacity="0.9" />
              <circle cx="600" cy="110" r="5" fill="var(--color-primary)" opacity="0.9" />
              <circle cx="920" cy="100" r="5" fill="var(--color-primary)" opacity="0.9" />
            </g>
          </svg>

          <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">
            <div
              className="font-black uppercase tracking-tighter text-white leading-none select-none"
              style={{ fontSize: "clamp(5rem, 16vw, 13rem)", color: "rgba(255,255,255,0.08)", WebkitTextStroke: "1px rgba(255,255,255,0.15)" }}
            >
              100,380 KG
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2 px-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono">
                {locale === "es" ? "JUNTOS HEMOS MOVIDO TONELADAS" : "TOGETHER WE'VE MOVED TONS"}
              </p>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono">
                {locale === "es" ? "Y CADA SERIE CUENTA UNA HISTORIA" : "AND EVERY SET TELLS A STORY"}
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* ─── 10. EL GRAN BLOQUE AMARILLO FLÚOR CON ANIMACIÓN DE CARGA DE LETRAS "DAILY SET" ─── */}
      <section
        className="w-full py-16 sm:py-24 px-5 sm:px-8 md:px-14 select-none relative overflow-hidden"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-black)" }}
      >
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Fila superior: Titular y Suscripción */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-black leading-none">
                {locale === "es"
                  ? "TU CAMINO HACIA LA MAESTRÍA COMIENZA AQUÍ Y AHORA"
                  : "YOUR JOURNEY TO MASTERY STARTS HERE AND NOW"}
              </h2>
            </div>

            {/* Newsletter box */}
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

          {/* Enlaces de navegación */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-black/15 text-xs font-black uppercase tracking-wider text-black/80">
            <div className="space-y-2">
              <p className="text-black font-black text-sm">{locale === "es" ? "Plataforma" : "Platform"}</p>
              <p><Link to="/suscripciones" className="hover:underline">{locale === "es" ? "Planes y Cuotas" : "Plans & Rates"}</Link></p>
              <p><Link to="/mis-rutinas" className="hover:underline">{locale === "es" ? "Mis Rutinas" : "My Routines"}</Link></p>
              <p><Link to="/ejercicios" className="hover:underline">{locale === "es" ? "Ejercicios" : "Exercises"}</Link></p>
            </div>
            <div className="space-y-2">
              <p className="text-black font-black text-sm">{locale === "es" ? "Utilidades" : "Utilities"}</p>
              <p><Link to="/utilidades" className="hover:underline">{locale === "es" ? "Temporizador" : "Timer"}</Link></p>
              <p><Link to="/utilidades" className="hover:underline">{locale === "es" ? "Cronómetro" : "Stopwatch"}</Link></p>
              <p><Link to="/utilidades" className="hover:underline">{locale === "es" ? "Pasos Diarios" : "Daily Steps"}</Link></p>
            </div>
            <div className="space-y-2">
              <p className="text-black font-black text-sm">{locale === "es" ? "Comunidad" : "Community"}</p>
              <p><a href="#ingenieria-3d" className="hover:underline">{locale === "es" ? "Biomecánica 3D" : "3D Form"}</a></p>
              <p><a href="#filosofia" className="hover:underline">{locale === "es" ? "Filosofía" : "Philosophy"}</a></p>
              <p><a href="#comenzar" className="hover:underline">{locale === "es" ? "Guía Pro" : "Pro Guide"}</a></p>
            </div>
            <div className="space-y-2">
              <p className="text-black font-black text-sm">{locale === "es" ? "Legal" : "Legal"}</p>
              <p><Link to="/privacidad" className="hover:underline">{locale === "es" ? "Privacidad" : "Privacy"}</Link></p>
              <p><Link to="/terminos" className="hover:underline">{locale === "es" ? "Términos" : "Terms"}</Link></p>
              <p><Link to="/privacidad" className="hover:underline">{locale === "es" ? "Cookies" : "Cookies"}</Link></p>
            </div>
          </div>

          {/* ─── ANIMACIÓN KINÉTICA DE CARGA LETRA A LETRA "DAILY SET" ─── */}
          <div className="brand-letters-wrapper pt-10 border-t border-black/15 overflow-hidden text-center select-none">
            {/* Barra de progreso de carga sutil */}
            <div className="max-w-md mx-auto mb-4 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase text-black/60">
                <span>[ STATUS: KINETIC CHARGE ]</span>
                <span>DAILYSET™ CORE</span>
              </div>
              <div className="w-full h-1 bg-black/15 rounded-full overflow-hidden">
                <div className="brand-loading-bar h-full bg-black rounded-full" />
              </div>
            </div>

            {/* Letras gigantes con revelación en scroll letra a letra */}
            <h1
              className="text-[17vw] sm:text-[16vw] font-black leading-none tracking-tighter uppercase text-black flex items-center justify-center gap-1 sm:gap-4 flex-wrap"
              style={{ fontFamily: "'Big Shoulders Display', 'Bebas Neue', 'Montserrat', sans-serif" }}
            >
              {/* Palabra DAILY */}
              <span className="inline-flex">
                {DAILY_LETTERS.map((char, index) => (
                  <span
                    key={`daily-${index}`}
                    className="brand-letter-char inline-block will-change-transform"
                  >
                    {char}
                  </span>
                ))}
              </span>

              {/* Separador de espacio */}
              <span className="inline-block w-[2vw]" />

              {/* Palabra SET con inclinación deportiva */}
              <span
                className="inline-flex italic"
                style={{ fontStyle: "italic", transform: "skewX(-7deg)" }}
              >
                {SET_LETTERS.map((char, index) => (
                  <span
                    key={`set-${index}`}
                    className="brand-letter-char inline-block will-change-transform"
                  >
                    {char}
                  </span>
                ))}
              </span>
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
