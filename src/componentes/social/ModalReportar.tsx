// src/componentes/social/ModalReportar.tsx
// Modal para reportar usuarios o rutinas con categorización de motivos y opción de bloqueo inmediato

import { useState } from 'react';
import type { MotivoReporte } from '../../types/social';
import { useSocial } from '../../context/SocialContext';
import { useI18n } from '../../context/I18nContext';
import {
  X,
  Flag,
  ShieldAlert,
  Check,
  Loader2,
  AlertTriangle,
  Ban,
} from 'lucide-react';

interface ModalReportarProps {
  tipo: 'usuario' | 'rutina';
  targetUsuarioId: string;
  targetNombreUsuario: string;
  targetRutinaId?: number;
  targetRutinaNombre?: string;
  onCerrar: () => void;
  onReporteEnviado?: () => void;
  isLight?: boolean;
}

const MOTIVOS_REPORTE: { id: MotivoReporte; labelEs: string; labelEn: string; descEs: string; descEn: string }[] = [
  {
    id: 'spam',
    labelEs: 'Spam o publicidad no deseada',
    labelEn: 'Spam or unwanted advertising',
    descEs: 'Promoción masiva, enlaces engañosos o autopromoción repetitiva.',
    descEn: 'Mass promotion, deceptive links, or repetitive self-promotion.',
  },
  {
    id: 'acoso',
    labelEs: 'Acoso o incitación al odio',
    labelEn: 'Harassment or hate speech',
    descEs: 'Insultos directos, intimidación, hostigamiento o discriminación.',
    descEn: 'Direct insults, intimidation, harassment, or discrimination.',
  },
  {
    id: 'contenido_inapropiado',
    labelEs: 'Contenido inapropiado o explícito',
    labelEn: 'Inappropriate or explicit content',
    descEs: 'Material no apto para la comunidad o que viola normas de convivencia.',
    descEn: 'Unsuitable material for the community or community guideline violations.',
  },
  {
    id: 'suplantacion',
    labelEs: 'Suplantación de identidad',
    labelEn: 'Impersonation or fake account',
    descEs: 'Se hace pasar por otra persona, atleta, entrenador o entidad.',
    descEn: 'Pretending to be another person, athlete, coach, or entity.',
  },
  {
    id: 'nombre_ofensivo',
    labelEs: 'Nombre o título ofensivo',
    labelEn: 'Offensive name or title',
    descEs: 'El nombre de usuario o el título de la rutina contiene términos ofensivos.',
    descEn: 'The username or routine title contains offensive wording.',
  },
  {
    id: 'otro',
    labelEs: 'Otro motivo',
    labelEn: 'Other reason',
    descEs: 'Cualquier otra infracción no contemplada en los puntos anteriores.',
    descEn: 'Any other violation not listed above.',
  },
];

export default function ModalReportar({
  tipo,
  targetUsuarioId,
  targetNombreUsuario,
  targetRutinaId,
  targetRutinaNombre,
  onCerrar,
  onReporteEnviado,
  isLight = false,
}: ModalReportarProps) {
  const { reportarContenidoSocial, bloquearAtleta } = useSocial();
  const { locale } = useI18n();

  const [motivoSeleccionado, setMotivoSeleccionado] = useState<MotivoReporte>('spam');
  const [detalles, setDetalles] = useState('');
  const [bloquearTambien, setBloquearTambien] = useState(true);

  const [enviando, setEnviando] = useState(false);
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrorMsg(null);

    try {
      await reportarContenidoSocial({
        tipo,
        reportado_usuario_id: targetUsuarioId,
        rutina_id: targetRutinaId,
        motivo: motivoSeleccionado,
        descripcion: detalles.trim() || undefined,
      });

      if (bloquearTambien) {
        await bloquearAtleta(targetUsuarioId);
      }

      setEnviadoExitoso(true);
      onReporteEnviado?.();

      setTimeout(() => {
        onCerrar();
      }, 2500);
    } catch (err: any) {
      console.error('Error al enviar reporte:', err);
      setErrorMsg(err?.message || (locale === 'es' ? 'Error al enviar el reporte' : 'Error sending report'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div
        className={`modal-box modal-box-md max-w-lg p-0 overflow-hidden border ${
          isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-2xl' : 'bg-neutral-900 border-neutral-800 text-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div
          className={`relative p-5 sm:p-6 border-b flex items-start justify-between ${
            isLight
              ? 'bg-gradient-to-b from-red-50 to-neutral-100/70 border-neutral-200'
              : 'bg-gradient-to-b from-red-950/40 to-neutral-900 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isLight
                ? 'bg-red-100 text-red-600 border border-red-200'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className={`font-black text-lg sm:text-xl tracking-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                {tipo === 'usuario'
                  ? locale === 'es' ? 'Reportar Usuario' : 'Report User'
                  : locale === 'es' ? 'Reportar Rutina' : 'Report Routine'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {tipo === 'usuario'
                  ? `@${targetNombreUsuario.replace(/^@/, '')}`
                  : `"${targetRutinaNombre || 'Rutina'}" de @${targetNombreUsuario.replace(/^@/, '')}`}
              </p>
            </div>
          </div>

          <button
            className={`modal-close-btn ${
              isLight ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60' : ''
            }`}
            onClick={onCerrar}
            title={locale === 'es' ? 'Cerrar' : 'Close'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo del formulario o confirmación de éxito */}
        {enviadoExitoso ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto flex items-center justify-center">
              <Check size={28} />
            </div>
            <h4 className={`text-lg font-black ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              {locale === 'es' ? 'Reporte Recibido' : 'Report Received'}
            </h4>
            <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              {locale === 'es'
                ? 'Gracias por ayudarnos a mantener segura la comunidad de DailySet. Nuestro equipo revisará el contenido reportado con la mayor brevedad.'
                : 'Thank you for keeping DailySet community safe. Our team will review the reported content shortly.'}
            </p>
            {bloquearTambien && (
              <p className="text-xs font-semibold text-emerald-500">
                {locale === 'es'
                  ? `Has bloqueado a @${targetNombreUsuario.replace(/^@/, '')}. Ya no verás su contenido.`
                  : `You have blocked @${targetNombreUsuario.replace(/^@/, '')}. You will no longer see their content.`}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Selección de motivo */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-wider block ${
                isLight ? 'text-neutral-700' : 'text-neutral-300'
              }`}>
                {locale === 'es' ? '¿Cuál es el motivo del reporte?' : 'What is the reason for reporting?'}
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {MOTIVOS_REPORTE.map(m => (
                  <label
                    key={m.id}
                    onClick={() => setMotivoSeleccionado(m.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      motivoSeleccionado === m.id
                        ? isLight
                          ? 'bg-red-50/70 border-red-300 text-neutral-900'
                          : 'bg-red-500/10 border-red-500/40 text-white'
                        : isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100/70 border-neutral-200/80 text-neutral-800'
                        : 'bg-neutral-800/40 hover:bg-neutral-800/80 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="motivo_reporte"
                      value={m.id}
                      checked={motivoSeleccionado === m.id}
                      onChange={() => setMotivoSeleccionado(m.id)}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">
                        {locale === 'es' ? m.labelEs : m.labelEn}
                      </span>
                      <span className={`text-[11px] leading-tight block mt-0.5 ${
                        isLight ? 'text-neutral-500' : 'text-neutral-400'
                      }`}>
                        {locale === 'es' ? m.descEs : m.descEn}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Detalles adicionales */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider block ${
                isLight ? 'text-neutral-700' : 'text-neutral-300'
              }`}>
                {locale === 'es' ? 'Detalles adicionales (opcional)' : 'Additional details (optional)'}
              </label>
              <textarea
                value={detalles}
                onChange={e => setDetalles(e.target.value)}
                placeholder={
                  locale === 'es'
                    ? 'Proporciona contexto adicional sobre este reporte...'
                    : 'Provide additional context for this report...'
                }
                rows={3}
                className={`w-full p-3 text-xs rounded-xl border transition-all resize-none ${
                  isLight
                    ? 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                    : 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:border-red-500'
                }`}
              />
            </div>

            {/* Opción de bloqueo inmediato */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                bloquearTambien
                  ? isLight
                    ? 'bg-neutral-100 border-neutral-300'
                    : 'bg-neutral-800/80 border-neutral-700'
                  : isLight
                  ? 'bg-neutral-50 border-neutral-200/80'
                  : 'bg-neutral-900/40 border-neutral-800'
              }`}
            >
              <input
                type="checkbox"
                checked={bloquearTambien}
                onChange={e => setBloquearTambien(e.target.checked)}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Ban size={13} className="text-red-500" />
                  <span className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                    {locale === 'es'
                      ? `Bloquear también a @${targetNombreUsuario.replace(/^@/, '')}`
                      : `Also block @${targetNombreUsuario.replace(/^@/, '')}`}
                  </span>
                </div>
                <span className={`text-[11px] leading-tight block mt-0.5 ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}>
                  {locale === 'es'
                    ? 'Ocultará inmediatamente todas sus publicaciones y romperá cualquier seguimiento mutuo.'
                    : 'Will instantly hide all their posts and remove any mutual follows.'}
                </span>
              </div>
            </label>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={onCerrar}
                disabled={enviando}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={enviando}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {enviando ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>{locale === 'es' ? 'Enviando...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <Flag size={13} />
                    <span>{locale === 'es' ? 'Enviar Reporte' : 'Submit Report'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
