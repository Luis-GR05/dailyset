import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Download, Share2, Check, Sparkles, Trophy } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export interface DatosCompartirSesion {
  nombreRutina: string;
  duracionMin: number;
  volumenKg: number;
  totalSeries: number;
  fechaTexto: string;
  puntuacion?: number;
  ejercicios?: Array<{
    nombre: string;
    series: number;
    mejorPeso?: number;
  }>;
}

interface TarjetaCompartirModalProps {
  abierto: boolean;
  onCerrar: () => void;
  datos: DatosCompartirSesion;
  onContinuar?: () => void;
}

// Función auxiliar para dibujar rectángulos redondeados compatibles
function dibujarRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

export default function TarjetaCompartirModal({
  abierto,
  onCerrar,
  datos,
  onContinuar,
}: TarjetaCompartirModalProps) {
  const { locale } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [generando, setGenerando] = useState(false);
  const [descargado, setDescargado] = useState(false);
  const [compartido, setCompartido] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const dibujarCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensiones para formato Historia (9:16)
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // 1. Fondo oscuro con degradado premium
    const gradFondo = ctx.createLinearGradient(0, 0, 0, H);
    gradFondo.addColorStop(0, '#0B0B0E');
    gradFondo.addColorStop(0.4, '#121216');
    gradFondo.addColorStop(1, '#08080A');
    ctx.fillStyle = gradFondo;
    ctx.fillRect(0, 0, W, H);

    // 2. Resplandor / Aura superior e inferior en color neón (#DBF059)
    const glowTop = ctx.createRadialGradient(W / 2, 200, 50, W / 2, 200, 600);
    glowTop.addColorStop(0, 'rgba(219, 240, 89, 0.15)');
    glowTop.addColorStop(1, 'rgba(219, 240, 89, 0)');
    ctx.fillStyle = glowTop;
    ctx.fillRect(0, 0, W, 800);

    const glowBottom = ctx.createRadialGradient(W / 2, H - 200, 50, W / 2, H - 200, 500);
    glowBottom.addColorStop(0, 'rgba(219, 240, 89, 0.08)');
    glowBottom.addColorStop(1, 'rgba(219, 240, 89, 0)');
    ctx.fillStyle = glowBottom;
    ctx.fillRect(0, H - 700, W, 700);

    // 3. Rejilla sutil geométrica de fondo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 2;
    for (let x = 60; x < W; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 60; y < H; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // 4. Marca Superior: DAILYSET
    ctx.save();
    ctx.fillStyle = '#DBF059';
    ctx.beginPath();
    ctx.arc(100, 140, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 42px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DAILYSET', 125, 152);

    ctx.fillStyle = '#8E8E93';
    ctx.font = '700 22px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(datos.fechaTexto.toUpperCase(), W - 100, 148);
    ctx.restore();

    // 5. Badge "WORKOUT COMPLETED"
    ctx.save();
    const badgeX = 100;
    const badgeY = 240;
    const badgeW = 340;
    const badgeH = 54;
    ctx.fillStyle = 'rgba(219, 240, 89, 0.12)';
    ctx.strokeStyle = '#DBF059';
    ctx.lineWidth = 2;
    ctx.beginPath();
    dibujarRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 27);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DBF059';
    ctx.font = '900 22px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SESIÓN COMPLETADA', badgeX + badgeW / 2, badgeY + 34);
    ctx.restore();

    // 6. Nombre de la Rutina
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 76px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';

    // Cortar si es demasiado largo
    let rutinaNombre = datos.nombreRutina || 'Entrenamiento';
    if (rutinaNombre.length > 22) {
      rutinaNombre = rutinaNombre.slice(0, 20) + '...';
    }
    ctx.fillText(rutinaNombre.toUpperCase(), 100, 390);

    // Subtítulo
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 28px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText('Registro de rendimiento y superación', 100, 440);
    ctx.restore();

    // 7. Grid de 3 Métricas Destacadas
    const cardY = 510;
    const cardW = 273;
    const cardH = 210;
    const cardGap = 30;

    const metricas = [
      {
        valor: Math.round(datos.volumenKg).toLocaleString(),
        unidad: 'KG TOTAL',
        label: 'Volumen movido',
        color: '#DBF059',
      },
      {
        valor: `${datos.duracionMin}'`,
        unidad: 'MINUTOS',
        label: 'Tiempo activo',
        color: '#60A5FA',
      },
      {
        valor: `${datos.totalSeries}`,
        unidad: 'SERIES',
        label: 'Efectivas',
        color: '#F472B6',
      },
    ];

    metricas.forEach((m, idx) => {
      const cardX = 100 + idx * (cardW + cardGap);
      ctx.save();
      // Fondo de la tarjeta
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      dibujarRoundRect(ctx, cardX, cardY, cardW, cardH, 28);
      ctx.fill();
      ctx.stroke();

      // Pequeña línea superior de acento
      ctx.fillStyle = m.color;
      ctx.beginPath();
      dibujarRoundRect(ctx, cardX + 24, cardY + 16, 40, 6, 3);
      ctx.fill();

      // Valor grande
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 54px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(m.valor, cardX + 24, cardY + 105);

      // Unidad
      ctx.fillStyle = m.color;
      ctx.font = '800 20px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(m.unidad, cardX + 24, cardY + 140);

      // Label
      ctx.fillStyle = '#71717A';
      ctx.font = '500 18px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(m.label, cardX + 24, cardY + 175);
      ctx.restore();
    });

    // 8. Sección de Ejercicios Clave
    const ejStartY = 780;
    ctx.save();
    ctx.fillStyle = '#71717A';
    ctx.font = '800 22px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('EJERCICIOS COMPLETADOS', 100, ejStartY);

    const ejercicios = datos.ejercicios && datos.ejercicios.length > 0
      ? datos.ejercicios.slice(0, 5)
      : [
          { nombre: 'Entrenamiento Principal', series: datos.totalSeries, mejorPeso: undefined },
        ];

    let currentY = ejStartY + 30;
    ejercicios.forEach((ej, idx) => {
      // Tarjeta de ejercicio
      const hRow = 110;
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      dibujarRoundRect(ctx, 100, currentY, W - 200, hRow, 22);
      ctx.fill();
      ctx.stroke();

      // Número
      ctx.fillStyle = '#DBF059';
      ctx.font = '900 24px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(`0${idx + 1}`, 130, currentY + 62);

      // Nombre ejercicio
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 30px Inter, system-ui, -apple-system, sans-serif';
      let nombreLimpio = ej.nombre;
      if (nombreLimpio.length > 26) {
        nombreLimpio = nombreLimpio.slice(0, 24) + '...';
      }
      ctx.fillText(nombreLimpio, 185, currentY + 62);

      // Series / peso a la derecha
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '700 24px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      const infoSerie = ej.mejorPeso ? `${ej.series} series · ${ej.mejorPeso}kg` : `${ej.series} series`;
      ctx.fillText(infoSerie, W - 140, currentY + 62);

      ctx.restore();
      currentY += hRow + 18;
    });

    if (datos.ejercicios && datos.ejercicios.length > 5) {
      ctx.save();
      ctx.fillStyle = '#71717A';
      ctx.font = '700 20px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`+ ${datos.ejercicios.length - 5} ejercicios más en el registro`, W / 2, currentY + 20);
      ctx.restore();
    }
    ctx.restore();

    // 9. Caja de Racha / Superación o Puntuación
    const rachaY = 1510;
    ctx.save();
    ctx.fillStyle = 'rgba(219, 240, 89, 0.06)';
    ctx.strokeStyle = 'rgba(219, 240, 89, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    dibujarRoundRect(ctx, 100, rachaY, W - 200, 160, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DBF059';
    ctx.font = '900 32px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CON DISCIPLINA CADA SERIE CUENTA', 140, rachaY + 65);

    ctx.fillStyle = '#D4D4D8';
    ctx.font = '500 24px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText('Progreso registrado con éxito en DailySet.', 140, rachaY + 110);
    ctx.restore();

    // 10. Footer / Branding
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, H - 150);
    ctx.lineTo(W - 100, H - 150);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DAILYSET', 100, H - 95);

    ctx.fillStyle = '#71717A';
    ctx.font = '600 22px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('#DailySetApp  •  dailyset.app', W - 100, H - 95);
    ctx.restore();

    // Generar URL para preview
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
    } catch {
      // ignorar
    }
  }, [datos]);

  useEffect(() => {
    if (abierto) {
      setDescargado(false);
      setCompartido(false);
      setTimeout(() => {
        dibujarCanvas();
      }, 50);
    }
  }, [abierto, dibujarCanvas]);

  const descargarPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setGenerando(true);

    try {
      const enlace = document.createElement('a');
      const nombreArchivo = `DailySet_${datos.nombreRutina.replace(/\s+/g, '_')}_${Date.now()}.png`;
      enlace.download = nombreArchivo;
      enlace.href = canvas.toDataURL('image/png');
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      setDescargado(true);
      setTimeout(() => setDescargado(false), 3000);
    } catch (e) {
      console.error('Error al exportar imagen:', e);
    } finally {
      setGenerando(false);
    }
  };

  const compartirRedes = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGenerando(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          descargarPNG();
          return;
        }

        const nombreArchivo = `DailySet_${datos.nombreRutina.replace(/\s+/g, '_')}.png`;
        const file = new File([blob], nombreArchivo, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Entrenamiento DailySet - ${datos.nombreRutina}`,
            text: `¡Entrenamiento completado en DailySet! ${Math.round(datos.volumenKg)} kg levantados en ${datos.duracionMin} min #DailySet`,
            files: [file],
          });
          setCompartido(true);
          setTimeout(() => setCompartido(false), 3000);
        } else if (navigator.share) {
          // Fallback a texto si el navegador no permite compartir archivos
          await navigator.share({
            title: `Entrenamiento DailySet - ${datos.nombreRutina}`,
            text: `¡Entrenamiento completado en DailySet! ${Math.round(datos.volumenKg)} kg levantados en ${datos.duracionMin} min #DailySet`,
            url: window.location.origin,
          });
          setCompartido(true);
          setTimeout(() => setCompartido(false), 3000);
        } else {
          // Fallback: descargar directamente el archivo
          descargarPNG();
        }
      }, 'image/png');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Fallo al compartir via Web Share API:', err);
        descargarPNG();
      }
    } finally {
      setGenerando(false);
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Encabezado del modal */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black"
            style={{ background: 'var(--color-primary)', color: '#000000' }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              {locale === 'es' ? '¡Entrenamiento Completado!' : 'Workout Completed!'}
            </h2>
            <p className="text-xs text-neutral-400">
              {locale === 'es' ? 'Comparte tu sesión en Instagram Stories o WhatsApp' : 'Share your session to Stories or WhatsApp'}
            </p>
          </div>
        </div>

        {/* Preview de la Story (9:16) */}
        <div className="relative w-full aspect-[9/16] max-h-[50vh] mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-[#0B0B0E] flex items-center justify-center mb-4 group">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Story Preview"
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <div className="text-neutral-500 text-xs flex items-center gap-2">
              <Trophy size={16} />
              <span>{locale === 'es' ? 'Generando imagen...' : 'Rendering story...'}</span>
            </div>
          )}

          {/* Canvas oculto para renderizar en alta resolución (1080x1920) */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={compartirRedes}
              disabled={generando}
              className="h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              style={{ background: 'var(--color-primary)', color: '#000000' }}
            >
              {compartido ? <Check size={16} /> : <Share2 size={16} />}
              <span>{compartido ? (locale === 'es' ? '¡Listo!' : 'Shared!') : (locale === 'es' ? 'Compartir' : 'Share')}</span>
            </button>

            <button
              onClick={descargarPNG}
              disabled={generando}
              className="h-11 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-white/5"
            >
              {descargado ? <Check size={16} className="text-emerald-400" /> : <Download size={16} />}
              <span>{descargado ? (locale === 'es' ? 'Guardada' : 'Saved') : (locale === 'es' ? 'Descargar' : 'Download')}</span>
            </button>
          </div>

          {onContinuar ? (
            <button
              onClick={() => {
                onCerrar();
                onContinuar();
              }}
              className="h-10 px-4 rounded-xl font-semibold text-xs text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800 transition-colors cursor-pointer text-center"
            >
              {locale === 'es' ? 'Continuar al historial' : 'Continue to history'} →
            </button>
          ) : (
            <button
              onClick={onCerrar}
              className="h-10 px-4 rounded-xl font-semibold text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer text-center"
            >
              {locale === 'es' ? 'Cerrar' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
