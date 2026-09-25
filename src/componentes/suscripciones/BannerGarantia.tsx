// src/componentes/suscripciones/BannerGarantia.tsx
import { ShieldCheck, RotateCcw, Lock, FileSpreadsheet } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export default function BannerGarantia() {
  const { locale } = useI18n();

  const garantias = [
    {
      icono: <ShieldCheck size={22} className="text-emerald-400" />,
      titulo: locale === 'es' ? '14 Días de Garantía' : '14-Day Guarantee',
      desc:
        locale === 'es'
          ? 'Prueba sin compromiso. Si no estás 100% satisfecho, te devolvemos el dinero sin preguntas.'
          : 'Try risk-free. 100% money-back if you are not completely satisfied.',
    },
    {
      icono: <RotateCcw size={22} className="text-[var(--color-primary)]" />,
      titulo: locale === 'es' ? 'Sin Permanencia' : 'No Commitment',
      desc:
        locale === 'es'
          ? 'Modifica, pausa o cancela tu suscripción en cualquier instante con un solo clic.'
          : 'Modify, pause or cancel your subscription anytime with a single click.',
    },
    {
      icono: <Lock size={22} className="text-blue-400" />,
      titulo: locale === 'es' ? 'Pago 100% Seguro' : '100% Secure Payment',
      desc:
        locale === 'es'
          ? 'Procesamiento encriptado de nivel bancario con tecnología SSL de 256 bits.'
          : 'Bank-level encrypted processing backed by 256-bit SSL technology.',
    },
    {
      icono: <FileSpreadsheet size={22} className="text-amber-400" />,
      titulo: locale === 'es' ? 'Tus Datos Son Tuyos' : 'Your Data Is Yours',
      desc:
        locale === 'es'
          ? 'Exporta tus marcas, entrenamientos y series en formato CSV o PDF cuando quieras.'
          : 'Export your records, workouts, and sets to CSV or PDF at any time.',
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
      {garantias.map((item, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl flex flex-col gap-2.5 transition-colors hover:border-white/20"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            {item.icono}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white mb-1">{item.titulo}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
