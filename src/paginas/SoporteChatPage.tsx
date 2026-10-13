import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, TituloPagina } from '../componentes';
import { useI18n } from '../context/I18nContext';
import ChatSoporte from '../componentes/soporte/ChatSoporte';
import {  
  Mail, 
  ArrowLeft, 
  LifeBuoy,
} from 'lucide-react';
import { useTextos } from '../hooks/useTextos';
import { textosSoporte } from '../data/textos/soporte';

export default function SoporteChatPage() {
  const { locale } = useI18n();
  const txSoporte = useTextos(textosSoporte);
  const navigate = useNavigate();
  const es = locale === 'es';

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = txSoporte.soporteTecnicoDailyset;
  }, [es]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Encabezado con botón de volver al perfil */}
        <div className="flex items-center justify-between gap-4">
          <TituloPagina
            titulo={txSoporte.soporteTecnico}
            subtitulo={txSoporte.asistenciaDirectaParaTuCuenta}
          />

          <button
            type="button"
            onClick={() => navigate('/perfil')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft size={14} />
            <span>{txSoporte.volverAlPerfil}</span>
          </button>
        </div>

        {/* Grid: Chat Principal + Panel Lateral de Información */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Principal: Chat Interactivo (8 cols) */}
          <div className="lg:col-span-8 h-[640px]">
            <ChatSoporte />
          </div>

          {/* Columna Secundaria: Contacto Oficial (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Tarjeta de Contacto Directo */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-3 backdrop-blur-xl">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Mail size={14} className="text-[var(--color-primary)]" />
                {txSoporte.canalEscritoDirecto}
              </span>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {txSoporte.siNecesitasAdjuntarCapturasDe}
              </p>

              <a
                href="mailto:soporte@dailyset.app"
                className="block w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-xs font-mono font-bold text-[var(--color-primary)] hover:underline transition-all"
              >
                soporte@dailyset.app
              </a>
            </div>

            {/* Guía Rápida */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <LifeBuoy size={13} className="text-amber-400" />
                {txSoporte.consejoDeSoporte}
              </span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {txSoporte.paraDudasSobreLaPolitica}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
