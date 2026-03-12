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
  const { t } = useI18n();

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.from(".hero-animate", {
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
      });

      gsap.to(".hero-icon", {
        y: -15,
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".btn-cta", {
        scale: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".bg-blob", {
        x: "random(-50, 50)",
        y: "random(-50, 50)",
        scale: "random(0.8, 1.2)",
        duration: "random(4, 8)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random",
        },
      });

      const features = gsap.utils.toArray<Element>(".feature-card");
      features.forEach((elemento, index) => {
        gsap.from(elemento, {
          scrollTrigger: {
            trigger: elemento,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: index * 0.1,
        });

        gsap.to(elemento, {
          y: -5,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.5,
        });
      });

      gsap.from(".step-item", {
        scrollTrigger: {
          trigger: ".steps-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
      });

      gsap.from(".cta-container", {
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)",
      });
    },
    { scope: container },
  );

  return (
    <div ref={container} className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6">
        <Logo size="lg" />
        <Link to="/login">
          <button
            className="text-black px-4 py-2 md:px-6 rounded-full font-bold text-sm transition-all"
            style={{
              backgroundColor: "var(--color-primary)",
              boxShadow: "0 0 12px var(--color-primary-glow)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "var(--color-primary-hover)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "var(--color-primary)";
            }}
          >
            {t.landing.ctaStartAlt}
          </button>
        </Link>
      </header>

      <section className="hero-content relative flex flex-col items-center justify-center text-center py-12 md:py-20 lg:py-28 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={fondoLanding}
            alt="Fondo Landing"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
        </div>

        <div className="hero-animate hero-icon w-32 h-32 md:w-44 md:h-44 flex items-center justify-center mb-4 md:mb-6 mx-auto relative z-10">
          <img
            src={mancuerna}
            alt="Mancuerna"
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{
              filter:
                "brightness(0) invert(1) drop-shadow(0 0 18px rgba(255,255,255,0.6))",
            }}
          ></img>
        </div>
        <h2 className="hero-animate text-3xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-tight mb-4 md:mb-6 relative z-10">
          {t.landing.heroTitleAlt}
        </h2>
        <p className="hero-animate text-neutral-400 text-base md:text-lg mb-8 md:mb-10 max-w-md px-4 mx-auto relative z-10">
          {t.landing.heroSubtitleAlt}
        </p>
        <Link to="/login" className="hero-animate relative z-10">
          <button
            className="btn-cta text-black px-8 py-3 md:px-12 md:py-4 rounded-full font-display font-bold text-sm uppercase tracking-wide transition-all"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {t.landing.ctaStartAlt}
          </button>
        </Link>
      </section>

      <section className="features-section bg-[#121212] py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-xl md:text-2xl font-display font-bold mb-3">
            Lo que nos hace diferente
          </h3>
          <p className="text-center text-neutral-400 mb-10 md:mb-14 max-w-lg mx-auto text-sm md:text-base">
            {t.landing.featuresSubtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Tarjeta izquierda */}
            <div
              className="feature-card bg-neutral-800 border border-transparent rounded-2xl p-6 text-center transition-all duration-300 cursor-default"
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--color-accent)";
                el.style.transform = "translateY(-6px) scale(1.02)";
                el.style.boxShadow = "0 12px 30px var(--color-accent-glow)";
                el.style.backgroundColor = "#1c1c1c";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "transparent";
                el.style.transform = "";
                el.style.boxShadow = "";
                el.style.backgroundColor = "";
              }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">
                {t.landing.feature1CardTitle}
              </h4>
              <p className="text-neutral-400 text-sm">
                {t.landing.feature1CardDesc}
              </p>
            </div>

            <div
              className="feature-card bg-neutral-800 border border-transparent rounded-2xl p-6 text-center transition-all duration-300 cursor-default"
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--color-accent)";
                el.style.transform = "translateY(-6px) scale(1.02)";
                el.style.boxShadow = "0 12px 30px var(--color-accent-glow)";
                el.style.backgroundColor = "#1c1c1c";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "transparent";
                el.style.transform = "";
                el.style.boxShadow = "";
                el.style.backgroundColor = "";
              }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">
                {t.landing.feature2CardTitle}
              </h4>
              <p className="text-neutral-400 text-sm">
                {t.landing.feature2CardDesc}
              </p>
            </div>

            {/* Tarjeta derecha */}
            <div
              className="feature-card bg-neutral-800 border border-transparent rounded-2xl p-6 text-center transition-all duration-300 cursor-default"
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--color-accent)";
                el.style.transform = "translateY(-6px) scale(1.02)";
                el.style.boxShadow = "0 12px 30px var(--color-accent-glow)";
                el.style.backgroundColor = "#1c1c1c";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "transparent";
                el.style.transform = "";
                el.style.boxShadow = "";
                el.style.backgroundColor = "";
              }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-neutral-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-white mb-2">{t.landing.feature3CardTitle}</h4>
              <p className="text-neutral-400 text-sm">
                {t.landing.feature3CardDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="steps-section py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-xl md:text-2xl font-display font-bold mb-10 md:mb-14">
            {t.landing.howItWorks}
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            <div className="step-item flex flex-col items-center">
              <div
                className="w-14 h-14 text-black rounded-full flex items-center justify-center font-display font-black text-xl mb-4"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                1
              </div>
              <p className="font-bold">{t.landing.step1}</p>
            </div>

            <div className="step-item hidden md:block w-28 h-0.5 bg-neutral-700"></div>

            <div className="step-item flex flex-col items-center">
              <div
                className="w-14 h-14 text-black rounded-full flex items-center justify-center font-display font-black text-xl mb-4"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                2
              </div>
              <p className="font-bold">{t.landing.step2}</p>
            </div>

            <div className="step-item hidden md:block w-28 h-0.5 bg-neutral-700"></div>

            <div className="step-item flex flex-col items-center">
              <div
                className="w-14 h-14 text-black rounded-full flex items-center justify-center font-display font-black text-xl mb-4"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                3
              </div>
              <p className="font-bold">{t.landing.step3}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section relative py-16 md:py-28 px-4 md:px-8 overflow-hidden">
        <div
          className="bg-blob absolute -top-20 right-10 w-80 h-80 blur-[120px] rounded-full"
          style={{ backgroundColor: "var(--color-primary-muted)" }}
        ></div>
        <div
          className="bg-blob absolute -bottom-20 -left-10 w-72 h-72 blur-[100px] rounded-full"
          style={{ backgroundColor: "var(--color-accent-muted)" }}
        ></div>
        <div
          className="bg-blob absolute top-1/2 right-1/3 w-40 h-40 blur-[80px] rounded-full"
          style={{ backgroundColor: "var(--color-primary-muted)" }}
        ></div>

        <div
          className="cta-container relative max-w-2xl mx-auto text-center rounded-3xl p-8 md:p-14"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-black mb-4">
            {t.landing.ctaFinalTitleAlt}
          </h3>
          <p className="text-white/80 mb-6 md:mb-8 text-sm md:text-base">
            {t.landing.ctaFinalSubAlt}
          </p>
          <Link to="/login">
            <button
              className="btn-cta text-black px-8 py-3 md:px-10 md:py-4 rounded-full font-display font-bold text-sm uppercase tracking-wide transition-all"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {t.landing.ctaFinalBtnAlt}
            </button>
          </Link>
        </div>
      </section>

      <footer className="bg-[#121212] py-6 md:py-8 px-4 md:px-8 text-center">
        <p className="text-neutral-500 text-sm">
          &copy; {t.landing.footerText}
        </p>
      </footer>
    </div>
  );
}
