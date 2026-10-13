import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface CarouselItem {
  id: string;
  tag: string;
  tagEn: string;
  titulo: string;
  tituloEn: string;
  subtitulo: string;
  subtituloEn: string;
  detalles: string;
  detallesEn: string;
  tasa: string;
  tasaEn: string;
  imagen: string;
}

interface ConcaveCarouselProps {
  items: CarouselItem[];
  locale?: string;
  autoDrift?: boolean;
}

// Separación horizontal entre tarjetas (en px respecto al ancho de tarjeta)
const CARD_OFFSET = 220;

export default function ConcaveCarousel({
  items,
  locale = "es",
  autoDrift = true,
}: ConcaveCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const startX = useRef(0);
  const velRef = useRef(0);
  const lastT = useRef(0);

  const n = items.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % n), [n]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + n) % n), [n]);

  /* Autoplay */
  useEffect(() => {
    if (!autoDrift || dragging) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [autoDrift, dragging, next]);

  /* ── Mouse ── */
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    startX.current = e.clientX;
    lastT.current = performance.now();
    velRef.current = 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startX.current;
    setDragDelta(dx);
    const dt = performance.now() - lastT.current || 16;
    velRef.current = dx / dt;
    lastT.current = performance.now();
  };
  const onMouseUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragDelta < -70 || velRef.current < -0.3) next();
    else if (dragDelta > 70 || velRef.current > 0.3) prev();
    setDragDelta(0);
  };

  /* ── Touch ── */
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setDragging(true);
    startX.current = e.touches[0].clientX;
    lastT.current = performance.now();
    velRef.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startX.current;
    setDragDelta(dx);
    const dt = performance.now() - lastT.current || 16;
    velRef.current = dx / dt;
    lastT.current = performance.now();
  };
  const onTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragDelta < -55 || velRef.current < -0.25) next();
    else if (dragDelta > 55 || velRef.current > 0.25) prev();
    setDragDelta(0);
  };

  return (
    <div className="relative w-full select-none py-6">

      {/* ── STAGE ── */}
      <div
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative w-full h-[440px] sm:h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
      >
        {items.map((item, idx) => {
          /* distancia relativa al activo (con wrap-around) */
          let diff = idx - current;
          if (diff > n / 2) diff -= n;
          if (diff < -n / 2) diff += n;

          /* offset de arrastre continuo */
          const fracDrag = dragging ? dragDelta / CARD_OFFSET : 0;
          const pos = diff + fracDrag; // posición fraccionaria
          const absPos = Math.abs(pos);

          /* Ocultar tarjetas demasiado lejos */
          if (absPos > 2.6) return null;

          const isCenter = absPos < 0.5;
          const translateX = pos * CARD_OFFSET;
          const scale = isCenter ? 1 : Math.max(0.75, 1 - absPos * 0.1);
          const opacity = isCenter ? 1 : Math.max(0.2, 1 - absPos * 0.38);
          const zIndex = isCenter ? 20 : Math.max(1, 10 - Math.round(absPos * 4));
          /* Pequeña rotación en Y para efecto cóncavo sutil */
          const rotY = pos * -8;
          /* Ligero desplazamiento en Y para las tarjetas laterales */
          const translateY = isCenter ? 0 : absPos * 18;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!dragging && Math.abs(dragDelta) < 5) setCurrent(idx);
              }}
              className="absolute cursor-pointer"
              style={{
                width: "clamp(210px, 23vw, 290px)",
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotateY(${rotY}deg)`,
                opacity,
                transition: dragging
                  ? "none"
                  : "transform 0.42s cubic-bezier(0.22,0.8,0.36,1), opacity 0.42s ease",
                zIndex,
              }}
            >
              {/* ── TARJETA ── */}
              <div
                className={`rounded-2xl overflow-hidden border transition-colors duration-400 ${
                  isCenter
                    ? "border-[var(--color-primary)]/50 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_35px_rgba(212,251,52,0.1)]"
                    : "border-white/8"
                }`}
              >
                {/* Imagen */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="w-full h-full object-cover"
                    style={{
                      filter: isCenter
                        ? "grayscale(0.3) contrast(1.12) brightness(0.88)"
                        : "grayscale(0.9) contrast(1.05) brightness(0.55)",
                      transition: "filter 0.42s ease",
                    }}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/10" />

                  {/* Título */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4
                      className="font-black text-white uppercase tracking-tight leading-tight"
                      style={{ fontSize: "clamp(0.8rem, 1.6vw, 1rem)" }}
                    >
                      {locale === "es" ? item.titulo : item.tituloEn}
                    </h4>
                  </div>
                </div>

                {/* Footer solo en la tarjeta activa */}
                {isCenter && (
                  <div className="px-4 py-3 flex items-center justify-end bg-[#0a0a0a]">
                    <Link to="/registro">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-primary)] text-black font-black text-[9px] sm:text-[10px] uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer">
                        <span>{locale === "es" ? "Comenzar" : "Start"}</span>
                        <ArrowUpRight size={10} />
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CONTROLES ── */}
      <div className="flex items-center justify-center gap-5 pb-4">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/12 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                current === i
                  ? "w-6 bg-[var(--color-primary)]"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Programa ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/12 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
