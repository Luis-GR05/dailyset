// src/componentes/suscripciones/PreguntasFrecuentes.tsx
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { PREGUNTAS_FRECUENTES } from '../../data/planesSuscripcion';
import { useI18n } from '../../context/I18nContext';

export default function PreguntasFrecuentes() {
  const { locale } = useI18n();
  const [abierta, setAbierta] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setAbierta((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <HelpCircle className="text-[var(--color-primary)]" size={24} />
          <span>
            {locale === 'es' ? 'Preguntas Frecuentes sobre Suscripciones' : 'Subscription FAQ'}
          </span>
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
          {locale === 'es'
            ? 'Todo lo que necesitas saber sobre pagos, cancelación y condiciones'
            : 'Everything you need to know about billing, cancellations, and terms'}
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {PREGUNTAS_FRECUENTES.map((faq, idx) => {
          const isOpen = abierta === idx;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-xl ${
                isOpen
                  ? 'border-white/20 bg-neutral-900/60 shadow-md'
                  : 'border-white/10 bg-neutral-900/40 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <span className="font-bold text-sm sm:text-base text-white">
                  {locale === 'es' ? faq.pregunta : faq.preguntaEn}
                </span>
                <span
                  className={`shrink-0 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 text-neutral-300 ${
                    isOpen ? 'rotate-180 text-[var(--color-primary)] bg-[var(--color-primary)]/10' : ''
                  }`}
                >
                  <ChevronDown size={16} />
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                  {locale === 'es' ? faq.respuesta : faq.respuestaEn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
