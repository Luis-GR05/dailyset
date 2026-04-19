import { useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../componentes/shared/Logo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import fondoLanding from "../assets/imagenes/fondoLanding.jpg";
import mancuerna from "../assets/imagenes/mancuerna.png";
import { useI18n } from "../context/I18nContext";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);
  const { t, locale } = useI18n();
  const landingCopy = {
    featureTags: locale === 'es' ? ["Rutinas", "Progreso", "Estadísticas"] : ["Routines", "Progress", "Stats"],
    tickerWords: locale === 'es'
      ? ["FUERZA", "DISCIPLINA", "RUTINAS", "PROGRESO", "ENTRENAMIENTOS", "RESULTADOS", "CONSTANCIA", "EVOLUCIÓN"]
      : ["STRENGTH", "DISCIPLINE", "ROUTINES", "PROGRESS", "WORKOUTS", "RESULTS", "CONSISTENCY", "EVOLUTION"],
    whyChooseUs: locale === 'es' ? 'Por qué elegirnos' : 'Why choose us',
    whatMakesUsDifferent1: locale === 'es' ? 'Lo que nos hace' : 'What makes us',
    whatMakesUsDifferent2: locale === 'es' ? 'diferente' : 'different',
    learnMore: locale === 'es' ? 'Saber más' : 'Learn more',
    process: locale === 'es' ? 'El proceso' : 'The process',
    socialProof1: locale === 'es' ? 'Más de' : 'More than',
    socialProof2: locale === 'es' ? 'atletas' : 'athletes',
    socialProof3: locale === 'es' ? 'ya están entrenando' : 'are already training',
    reviews: locale === 'es' ? '5.0 · 2,400 reseñas' : '5.0 · 2,400 reviews',
    startFree: locale === 'es' ? 'Empieza gratis' : 'Start free',
    ctaNow: locale === 'es' ? '✦ El momento es ahora ✦' : '✦ The time is now ✦',
    noCreditCard: locale === 'es' ? 'Sin tarjeta de crédito · Gratis para siempre' : 'No credit card · Free forever',
    privacy: locale === 'es' ? 'Privacidad' : 'Privacy',
    terms: locale === 'es' ? 'Términos' : 'Terms',
    contact: locale === 'es' ? 'Contacto' : 'Contact',
    heroTitle1: locale === 'es' ? 'ENTRENA' : 'TRAIN',
    heroTitle2: locale === 'es' ? 'MÁS DURO' : 'HARDER',
    heroTitle3: locale === 'es' ? 'CADA DÍA' : 'EVERY DAY',
    activeUsers: locale === 'es' ? 'Usuarios activos' : 'Active users',
    exercises: locale === 'es' ? 'Ejercicios' : 'Exercises',
    satisfaction: locale === 'es' ? 'Satisfacción' : 'Satisfaction',
  };

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.from(".hero-badge", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          ".hero-title",
          { y: 40, opacity: 0, duration: 1.0, ease: "power4.out" },
          "-=0.4"
        )
        .from(
          ".hero-subtitle",
          { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" },
          "-=0.5"
        )
        .from(
          ".hero-ctas",
          { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" },
          "-=0.4"
        )
        .from(
          ".hero-stats",
          { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" },
          "-=0.3"
        );

      gsap.to(".hero-icon", {
        y: -18,
        rotation: 6,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".btn-pulse", {
        boxShadow: "0 0 0 12px rgba(219, 240, 89, 0)",
        duration: 1.4,
        repeat: -1,
        ease: "power2.out",
      });

      gsap.to(".orb-1", {
        x: 60,
        y: -40,
        scale: 1.15,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".orb-2", {
        x: -50,
        y: 50,
        scale: 0.85,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".orb-3", {
        x: 30,
        y: 60,
        scale: 1.2,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Ticker tape
      gsap.to(".ticker-inner", {
        x: "-50%",
        duration: 18,
        repeat: -1,
        ease: "none",
      });

      gsap.utils.toArray<Element>(".feature-card").forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          y: 60,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: i * 0.12,
        });
      });

      gsap.from(".steps-track", {
        scrollTrigger: {
          trigger: ".steps-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        x: -40,
        duration: 1,
        ease: "power3.out",
      });

      gsap.utils.toArray<Element>(".step-item").forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: ".steps-section",
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: "back.out(1.7)",
          delay: 0.1 + i * 0.18,
        });
      });

      gsap.from(".cta-container", {
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        scale: 0.92,
        opacity: 0,
        duration: 1.1,
        ease: "elastic.out(1, 0.6)",
      });

      gsap.utils.toArray<Element>(".stat-num").forEach((el) => {
        const htmlEl = el as HTMLElement;
        gsap.from(htmlEl, {
          scrollTrigger: { trigger: htmlEl, start: "top 85%" },
          textContent: 0,
          duration: 1.8,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate() {
            htmlEl.textContent =
              Math.round(parseFloat(htmlEl.textContent || "0")).toString() +
              (htmlEl.dataset.suffix || "");
          },
        });
      });
    },
    { scope: container }
  );

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: t.landing.feature1CardTitle,
      desc: t.landing.feature1CardDesc,
      tag: landingCopy.featureTags[0],
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t.landing.feature2CardTitle,
      desc: t.landing.feature2CardDesc,
      tag: landingCopy.featureTags[1],
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: t.landing.feature3CardTitle,
      desc: t.landing.feature3CardDesc,
      tag: landingCopy.featureTags[2],
    },
  ];

  const tickerWords = landingCopy.tickerWords;

  return (
    <div ref={container} className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "var(--color-black)", color: "var(--color-white)" }}>

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 md:px-10"
        style={{ background: "linear-gradient(to bottom, rgba(5,5,5,0.95) 0%, transparent 100%)", backdropFilter: "blur(12px)" }}>
        <Logo size="lg" />
        <Link to="/login">
          <button
            className="btn-pulse relative overflow-hidden px-5 py-2.5 md:px-7 md:py-3 rounded-full font-bold text-sm transition-all"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-black)",
              fontFamily: "'Montserrat', sans-serif",
              boxShadow: "0 0 20px var(--color-primary-glow)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-primary-hover)";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-primary)";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            {t.landing.ctaStartAlt}
          </button>
        </Link>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen pt-24 pb-16 px-5 overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={fondoLanding} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.5) 0%, rgba(5,5,5,0.2) 40%, rgba(5,5,5,0.95) 100%)" }} />
        </div>

        {/* Animated orbs */}
        <div className="orb-1 absolute top-24 -left-20 w-96 h-96 rounded-full blur-[130px] opacity-30" style={{ backgroundColor: "var(--color-primary)" }} />
        <div className="orb-2 absolute bottom-10 -right-20 w-80 h-80 rounded-full blur-[120px] opacity-25" style={{ backgroundColor: "var(--color-accent)" }} />
        <div className="orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-15" style={{ backgroundColor: "var(--color-primary)" }} />

        {/* Noise grain overlay */}
        <div className="absolute inset-0 z-[1] opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">

          {/* Icon */}
          <div className="hero-icon w-24 h-24 md:w-32 md:h-32 flex items-center justify-center mb-6 mx-auto">
            <img src={mancuerna} alt="Mancuerna" className="w-full h-full object-contain"
              style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 24px rgba(255,255,255,0.5))" }} />
          </div>

          {/* Title */}
          <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span style={{ display: "block" }}>{landingCopy.heroTitle1}</span>
            <span style={{ display: "block", WebkitTextStroke: "2px var(--color-primary)", WebkitTextFillColor: "transparent" }}>
              {landingCopy.heroTitle2}
            </span>
            <span style={{ display: "block" }}>{landingCopy.heroTitle3}</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-base md:text-lg mb-8 max-w-lg leading-relaxed"
            style={{ color: "var(--color-neutral-3000)" }}>
            {t.landing.heroSubtitleAlt}
          </p>

          {/* CTAs */}
          <div className="hero-ctas flex flex-col sm:flex-row items-center gap-3 mb-12">
            <Link to="/login">
              <button
                className="btn-pulse relative px-9 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-black)",
                  fontFamily: "'Montserrat', sans-serif",
                  boxShadow: "0 0 30px var(--color-primary-glow)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = "scale(1.05)";
                  el.style.boxShadow = "0 0 40px var(--color-primary-glow)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = "scale(1)";
                  el.style.boxShadow = "0 0 30px var(--color-primary-glow)";
                }}
              >
                {t.landing.ctaStartAlt} →
              </button>
            </Link>

          </div>

          {/* Stats row */}
          <div className="hero-stats flex items-center gap-8 md:gap-14">
            {[
              { num: "10", suffix: "K+", label: landingCopy.activeUsers },
              { num: "500", suffix: "+", label: landingCopy.exercises },
              { num: "98", suffix: "%", label: landingCopy.satisfaction },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="stat-num text-2xl md:text-3xl font-black" data-target={s.num} data-suffix={s.suffix}
                  style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--color-primary)" }}>
                  {s.num}{s.suffix}
                </span>
                <span className="text-xs mt-1 tracking-wide uppercase" style={{ color: "var(--color-neutral-3000)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div className="relative overflow-hidden py-4 border-y" style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(219,240,89,0.04)" }}>
        <div className="ticker-inner flex whitespace-nowrap" style={{ width: "max-content" }}>
          {[...tickerWords, ...tickerWords, ...tickerWords, ...tickerWords].map((word, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6 text-xs font-black tracking-widest uppercase"
              style={{ fontFamily: "'Montserrat', sans-serif", color: i % 3 === 0 ? "var(--color-primary)" : "var(--color-neutral-3000)" }}>
              {word} <span style={{ color: "var(--color-primary)", opacity: 0.4 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section className="features-section py-20 md:py-32 px-5 md:px-10">
        <div className="max-w-6xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-4">
            <div>
              <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: "var(--color-primary)", fontFamily: "'Montserrat', sans-serif" }}>
                {landingCopy.whyChooseUs}
              </p>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Montserrat', sans-serif", lineHeight: 1.0 }}>
                {landingCopy.whatMakesUsDifferent1}<br />
                <span style={{ WebkitTextStroke: "1.5px var(--color-primary)", WebkitTextFillColor: "transparent" }}>{landingCopy.whatMakesUsDifferent2}</span>
              </h2>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--color-neutral-3000)" }}>
              {t.landing.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card group relative rounded-2xl p-7 cursor-default overflow-hidden transition-all duration-400"
                style={{
                  backgroundColor: "var(--color-neutral-800)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(219,240,89,0.35)";
                  el.style.backgroundColor = "var(--color-neutral-700)";
                  el.style.transform = "translateY(-6px)";
                  el.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(219,240,89,0.08)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(255,255,255,0.06)";
                  el.style.backgroundColor = "var(--color-neutral-800)";
                  el.style.transform = "";
                  el.style.boxShadow = "";
                }}
              >
                {/* Subtle corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "radial-gradient(circle at top right, rgba(219,240,89,0.12), transparent 70%)" }} />

                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(219,240,89,0.1)", color: "var(--color-primary)" }}>
                    {f.icon}
                  </div>
                  <span className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "var(--color-neutral-3000)", fontFamily: "'Montserrat', sans-serif" }}>
                    {f.tag}
                  </span>
                </div>

                <h4 className="font-black text-lg mb-2 tracking-tight"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--color-white)" }}>
                  {f.title}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-neutral-3000)" }}>
                  {f.desc}
                </p>

                <div className="mt-5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors"
                  style={{ color: "var(--color-primary)", fontFamily: "'Montserrat', sans-serif" }}>
                  {landingCopy.learnMore} <span className="ml-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STEPS ─── */}
      <section className="steps-section py-20 md:py-32 px-5 md:px-10 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(219,240,89,0.2), transparent)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(219,240,89,0.2), transparent)" }} />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: "var(--color-primary)", fontFamily: "'Montserrat', sans-serif" }}>
              {landingCopy.process}
            </p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {t.landing.howItWorks}
            </h2>
          </div>

          <div className="steps-track relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-2/3 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(219,240,89,0.3) 20%, rgba(219,240,89,0.3) 80%, transparent)" }} />

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 md:justify-between max-w-2xl mx-auto">
              {[
                { num: "01", label: t.landing.step1 },
                { num: "02", label: t.landing.step2 },
                { num: "03", label: t.landing.step3 },
              ].map((step, i) => (
                <div key={i} className="step-item flex flex-col items-center text-center relative z-10 px-6">
                  <div
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg mb-5 transition-transform duration-300"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-black)",
                      fontFamily: "'Montserrat', sans-serif",
                      boxShadow: "0 0 30px rgba(219,240,89,0.3)",
                    }}
                  >
                    {step.num}
                    <div className="absolute inset-0 rounded-2xl opacity-50"
                      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)" }} />
                  </div>
                  <p className="font-black text-sm uppercase tracking-wide max-w-[120px]"
                    style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--color-white)" }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF STRIP ─── */}
      <section className="py-14 px-5 md:px-10" style={{ backgroundColor: "var(--color-neutral-800)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-center md:text-left"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {landingCopy.socialProof1} <span style={{ color: "var(--color-primary)" }}>10,000</span> {landingCopy.socialProof2}<br />
            {landingCopy.socialProof3}
          </p>
          <div className="flex items-center gap-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--color-primary)" }}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm font-bold ml-1" style={{ color: "var(--color-neutral-3000)" }}>{landingCopy.reviews}</span>
          </div>
          <Link to="/login">
            <button
              className="px-7 py-3 rounded-full font-black text-sm uppercase tracking-wider transition-all"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-black)",
                fontFamily: "'Montserrat', sans-serif",
                boxShadow: "0 0 20px var(--color-primary-glow)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              {landingCopy.startFree}
            </button>
          </Link>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="cta-section relative py-20 md:py-36 px-5 md:px-10 overflow-hidden">
        <div className="orb-1 absolute -top-20 right-0 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 pointer-events-none"
          style={{ backgroundColor: "var(--color-primary)" }} />
        <div className="orb-2 absolute -bottom-20 left-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15 pointer-events-none"
          style={{ backgroundColor: "var(--color-accent)" }} />

        <div className="cta-container relative max-w-3xl mx-auto text-center">
          <p className="text-xs font-black tracking-widest uppercase mb-5" style={{ color: "var(--color-primary)", fontFamily: "'Montserrat', sans-serif" }}>
            {landingCopy.ctaNow}
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6"
            style={{ fontFamily: "'Montserrat', sans-serif", lineHeight: 0.95 }}>
            {t.landing.ctaFinalTitleAlt}
          </h2>
          <p className="mb-10 text-sm md:text-base max-w-md mx-auto leading-relaxed" style={{ color: "var(--color-neutral-3000)" }}>
            {t.landing.ctaFinalSubAlt}
          </p>

          <Link to="/login">
            <button
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-black text-base uppercase tracking-wider transition-all"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-black)",
                fontFamily: "'Montserrat', sans-serif",
                boxShadow: "0 0 50px var(--color-primary-glow), 0 8px 32px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = "scale(1.05) translateY(-2px)";
                el.style.boxShadow = "0 0 60px var(--color-primary-glow), 0 16px 40px rgba(0,0,0,0.5)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = "scale(1)";
                el.style.boxShadow = "0 0 50px var(--color-primary-glow), 0 8px 32px rgba(0,0,0,0.4)";
              }}
            >
              {t.landing.ctaFinalBtnAlt}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </Link>

          <p className="mt-5 text-xs" style={{ color: "var(--color-neutral-2000)" }}>
            {landingCopy.noCreditCard}
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ backgroundColor: "var(--color-neutral-800)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="md" />
          <p className="text-xs text-center" style={{ color: "var(--color-neutral-2000)" }}>
            &copy; {t.landing.footerText}
          </p>
          <div className="flex items-center gap-5 text-xs font-semibold" style={{ color: "var(--color-neutral-3000)" }}>
            <a href="#" className="hover:opacity-80 transition-opacity">{landingCopy.privacy}</a>
            <a href="#" className="hover:opacity-80 transition-opacity">{landingCopy.terms}</a>
            <a href="#" className="hover:opacity-80 transition-opacity">{landingCopy.contact}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
