// Lógica COMPARTIDA web/app (se copia a dailyset-app con scripts/sincronizar-web.mjs).
// Cálculos de las tarjetas de analítica avanzada de Estadísticas (PRO / ULTRA).
import type { Sesion } from '../context/HistorialContext';

/** Puntos de la gráfica de progresión (carga máxima, volumen y 1RM Epley) de un ejercicio. Sin datos → serie de ejemplo. */
export function calcularProgresionEjercicio(sesiones: Sesion[], ejercicioSeleccionado: string, locale: string) {
  const sesionesConEjercicio = sesiones
    .filter(s => s.ejercicios?.some(ej => ej.nombre.toLowerCase() === ejercicioSeleccionado.toLowerCase()))
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  if (sesionesConEjercicio.length > 0) {
    return sesionesConEjercicio.map(s => {
      const ej = s.ejercicios.find(e => e.nombre.toLowerCase() === ejercicioSeleccionado.toLowerCase());
      const series = ej?.series || [];
      const maxKg = series.reduce((max, ser) => Math.max(max, ser.kg || 0), 0);
      const volumen = series.reduce((acc, ser) => acc + (ser.kg || 0) * (ser.reps || 0), 0);
      // Estimación 1RM Epley: peso * (1 + reps / 30)
      let max1RM = 0;
      series.forEach(ser => {
        if (ser.kg > 0 && ser.reps > 0) {
          const estim = Math.round(ser.kg * (1 + ser.reps / 30));
          if (estim > max1RM) max1RM = estim;
        }
      });

      const [y, m, d] = s.fecha.split('-').map(Number);
      const fechaCorta = new Date(y, m - 1, d).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        day: 'numeric',
        month: 'short',
      });

      return {
        fecha: fechaCorta,
        fechaCompleta: s.fecha,
        pesoMax: maxKg,
        volumen,
        estim1RM: max1RM > 0 ? max1RM : maxKg,
      };
    });
  }

  // Datos simulados de progresión representativa
  return [
    { fecha: 'Ene 10', pesoMax: 60, estim1RM: 70, volumen: 1800 },
    { fecha: 'Feb 02', pesoMax: 65, estim1RM: 74, volumen: 2100 },
    { fecha: 'Mar 15', pesoMax: 70, estim1RM: 80, volumen: 2350 },
    { fecha: 'Abr 22', pesoMax: 72.5, estim1RM: 83, volumen: 2500 },
    { fecha: 'May 30', pesoMax: 77.5, estim1RM: 88, volumen: 2800 },
    { fecha: 'Jun 18', pesoMax: 80, estim1RM: 92, volumen: 3000 },
    { fecha: 'Jul 26', pesoMax: 85, estim1RM: 98, volumen: 3400 },
  ];
}

/** Volumen por grupo muscular (radar), ratio empuje/tirón y grupo predominante. Sin datos → perfil equilibrado de ejemplo. */
export function calcularBalanceMuscular(sesiones: Sesion[], locale: string) {
  const grupos: Record<string, number> = {
    Pecho: 0,
    Espalda: 0,
    Piernas: 0,
    Hombros: 0,
    Brazos: 0,
    Core: 0,
  };

  sesiones.forEach((s) => {
    s.ejercicios?.forEach((ej) => {
      const nom = (ej.nombre || '').toLowerCase();
      const vol = ej.series?.reduce((acc, ser) => acc + (ser.kg || 0) * (ser.reps || 0), 0) || 0;

      if (nom.includes('banca') || nom.includes('pecho') || nom.includes('chest') || nom.includes('apertura') || nom.includes('fondos')) {
        grupos.Pecho += vol;
      } else if (nom.includes('remo') || nom.includes('espalda') || nom.includes('back') || nom.includes('dominada') || nom.includes('jalon') || nom.includes('pull')) {
        grupos.Espalda += vol;
      } else if (nom.includes('sentadilla') || nom.includes('squat') || nom.includes('prensa') || nom.includes('pierna') || nom.includes('leg') || nom.includes('peso muerto') || nom.includes('deadlift') || nom.includes('gemelo') || nom.includes('femoral') || nom.includes('cuadriceps')) {
        grupos.Piernas += vol;
      } else if (nom.includes('militar') || nom.includes('hombro') || nom.includes('shoulder') || nom.includes('lateral') || nom.includes('pajaros')) {
        grupos.Hombros += vol;
      } else if (nom.includes('biceps') || nom.includes('triceps') || nom.includes('curl') || nom.includes('brazo') || nom.includes('frances')) {
        grupos.Brazos += vol;
      } else {
        grupos.Core += vol > 0 ? vol : (ej.series?.length || 1) * 50;
      }
    });
  });

  const sumVol = Object.values(grupos).reduce((a, b) => a + b, 0);

  // Si el usuario es nuevo o no tiene datos suficientes, usamos un perfil de atleta equilibrado para preview
  const base = sumVol > 0 ? grupos : {
    Pecho: 5200,
    Espalda: 5800,
    Piernas: 7400,
    Hombros: 3400,
    Brazos: 3100,
    Core: 1800,
  };

  const maxVal = Math.max(...Object.values(base), 1);

  const nombresGrupos: Record<string, { es: string; en: string }> = {
    Pecho: { es: 'Pecho', en: 'Chest' },
    Espalda: { es: 'Espalda', en: 'Back' },
    Piernas: { es: 'Piernas', en: 'Legs' },
    Hombros: { es: 'Hombros', en: 'Shoulders' },
    Brazos: { es: 'Brazos', en: 'Arms' },
    Core: { es: 'Core / Abdomen', en: 'Core' },
  };

  const datos = Object.entries(base).map(([key, val]) => {
    const pct = Math.round((val / maxVal) * 100);
    return {
      grupo: locale === 'es' ? nombresGrupos[key].es : nombresGrupos[key].en,
      volumen: val,
      puntuacion: pct > 20 ? pct : 20,
    };
  });

  // Ratio Push vs Pull (Pecho + Hombros vs Espalda)
  const push = (base.Pecho || 0) + (base.Hombros || 0);
  const pull = base.Espalda || 1;
  const ratio = (push / pull).toFixed(2);

  let maxG = 'Piernas';
  let maxGVal = 0;
  Object.entries(base).forEach(([k, v]) => {
    if (v > maxGVal) {
      maxGVal = v;
      maxG = k;
    }
  });

  return {
    datosRadar: datos,
    totalVolumen: sumVol > 0 ? sumVol : 26700,
    ratioPushPull: ratio,
    grupoPredominante: locale === 'es' ? nombresGrupos[maxG].es : nombresGrupos[maxG].en,
  };
}

/** Mes actual vs mes anterior (volumen, sesiones, horas). Sin datos → comparativa de ejemplo. */
export function calcularComparativaMensual(sesiones: Sesion[], locale: string) {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  const prevMonthDate = new Date(curYear, curMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  const curSesiones = sesiones.filter((s) => {
    const d = new Date(s.fecha + 'T12:00:00');
    return d.getFullYear() === curYear && d.getMonth() === curMonth;
  });

  const prevSesiones = sesiones.filter((s) => {
    const d = new Date(s.fecha + 'T12:00:00');
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
  });

  const calcVol = (list: Sesion[]) =>
    list.reduce(
      (acc, s) =>
        acc +
        (s.ejercicios?.reduce(
          (eAcc, ej) =>
            eAcc + (ej.series?.reduce((sAcc, ser) => sAcc + (ser.kg || 0) * (ser.reps || 0), 0) || 0),
          0
        ) || 0),
      0
    );

  const curVol = calcVol(curSesiones);
  const prevVol = calcVol(prevSesiones);

  const curMin = curSesiones.reduce((acc, s) => acc + (s.duracionMin || 0), 0);
  const prevMin = prevSesiones.reduce((acc, s) => acc + (s.duracionMin || 0), 0);

  // Si no hay datos suficientes para comparar, simulamos una comparativa realista para el preview
  const baseCurVol = curVol > 0 ? curVol : 28400;
  const basePrevVol = prevVol > 0 ? prevVol : 24900;
  const baseCurSes = curSesiones.length > 0 ? curSesiones.length : 16;
  const basePrevSes = prevSesiones.length > 0 ? prevSesiones.length : 14;
  const baseCurMin = curMin > 0 ? curMin : 1120;
  const basePrevMin = prevMin > 0 ? prevMin : 980;

  const diffVolPct = Math.round(((baseCurVol - basePrevVol) / (basePrevVol || 1)) * 100);
  const diffSes = baseCurSes - basePrevSes;
  const diffMinPct = Math.round(((baseCurMin - basePrevMin) / (basePrevMin || 1)) * 100);

  const curMonthName = now.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'short' });
  const prevMonthName = prevMonthDate.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'short' });

  const data = [
    {
      metrica: locale === 'es' ? 'Volumen (Ton)' : 'Volume (Ton)',
      [prevMonthName]: parseFloat((basePrevVol / 1000).toFixed(1)),
      [curMonthName]: parseFloat((baseCurVol / 1000).toFixed(1)),
    },
    {
      metrica: locale === 'es' ? 'Sesiones' : 'Sessions',
      [prevMonthName]: basePrevSes,
      [curMonthName]: baseCurSes,
    },
    {
      metrica: locale === 'es' ? 'Horas' : 'Hours',
      [prevMonthName]: parseFloat((basePrevMin / 60).toFixed(1)),
      [curMonthName]: parseFloat((baseCurMin / 60).toFixed(1)),
    },
  ];

  return {
    metricasComparadas: {
      volActualTon: (baseCurVol / 1000).toFixed(1),
      volPrevTon: (basePrevVol / 1000).toFixed(1),
      diffVolPct,
      sesActual: baseCurSes,
      sesPrev: basePrevSes,
      diffSes,
      horasActual: (baseCurMin / 60).toFixed(1),
      horasPrev: (basePrevMin / 60).toFixed(1),
      diffMinPct,
      curMonthName,
      prevMonthName,
    },
    datosGrafico: {
      data,
      curMonthName,
      prevMonthName,
    },
  };
}
