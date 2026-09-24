// src/componentes/estadisticas/TuSemanaEnCifrasModal.tsx
// Pantalla interactiva "Tu semana en cifras" y "Tu mes en cifras" diseñada para compartir en redes sociales

import { useState, useMemo, useRef, useCallback } from 'react';
import { useHistorial } from '../../context/HistorialContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import Logo from '../shared/Logo';
import {
  X,
  Share2,
  Copy,
  Check,
  Flame,
  Dumbbell,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Zap,
  Sparkles,
  Download,
  Send,
  Smartphone,
} from 'lucide-react';

interface TuSemanaEnCifrasModalProps {
  abierto: boolean;
  onCerrar: () => void;
  tipoInicial?: 'semana' | 'mes';
}

type PeriodoTipo = 'semana' | 'mes';

// Helper para dibujar rectángulos redondeados en canvas
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

export default function TuSemanaEnCifrasModal({
  abierto,
  onCerrar,
  tipoInicial = 'semana',
}: TuSemanaEnCifrasModalProps) {
  const { user } = useAuth();
  const { sesiones } = useHistorial();
  const { locale } = useI18n();

  const [periodoTipo, setPeriodoTipo] = useState<PeriodoTipo>(tipoInicial);
  // Offset: 0 = actual, -1 = anterior, etc.
  const [offsetPeriodo, setOffsetPeriodo] = useState<number>(0);
  const [copiado, setCopiado] = useState(false);
  const [mostrarOpcionesRedes, setMostrarOpcionesRedes] = useState(false);
  const [generandoImagen, setGenerandoImagen] = useState(false);
  const [imagenDescargada, setImagenDescargada] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper para formatear fechas
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const toYYYYMMDD = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  // Calcular el rango del período seleccionado
  const { fechaInicioStr, fechaFinStr, etiquetaPeriodo, subtituloPeriodo } = useMemo(() => {
    const ahora = new Date();

    if (periodoTipo === 'semana') {
      // Determinar lunes de la semana actual + offset
      const diaActual = (ahora.getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
      const inicio = new Date(ahora);
      inicio.setDate(ahora.getDate() - diaActual + offsetPeriodo * 7);
      inicio.setHours(0, 0, 0, 0);

      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      fin.setHours(23, 59, 59, 999);

      const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      const inicioTxt = inicio.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', formatOptions);
      const finTxt = fin.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { ...formatOptions, year: 'numeric' });

      const etiqueta = offsetPeriodo === 0
        ? (locale === 'es' ? 'Esta semana' : 'This week')
        : offsetPeriodo === -1
        ? (locale === 'es' ? 'Semana pasada' : 'Last week')
        : `${inicioTxt} - ${finTxt}`;

      return {
        fechaInicioStr: toYYYYMMDD(inicio),
        fechaFinStr: toYYYYMMDD(fin),
        etiquetaPeriodo: etiqueta,
        subtituloPeriodo: `${inicioTxt} — ${finTxt}`,
      };
    } else {
      // Mes actual + offset
      const d = new Date(ahora.getFullYear(), ahora.getMonth() + offsetPeriodo, 1);
      const inicio = new Date(d.getFullYear(), d.getMonth(), 1);
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const nombreMes = d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
      const etiqueta = offsetPeriodo === 0
        ? (locale === 'es' ? 'Este mes' : 'This month')
        : offsetPeriodo === -1
        ? (locale === 'es' ? 'Mes pasado' : 'Last month')
        : nombreMes;

      return {
        fechaInicioStr: toYYYYMMDD(inicio),
        fechaFinStr: toYYYYMMDD(fin),
        etiquetaPeriodo: etiqueta,
        subtituloPeriodo: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
      };
    }
  }, [periodoTipo, offsetPeriodo, locale]);

  // Filtrar sesiones dentro del rango
  const sesionesPeriodo = useMemo(() => {
    return sesiones.filter(s => {
      const f = s.fecha;
      return f >= fechaInicioStr && f <= fechaFinStr;
    });
  }, [sesiones, fechaInicioStr, fechaFinStr]);

  // Métricas calculadas para la tarjeta
  const metricas = useMemo(() => {
    const totalEntrenos = sesionesPeriodo.length;

    let minutosTotal = 0;
    let volumenTotal = 0;
    let seriesTotal = 0;
    let repsTotal = 0;

    // Conteo por ejercicio para detectar el destacado
    const ejerciciosMap = new Map<string, { veces: number; volumen: number }>();

    for (const sesion of sesionesPeriodo) {
      minutosTotal += sesion.duracionMin || ((sesion as any).duracionSegundos ? Math.round((sesion as any).duracionSegundos / 60) : 0);
      volumenTotal += Number((sesion as any).volumenTotalKg) || 0;

      const ejerciciosLista = sesion.ejercicios || (sesion as any).ejerciciosRealizados || [];
      for (const ej of ejerciciosLista) {
        const nombre = ej.nombre || 'Ejercicio';
        const prev = ejerciciosMap.get(nombre) || { veces: 0, volumen: 0 };
        const setsCount = ej.series ? ej.series.length : 0;
        seriesTotal += setsCount;

        let volEj = 0;
        if (ej.series) {
          for (const s of ej.series as any[]) {
            const reps = s.reps ?? s.repeticiones ?? 0;
            const peso = s.kg ?? s.peso ?? 0;
            repsTotal += reps;
            volEj += peso * reps;
          }
        }
        if (!((sesion as any).volumenTotalKg)) {
          volumenTotal += volEj;
        }

        ejerciciosMap.set(nombre, {
          veces: prev.veces + 1,
          volumen: prev.volumen + volEj,
        });
      }
    }

    // Identificar ejercicio con mayor volumen o frecuencia
    let ejercicioEstrella = { nombre: '—', volumen: 0, veces: 0 };
    for (const [nombre, data] of ejerciciosMap.entries()) {
      if (data.volumen > ejercicioEstrella.volumen) {
        ejercicioEstrella = { nombre, volumen: Math.round(data.volumen), veces: data.veces };
      }
    }

    // Formatear duración
    const horas = Math.floor(minutosTotal / 60);
    const mins = minutosTotal % 60;
    const duracionStr = horas > 0
      ? `${horas}h ${mins > 0 ? `${mins}m` : ''}`
      : `${minutosTotal} min`;

    // Equivalencia de volumen para impacto visual
    let equivalenciaVolumen = '';
    if (volumenTotal >= 20000) {
      equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de 4 camiones compactos' : 'Equivalent to 4 compact trucks';
    } else if (volumenTotal >= 10000) {
      equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de 2 elefantes adultos' : 'Equivalent to 2 adult elephants';
    } else if (volumenTotal >= 5000) {
      equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de un rinoceronte blanco' : 'Equivalent to a white rhino';
    } else if (volumenTotal >= 2000) {
      equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de un todoterreno' : 'Equivalent to an SUV vehicle';
    } else if (volumenTotal >= 800) {
      equivalenciaVolumen = locale === 'es' ? 'Equivale al peso de un caballo purasangre' : 'Equivalent to a thoroughbred horse';
    } else if (volumenTotal > 0) {
      equivalenciaVolumen = locale === 'es' ? 'Cada kilogramo suma a tu récord personal' : 'Every kilo builds towards your personal record';
    } else {
      equivalenciaVolumen = locale === 'es' ? 'Listo para iniciar el próximo desafío' : 'Ready for the next workout';
    }

    // Arquetipo / Rango según consistencia y volumen
    let arquetipo = {
      titulo: locale === 'es' ? 'Atleta en Enfoque' : 'Focused Athlete',
      desc: locale === 'es' ? 'Preparando el terreno para romper récords' : 'Setting the stage for breaking records',
      nivel: 'BRONCE',
      colorGlow: 'rgba(219, 240, 89, 0.4)',
    };

    if (periodoTipo === 'semana') {
      if (totalEntrenos >= 5) {
        arquetipo = {
          titulo: locale === 'es' ? 'Titán del Gimnasio' : 'Gym Titan',
          desc: locale === 'es' ? 'Volumen demoledor y disciplina de acero' : 'Crushing volume & iron discipline',
          nivel: 'LEGENDARIO',
          colorGlow: 'rgba(212, 251, 52, 0.9)',
        };
      } else if (totalEntrenos >= 3) {
        arquetipo = {
          titulo: locale === 'es' ? 'Bestia Imparable' : 'Unstoppable Beast',
          desc: locale === 'es' ? 'Constancia pura y avance implacable' : 'Pure consistency & relentless progress',
          nivel: 'ORO',
          colorGlow: 'rgba(56, 189, 248, 0.8)',
        };
      } else if (totalEntrenos >= 1) {
        arquetipo = {
          titulo: locale === 'es' ? 'Guerrero Constante' : 'Steady Warrior',
          desc: locale === 'es' ? 'Cumpliendo cada repetición programada' : 'Delivering on every programmed rep',
          nivel: 'PLATA',
          colorGlow: 'rgba(255, 100, 34, 0.8)',
        };
      }
    } else {
      if (totalEntrenos >= 18) {
        arquetipo = {
          titulo: locale === 'es' ? 'Máquina de Rendimiento' : 'Performance Machine',
          desc: locale === 'es' ? 'Un mes de dedicación fuera de serie' : 'An extraordinary month of dedication',
          nivel: 'LEGENDARIO',
          colorGlow: 'rgba(212, 251, 52, 0.9)',
        };
      } else if (totalEntrenos >= 12) {
        arquetipo = {
          titulo: locale === 'es' ? 'Atleta Implacable' : 'Relentless Athlete',
          desc: locale === 'es' ? 'Consistencia de campeonato en cada semana' : 'Championship consistency each week',
          nivel: 'ORO',
          colorGlow: 'rgba(56, 189, 248, 0.8)',
        };
      } else if (totalEntrenos >= 4) {
        arquetipo = {
          titulo: locale === 'es' ? 'Constructor de Hábito' : 'Habit Builder',
          desc: locale === 'es' ? 'Sumando volumen paso a paso' : 'Stacking volume step by step',
          nivel: 'PLATA',
          colorGlow: 'rgba(255, 100, 34, 0.8)',
        };
      }
    }

    return {
      totalEntrenos,
      minutosTotal,
      duracionStr,
      volumenTotal,
      seriesTotal,
      repsTotal,
      ejercicioEstrella,
      equivalenciaVolumen,
      arquetipo,
    };
  }, [sesionesPeriodo, periodoTipo, locale]);

  // Dibujar Canvas en alta resolución (formato Historia 9:16 vertical, 1080x1920)
  const dibujarCanvas = useCallback((): HTMLCanvasElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // 1. Fondo oscuro con degradado
    const gradFondo = ctx.createLinearGradient(0, 0, 0, H);
    gradFondo.addColorStop(0, '#0a0a0c');
    gradFondo.addColorStop(0.5, '#070709');
    gradFondo.addColorStop(1, '#030304');
    ctx.fillStyle = gradFondo;
    ctx.fillRect(0, 0, W, H);

    // 2. Resplandores ambientales de color primario (#DBF059) y azul
    const glowTop = ctx.createRadialGradient(W / 2, 280, 40, W / 2, 280, 550);
    glowTop.addColorStop(0, 'rgba(219, 240, 89, 0.16)');
    glowTop.addColorStop(1, 'rgba(219, 240, 89, 0)');
    ctx.fillStyle = glowTop;
    ctx.fillRect(0, 0, W, 850);

    const glowBottom = ctx.createRadialGradient(W / 2, H - 280, 40, W / 2, H - 280, 500);
    glowBottom.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    glowBottom.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = glowBottom;
    ctx.fillRect(0, H - 750, W, 750);

    // 3. Contenedor de la Tarjeta Central
    const cardX = 90;
    const cardY = 160;
    const cardW = 900;
    const cardH = 1600;
    const cardR = 48;

    // Sombra de tarjeta
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    cardGrad.addColorStop(0, '#141418');
    cardGrad.addColorStop(0.5, '#0c0c0e');
    cardGrad.addColorStop(1, '#070708');
    ctx.fillStyle = cardGrad;
    dibujarRoundRect(ctx, cardX, cardY, cardW, cardH, cardR);
    ctx.fill();
    ctx.restore();

    // Borde fino tarjeta
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2.5;
    dibujarRoundRect(ctx, cardX, cardY, cardW, cardH, cardR);
    ctx.stroke();
    ctx.restore();

    // 4. Cabecera dentro de la tarjeta
    ctx.fillStyle = '#DBF059';
    ctx.beginPath();
    ctx.arc(cardX + 60, cardY + 76, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DAILYSET', cardX + 82, cardY + 88);

    ctx.fillStyle = '#8E8E93';
    ctx.font = '700 20px Inter, system-ui, sans-serif';
    const tagPeriodo = periodoTipo === 'semana'
      ? (locale === 'es' ? 'SEMANA EN CIFRAS' : 'WEEKLY WRAPPED')
      : (locale === 'es' ? 'MES EN CIFRAS' : 'MONTHLY WRAPPED');
    ctx.fillText(tagPeriodo, cardX + 270, cardY + 87);

    // Usuario y fecha a la derecha
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 24px Inter, system-ui, sans-serif';
    ctx.fillText(`@${user?.nombre_usuario || user?.nombre || 'atleta'}`, cardX + cardW - 60, cardY + 76);

    ctx.fillStyle = '#8E8E93';
    ctx.font = '500 19px Inter, system-ui, sans-serif';
    ctx.fillText(subtituloPeriodo, cardX + cardW - 60, cardY + 104);

    // Divisor fino
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 50, cardY + 140);
    ctx.lineTo(cardX + cardW - 50, cardY + 140);
    ctx.stroke();

    // 5. Badge de Nivel / Arquetipo
    const badgeW = 220;
    const badgeH = 50;
    const badgeX = cardX + (cardW - badgeW) / 2;
    const badgeY = cardY + 180;
    ctx.fillStyle = 'rgba(219, 240, 89, 0.12)';
    ctx.strokeStyle = 'rgba(219, 240, 89, 0.4)';
    ctx.lineWidth = 2;
    dibujarRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 25);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DBF059';
    ctx.font = '900 20px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(metricas.arquetipo.nivel, badgeX + badgeW / 2, badgeY + 32);

    // Título de Arquetipo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 60px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(metricas.arquetipo.titulo.toUpperCase(), cardX + cardW / 2, cardY + 295);

    // Frase descriptiva
    ctx.fillStyle = '#A1A1AA';
    ctx.font = 'italic 500 24px Inter, system-ui, sans-serif';
    ctx.fillText(`"${metricas.arquetipo.desc}"`, cardX + cardW / 2, cardY + 345);

    // 6. Grid de 4 Cajas de Métricas
    const gridX = cardX + 50;
    const gridY = cardY + 400;
    const boxW = (cardW - 100 - 30) / 2;
    const boxH = 250;
    const boxR = 28;

    // Caja 1: ENTRENAMIENTOS
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    dibujarRoundRect(ctx, gridX, gridY, boxW, boxH, boxR);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8E8E93';
    ctx.font = '800 20px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(locale === 'es' ? 'ENTRENAMIENTOS' : 'WORKOUTS', gridX + 32, gridY + 54);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 74px Inter, system-ui, sans-serif';
    ctx.fillText(String(metricas.totalEntrenos), gridX + 32, gridY + 145);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '600 20px Inter, system-ui, sans-serif';
    ctx.fillText(
      metricas.totalEntrenos > 0
        ? (locale === 'es' ? 'Sesiones registradas' : 'Logged sessions')
        : (locale === 'es' ? 'Sin registros' : 'No entries'),
      gridX + 32,
      gridY + 195
    );

    // Caja 2: TIEMPO ACTIVO
    const box2X = gridX + boxW + 30;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    dibujarRoundRect(ctx, box2X, gridY, boxW, boxH, boxR);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8E8E93';
    ctx.font = '800 20px Inter, system-ui, sans-serif';
    ctx.fillText(locale === 'es' ? 'TIEMPO ACTIVO' : 'ACTIVE TIME', box2X + 32, gridY + 54);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 68px Inter, system-ui, sans-serif';
    ctx.fillText(metricas.duracionStr, box2X + 32, gridY + 145);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '600 20px Inter, system-ui, sans-serif';
    ctx.fillText(locale === 'es' ? 'Bajo tensión' : 'Under tension', box2X + 32, gridY + 195);

    // Caja 3: VOLUMEN TOTAL (Ancho completo)
    const box3Y = gridY + boxH + 28;
    const fullBoxW = cardW - 100;
    const box3H = 260;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    dibujarRoundRect(ctx, gridX, box3Y, fullBoxW, box3H, boxR);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8E8E93';
    ctx.font = '800 20px Inter, system-ui, sans-serif';
    ctx.fillText(locale === 'es' ? 'VOLUMEN TOTAL' : 'TOTAL VOLUME', gridX + 32, box3Y + 54);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#DBF059';
    ctx.font = '800 22px Inter, system-ui, sans-serif';
    ctx.fillText(`${metricas.seriesTotal} ${locale === 'es' ? 'series' : 'sets'}`, gridX + fullBoxW - 32, box3Y + 54);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 82px Inter, system-ui, sans-serif';
    ctx.fillText(`${metricas.volumenTotal.toLocaleString()} kg`, gridX + 32, box3Y + 155);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '600 22px Inter, system-ui, sans-serif';
    ctx.fillText(metricas.equivalenciaVolumen, gridX + 32, box3Y + 215);

    // Caja 4: EJERCICIO DESTACADO
    const box4Y = box3Y + box3H + 28;
    const box4H = 220;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    dibujarRoundRect(ctx, gridX, box4Y, fullBoxW, box4H, boxR);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8E8E93';
    ctx.font = '800 20px Inter, system-ui, sans-serif';
    ctx.fillText(locale === 'es' ? 'EJERCICIO DESTACADO' : 'TOP EXERCISE', gridX + 32, box4Y + 54);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 42px Inter, system-ui, sans-serif';
    ctx.fillText(metricas.ejercicioEstrella.nombre, gridX + 32, box4Y + 125);

    if (metricas.ejercicioEstrella.volumen > 0) {
      ctx.fillStyle = '#DBF059';
      ctx.font = '800 24px Inter, system-ui, sans-serif';
      ctx.fillText(
        `${metricas.ejercicioEstrella.volumen.toLocaleString()} kg · ${metricas.ejercicioEstrella.veces} ${locale === 'es' ? 'veces' : 'times'}`,
        gridX + 32,
        box4Y + 175
      );
    }

    // 7. Pie de Tarjeta
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 50, cardY + cardH - 120);
    ctx.lineTo(cardX + cardW - 50, cardY + cardH - 120);
    ctx.stroke();

    ctx.fillStyle = '#DBF059';
    ctx.font = '800 22px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DailySet Athlete', cardX + 60, cardY + cardH - 60);

    ctx.fillStyle = '#71717A';
    ctx.font = '600 20px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('dailyset.app', cardX + cardW - 60, cardY + cardH - 60);

    return canvas;
  }, [user, periodoTipo, subtituloPeriodo, metricas, locale]);

  if (!abierto) return null;

  // Texto optimizado sin emoticonos para compartir en redes
  const textoCompartir = `DailySet · ${etiquetaPeriodo.toUpperCase()}
Atleta: @${user?.nombre_usuario || user?.nombre || 'atleta'}
Rango: ${metricas.arquetipo.titulo} (${metricas.arquetipo.nivel})

- Entrenamientos completados: ${metricas.totalEntrenos}
- Tiempo bajo tensión: ${metricas.duracionStr}
- Volumen total levantado: ${metricas.volumenTotal.toLocaleString()} kg
- Series completadas: ${metricas.seriesTotal} (${metricas.repsTotal} repeticiones)
${metricas.ejercicioEstrella.nombre !== '—' ? `- Ejercicio estrella: ${metricas.ejercicioEstrella.nombre}` : ''}

Registra y supera tus límites en DailySet: ${window.location.origin}`;

  // 1. Compartir en WhatsApp
  const compartirWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoCompartir)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 2. Compartir en X / Twitter
  const compartirX = () => {
    const textoX = `Mi resumen de ${etiquetaPeriodo} en DailySet: ${metricas.totalEntrenos} entrenos, ${metricas.volumenTotal.toLocaleString()} kg levantados. Arquetipo: ${metricas.arquetipo.titulo}. #DailySet #Fitness`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textoX)}&url=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 3. Compartir en Telegram
  const compartirTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(textoCompartir)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 4. Descargar imagen PNG de alta calidad para Stories o guardar
  const descargarImagenPNG = () => {
    const canvas = dibujarCanvas();
    if (!canvas) return;
    setGenerandoImagen(true);

    try {
      const enlace = document.createElement('a');
      const nombre = `DailySet_${periodoTipo === 'semana' ? 'Semana' : 'Mes'}_${Date.now()}.png`;
      enlace.download = nombre;
      enlace.href = canvas.toDataURL('image/png');
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      setImagenDescargada(true);
      setTimeout(() => setImagenDescargada(false), 3000);
    } catch (err) {
      console.error('Error generando imagen para descarga:', err);
    } finally {
      setGenerandoImagen(false);
    }
  };

  // 5. Compartir con Web Share API (con imagen adjunta en móviles compatibles)
  const handleCompartirNativoConImagen = async () => {
    const canvas = dibujarCanvas();
    if (!canvas) return;
    setGenerandoImagen(true);

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          descargarImagenPNG();
          return;
        }

        const nombre = `DailySet_${periodoTipo === 'semana' ? 'Semana' : 'Mes'}.png`;
        const file = new File([blob], nombre, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `DailySet · ${etiquetaPeriodo}`,
            text: textoCompartir,
            files: [file],
          });
        } else if (navigator.share) {
          await navigator.share({
            title: `DailySet · ${etiquetaPeriodo}`,
            text: textoCompartir,
            url: window.location.origin,
          });
        } else {
          descargarImagenPNG();
        }
      }, 'image/png');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Fallback a texto/descarga:', err);
        descargarImagenPNG();
      }
    } finally {
      setGenerandoImagen(false);
    }
  };

  const handleCopiarTexto = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(textoCompartir);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  return (
    <div className="modal-overlay z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md" onClick={onCerrar}>
      {/* Canvas oculto para generación de imagen de alta resolución */}
      <canvas ref={canvasRef} className="hidden" />

      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Barra Superior de Control ── */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md z-10">
          {/* Selector de Período: Semana / Mes */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setPeriodoTipo('semana');
                setOffsetPeriodo(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodoTipo === 'semana'
                  ? 'bg-[var(--color-primary)] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {locale === 'es' ? 'Semana' : 'Week'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodoTipo('mes');
                setOffsetPeriodo(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodoTipo === 'mes'
                  ? 'bg-[var(--color-primary)] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {locale === 'es' ? 'Mes' : 'Month'}
            </button>
          </div>

          {/* Navegación temporal & Botón Cerrar */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOffsetPeriodo(prev => prev - 1)}
              className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={locale === 'es' ? 'Período anterior' : 'Previous period'}
            >
              <ChevronLeft size={16} />
            </button>

            {offsetPeriodo !== 0 && (
              <button
                type="button"
                onClick={() => setOffsetPeriodo(0)}
                className="px-2 py-1 text-[10px] font-bold uppercase rounded-lg bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                title={locale === 'es' ? 'Volver al período actual' : 'Reset to current'}
              >
                {locale === 'es' ? 'Actual' : 'Now'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setOffsetPeriodo(prev => Math.min(0, prev + 1))}
              disabled={offsetPeriodo >= 0}
              className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title={locale === 'es' ? 'Período siguiente' : 'Next period'}
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={onCerrar}
              className="p-1.5 ml-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={locale === 'es' ? 'Cerrar' : 'Close'}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Contenido de la Tarjeta para Compartir (Scrollable) ── */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TARJETA VISUAL TIPO "WRAPPED" PARA COMPARTIR */}
          <div
            id="tarjeta-cifras-share"
            className="relative rounded-3xl p-6 sm:p-7 overflow-hidden border border-neutral-700/60 shadow-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black select-none"
            style={{
              boxShadow: `0 20px 50px -15px ${metricas.arquetipo.colorGlow}`,
            }}
          >
            {/* Brillos ambientales de fondo */}
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[90px] pointer-events-none opacity-40"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-[90px] pointer-events-none opacity-30"
              style={{ backgroundColor: '#38BDF8' }}
            />

            {/* Cabecera de la Tarjeta */}
            <div className="relative flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {periodoTipo === 'semana'
                    ? (locale === 'es' ? 'Semana en cifras' : 'Weekly Wrapped')
                    : (locale === 'es' ? 'Mes en cifras' : 'Monthly Wrapped')}
                </span>
              </div>

              {/* Tag del Atleta */}
              <div className="text-right">
                <p className="text-xs font-black text-white truncate max-w-[140px]">
                  @{user?.nombre_usuario || user?.nombre || 'atleta'}
                </p>
                <p className="text-[10px] font-mono text-neutral-400">
                  {subtituloPeriodo}
                </p>
              </div>
            </div>

            {/* Arquetipo e Insignia */}
            <div className="relative mt-5 text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                <Sparkles size={11} />
                <span>{metricas.arquetipo.nivel}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                {metricas.arquetipo.titulo}
              </h2>

              <p className="text-xs text-neutral-400 max-w-xs mx-auto italic">
                "{metricas.arquetipo.desc}"
              </p>
            </div>

            {/* Métricas Principales en Grid */}
            <div className="relative grid grid-cols-2 gap-3 mt-6">
              {/* 1. Entrenamientos */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
                  <Flame size={14} className="text-[var(--color-primary)]" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    {locale === 'es' ? 'Entrenamientos' : 'Workouts'}
                  </span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">
                  {metricas.totalEntrenos}
                </p>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {metricas.totalEntrenos > 0
                    ? (locale === 'es' ? 'Sesiones registradas' : 'Logged sessions')
                    : (locale === 'es' ? 'Sin registros' : 'No entries')}
                </span>
              </div>

              {/* 2. Tiempo Activo */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
                  <Clock size={14} className="text-sky-400" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    {locale === 'es' ? 'Tiempo Activo' : 'Active Time'}
                  </span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">
                  {metricas.duracionStr}
                </p>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {locale === 'es' ? 'Bajo tensión' : 'Under tension'}
                </span>
              </div>

              {/* 3. Volumen Total */}
              <div className="col-span-2 p-4 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                    <Dumbbell size={14} className="text-[var(--color-primary)]" />
                    <span className="font-bold text-[11px] uppercase tracking-wider">
                      {locale === 'es' ? 'Volumen Total' : 'Total Volume'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                    {metricas.seriesTotal} {locale === 'es' ? 'series' : 'sets'}
                  </span>
                </div>

                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {metricas.volumenTotal.toLocaleString()}{' '}
                  <span className="text-base sm:text-lg font-bold text-neutral-400">kg</span>
                </p>

                <p className="text-[11px] text-neutral-300 flex items-center gap-1 pt-0.5">
                  <TrendingUp size={12} className="text-[var(--color-primary)] shrink-0" />
                  <span>{metricas.equivalenciaVolumen}</span>
                </p>
              </div>

              {/* 4. Ejercicio Estrella */}
              <div className="col-span-2 p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-0.5">
                    <Trophy size={13} className="text-amber-400" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">
                      {locale === 'es' ? 'Ejercicio Destacado' : 'Top Exercise'}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-white truncate">
                    {metricas.ejercicioEstrella.nombre}
                  </p>
                </div>

                {metricas.ejercicioEstrella.volumen > 0 && (
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[var(--color-primary)] block">
                      {metricas.ejercicioEstrella.volumen.toLocaleString()} kg
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {metricas.ejercicioEstrella.veces} {locale === 'es' ? 'veces' : 'times'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pie de Marca de la Tarjeta */}
            <div className="relative mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400 font-semibold">
              <span className="flex items-center gap-1 text-[var(--color-primary)] font-bold">
                <Zap size={11} />
                <span>DailySet Athlete</span>
              </span>
              <span>dailyset.app</span>
            </div>
          </div>

          {/* Panel Desplegable de Opciones para Redes Sociales */}
          {mostrarOpcionesRedes && (
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Share2 size={13} className="text-[var(--color-primary)]" />
                  {locale === 'es' ? 'Compartir en Redes Sociales' : 'Share on Social Media'}
                </span>
                <button
                  type="button"
                  onClick={() => setMostrarOpcionesRedes(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Opción WhatsApp */}
                <button
                  type="button"
                  onClick={compartirWhatsApp}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 hover:bg-emerald-950/40 border border-white/5 hover:border-emerald-500/40 text-neutral-200 hover:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* Opción X / Twitter */}
                <button
                  type="button"
                  onClick={compartirX}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-white/5 hover:border-white/20 text-neutral-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>X (Twitter)</span>
                </button>

                {/* Opción Telegram */}
                <button
                  type="button"
                  onClick={compartirTelegram}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 hover:bg-sky-950/40 border border-white/5 hover:border-sky-500/40 text-neutral-200 hover:text-sky-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <Send size={14} className="text-sky-400 shrink-0" />
                  <span>Telegram</span>
                </button>

                {/* Opción Descargar PNG para Stories */}
                <button
                  type="button"
                  onClick={descargarImagenPNG}
                  disabled={generandoImagen}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-white/5 hover:border-[var(--color-primary)]/40 text-neutral-200 hover:text-[var(--color-primary)] text-xs font-bold transition-all cursor-pointer"
                >
                  <Download size={14} className="text-[var(--color-primary)] shrink-0" />
                  <span>{locale === 'es' ? 'Guardar PNG' : 'Save PNG'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Botonera Inferior para Compartir ── */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-md flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botón Principal Compartir en Redes Sociales */}
            <button
              type="button"
              onClick={() => setMostrarOpcionesRedes(prev => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-black bg-[var(--color-primary)] hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Share2 size={15} />
              <span>{locale === 'es' ? 'Compartir en redes' : 'Share on social'}</span>
            </button>

            {/* Acceso Directo a WhatsApp */}
            <button
              type="button"
              onClick={compartirWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
              title="Compartir por WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Descargar Imagen para Stories o Guardar */}
            <button
              type="button"
              onClick={descargarImagenPNG}
              disabled={generandoImagen}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all cursor-pointer"
              title={locale === 'es' ? 'Descargar imagen PNG para Stories' : 'Download PNG for Stories'}
            >
              {imagenDescargada ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">{locale === 'es' ? 'Descargado' : 'Saved'}</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span className="hidden sm:inline">{locale === 'es' ? 'Imagen Stories' : 'Stories Image'}</span>
                </>
              )}
            </button>

            {/* Menú Nativo Móvil */}
            <button
              type="button"
              onClick={handleCompartirNativoConImagen}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all cursor-pointer"
              title={locale === 'es' ? 'Compartir con app del móvil' : 'Share via device app'}
            >
              <Smartphone size={14} />
              <span className="hidden md:inline">{locale === 'es' ? 'Móvil' : 'Device'}</span>
            </button>

            {/* Botón Copiar al Portapapeles */}
            <button
              type="button"
              onClick={handleCopiarTexto}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all cursor-pointer"
              title={locale === 'es' ? 'Copiar texto formateado' : 'Copy formatted text'}
            >
              {copiado ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">{locale === 'es' ? 'Copiado' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>{locale === 'es' ? 'Copiar' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {locale === 'es' ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
