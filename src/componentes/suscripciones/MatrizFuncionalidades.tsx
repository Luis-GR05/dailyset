// src/componentes/suscripciones/MatrizFuncionalidades.tsx
import { useState } from 'react';
import {
  Dumbbell,
  Calendar,
  BookOpen,
  BarChart2,
  Users,
  Share2,
  Sparkles,
  Search,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { MATRIZ_FUNCIONALIDADES } from '../../data/planesSuscripcion';
import { useI18n } from '../../context/I18nContext';
import type { TipoPlan } from '../../types/suscripcion';

interface MatrizFuncionalidadesProps {
  planActual?: TipoPlan;
}

export default function MatrizFuncionalidades({ planActual }: MatrizFuncionalidadesProps) {
  const { locale } = useI18n();
  const [busqueda, setBusqueda] = useState('');

  const renderIcon = (icono: string) => {
    switch (icono) {
      case 'Dumbbell':
        return <Dumbbell size={18} className="text-white" />;
      case 'Calendar':
        return <Calendar size={18} className="text-white" />;
      case 'BookOpen':
        return <BookOpen size={18} className="text-white" />;
      case 'BarChart2':
        return <BarChart2 size={18} className="text-white" />;
      case 'Users':
        return <Users size={18} className="text-white" />;
      case 'Share2':
        return <Share2 size={18} className="text-white" />;
      case 'Sparkles':
        return <Sparkles size={18} className="text-white" />;
      default:
        return <Layers size={18} className="text-white" />;
    }
  };

  const filtrados = MATRIZ_FUNCIONALIDADES.filter((item) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      item.modulo.toLowerCase().includes(q) ||
      item.moduloEn.toLowerCase().includes(q) ||
      item.free.toLowerCase().includes(q) ||
      item.basico.toLowerCase().includes(q) ||
      item.premium.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full space-y-5">
      {/* ── Encabezado y Barra de Búsqueda ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Layers className="text-[var(--color-primary)]" size={24} />
            <span>
              {locale === 'es'
                ? 'Matriz de Segmentación de Funcionalidades'
                : 'Feature Segmentation Matrix'}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {locale === 'es'
              ? 'Comparación exhaustiva por módulos entre los planes Free, Básico (Pro) y Premium (Ultra)'
              : 'Detailed module-by-module comparison across Free, Basic (Pro) and Premium (Ultra)'}
          </p>
        </div>

        {/* Buscador de funciones */}
        <div className="relative min-w-[240px] max-w-xs">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={
              locale === 'es'
                ? 'Buscar funcionalidad...'
                : 'Filter features...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:border-[var(--color-primary)] transition-colors"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Tabla de Matriz en Escritorio ── */}
      <div className="hidden lg:block overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/60">
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-neutral-400 w-1/4">
                {locale === 'es' ? 'Módulo' : 'Module'}
              </th>
              {/* Columna Free */}
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-neutral-300 w-1/4">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">Free</span>
                  <span className="text-[10px] text-neutral-400 font-mono">0,00 €</span>
                  {planActual === 'free' && (
                    <span className="bg-white/10 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                      {locale === 'es' ? 'ACTUAL' : 'CURRENT'}
                    </span>
                  )}
                </div>
              </th>
              {/* Columna Básico (Pro) */}
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-[var(--color-primary)] w-1/4 bg-[var(--color-primary)]/[0.03]">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-primary)] text-sm">
                    {locale === 'es' ? 'Básico (Pro)' : 'Basic (Pro)'}
                  </span>
                  <span className="text-[10px] text-white/80 font-mono">2,54 €/m*</span>
                  {planActual === 'pro' && (
                    <span className="bg-[var(--color-primary)] text-black text-[9px] px-1.5 py-0.5 rounded font-black">
                      {locale === 'es' ? 'ACTUAL' : 'CURRENT'}
                    </span>
                  )}
                </div>
              </th>
              {/* Columna Premium (Ultra) */}
              <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-amber-400 w-1/4 bg-amber-500/[0.03]">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm">
                    {locale === 'es' ? 'Premium (Ultra)' : 'Premium (Ultra)'}
                  </span>
                  <span className="text-[10px] text-white/80 font-mono">4,24 €/m*</span>
                  {planActual === 'ultra' && (
                    <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.5 rounded font-black">
                      {locale === 'es' ? 'ACTUAL' : 'CURRENT'}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/70 text-xs sm:text-sm">
            {filtrados.map((item) => (
              <tr
                key={item.moduloId}
                className="hover:bg-white/[0.02] transition-colors"
              >
                {/* Módulo */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
                      {renderIcon(item.icono)}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block">
                        {locale === 'es' ? item.modulo : item.moduloEn}
                      </span>
                      {item.descripcionModulo && (
                        <span className="text-[11px] text-neutral-400 font-normal">
                          {locale === 'es'
                            ? item.descripcionModulo
                            : item.descripcionModuloEn}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Free */}
                <td className="py-4 px-6 text-neutral-300">
                  <div className="flex items-start gap-2">
                    {item.free === 'No' ? (
                      <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5">
                        <X size={11} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-white/10 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                    <span className={item.free === 'No' ? 'text-neutral-500 italic' : ''}>
                      {locale === 'es' ? item.free : item.freeEn}
                    </span>
                  </div>
                </td>

                {/* Básico (Pro) */}
                <td className="py-4 px-6 bg-[var(--color-primary)]/[0.03]">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="text-white font-medium">
                      {locale === 'es' ? item.basico : item.basicoEn}
                    </span>
                  </div>
                </td>

                {/* Premium (Ultra) */}
                <td className="py-4 px-6 bg-amber-500/[0.03]">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="text-white font-semibold">
                      {locale === 'es' ? item.premium : item.premiumEn}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Vista Adaptable en Tarjetas para Móviles / Tablets ── */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {filtrados.map((item) => (
          <div
            key={item.moduloId}
            className="p-5 rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-xl space-y-3"
          >
            <div className="flex items-center gap-3 pb-2 border-b border-white/10">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {renderIcon(item.icono)}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {locale === 'es' ? item.modulo : item.moduloEn}
                </h4>
                {item.descripcionModulo && (
                  <p className="text-[11px] text-neutral-400">
                    {locale === 'es' ? item.descripcionModulo : item.descripcionModuloEn}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {/* Free */}
              <div className="flex items-start justify-between p-2 rounded-xl bg-white/[0.02]">
                <span className="font-bold text-neutral-400 w-24 shrink-0">Free:</span>
                <span
                  className={`text-right ${
                    item.free === 'No' ? 'text-neutral-500 italic' : 'text-neutral-200'
                  }`}
                >
                  {locale === 'es' ? item.free : item.freeEn}
                </span>
              </div>

              {/* Básico (Pro) */}
              <div className="flex items-start justify-between p-2 rounded-xl bg-[var(--color-primary)]/[0.05] border border-[var(--color-primary)]/20">
                <span className="font-bold text-[var(--color-primary)] w-24 shrink-0">
                  {locale === 'es' ? 'Básico (Pro):' : 'Basic (Pro):'}
                </span>
                <span className="text-right text-white font-medium">
                  {locale === 'es' ? item.basico : item.basicoEn}
                </span>
              </div>

              {/* Premium (Ultra) */}
              <div className="flex items-start justify-between p-2 rounded-xl bg-amber-500/[0.05] border border-amber-500/20">
                <span className="font-bold text-amber-400 w-24 shrink-0">
                  {locale === 'es' ? 'Premium (Ultra):' : 'Premium (Ultra):'}
                </span>
                <span className="text-right text-white font-semibold">
                  {locale === 'es' ? item.premium : item.premiumEn}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
