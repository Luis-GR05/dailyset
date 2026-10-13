import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { useI18n } from '../../context/I18nContext';
import { calcularPlanMacros, generarHTMLPlanMacros, generarTextoPlanMacros, type EntradaMacros, type NivelActividad, type TipoObjetivo } from '../../lib/calculadoraMacros';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils,
  Scale,
  HeartPulse,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  User,
  Pencil,
  Printer,
} from 'lucide-react';

type PasoId = 1 | 2 | 3 | 4 | 'resumen';

export default function CalculadoraMacrosWizard() {
  const { locale } = useI18n();
  const { user } = useAuth();

  // ── ESTADO DEL PROCESO ──
  const [paso, setPaso] = useState<PasoId>(1);
  const [copiado, setCopiado] = useState(false);

  // ── PASO 1: DATOS CORPORALES ──
  const [genero, setGenero] = useState<'masculino' | 'femenino'>(
    user?.genero === 'femenino' ? 'femenino' : 'masculino'
  );
  const [edad, setEdad] = useState<number>(user?.edad || 26);
  const [peso, setPeso] = useState<number>(user?.pesoKg || 75);
  const [altura, setAltura] = useState<number>(user?.alturaCm || 178);
  const [unidadPeso, setUnidadPeso] = useState<'kg' | 'lbs'>('kg');
  const [grasaCorporal, setGrasaCorporal] = useState<number | ''>('');

  // ── PASO 2: ACTIVIDAD ──
  const [nivelActividad, setNivelActividad] = useState<NivelActividad>(
    (user?.nivelActividad as NivelActividad) || 'moderado'
  );

  // ── PASO 3: OBJETIVO ──
  const [objetivo, setObjetivo] = useState<TipoObjetivo>('deficit_moderado');

  // ── PASO 4: ESTRATEGIA DE MACROS Y COMIDAS ──
  const [ratioProteina, setRatioProteina] = useState<number>(2.0); // g/kg
  const [numComidas, setNumComidas] = useState<number>(4);

  // Sincronización inicial con el perfil del usuario si existe
  useEffect(() => {
    if (user?.edad) setEdad(user.edad);
    if (user?.pesoKg) setPeso(user.pesoKg);
    if (user?.alturaCm) setAltura(user.alturaCm);
    if (user?.genero && user.genero !== 'otro') setGenero(user.genero);
    if (user?.nivelActividad) setNivelActividad(user.nivelActividad as NivelActividad);
  }, [user]);

  // ── CÁLCULOS MATEMÁTICOS CORRELACIONADOS ──
  const entradaMacros: EntradaMacros = { locale, genero, edad, peso, altura, unidadPeso, grasaCorporal, nivelActividad, objetivo, ratioProteina, numComidas };
  const {
    bmr, factoresActividad, factorSeleccionado, tdee, caloriasActividad, objetivosConfig, objetivoActual, caloriasObjetivo, cambioSemanalKg, gramosProteina, gramosGrasas, gramosCarbos, protPorKg, carbPorKg, grasPorKg, pctRealProt, pctRealGras, pctRealCarb, kcalPorComida, protPorComida, carbPorComida, grasPorComida,
  } = calcularPlanMacros(entradaMacros);

  // Copiar resumen del plan
  const copiarPlan = () => {
    const texto = generarTextoPlanMacros(entradaMacros);

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  // ════════════════════════════════════════════════════════════
  // ── EXPORTAR A PDF CON DISEÑO PREMIUM PARA IMPRESIÓN      ──
  // ════════════════════════════════════════════════════════════
  const exportarPDF = () => {
    const printHtml = generarHTMLPlanMacros(entradaMacros);

    // Crear iframe invisible para impresión limpia sin bloquear ventana
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printHtml);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }, 400);
    }
  };

  const reiniciarTodo = () => {
    setGenero('masculino');
    setEdad(26);
    setPeso(75);
    setAltura(178);
    setGrasaCorporal('');
    setNivelActividad('moderado');
    setObjetivo('deficit_moderado');
    setRatioProteina(2.0);
    setNumComidas(4);
    setPaso(1);
  };

  // ════════════════════════════════════════════════════════════
  // ── PANTALLA: RESUMEN FINAL COMPLETO                      ──
  // ════════════════════════════════════════════════════════════
  if (paso === 'resumen') {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn pb-8">
        {/* Cabecera del resumen */}
        <Card className="p-6 sm:p-8 relative overflow-hidden" hoverable={false}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                <Sparkles size={26} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-primary)] block">
                  {locale === 'es' ? 'Plan Calculado con Éxito' : 'Blueprint Calculated'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {locale === 'es' ? 'Tu Plan Nutricional Personalizado' : 'Your Custom Nutrition Blueprint'}
                </h2>
              </div>
            </div>

            {/* Acciones superiores del resumen */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={exportarPDF}
                className="px-4 py-2.5 rounded-xl bg-black/60 hover:bg-white/10 border border-white/15 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow active:scale-95"
                title={locale === 'es' ? 'Exportar a PDF o Imprimir' : 'Export to PDF or Print'}
              >
                <Printer size={15} className="text-[var(--color-primary)]" />
                <span>{locale === 'es' ? 'Imprimir / PDF' : 'Print / PDF'}</span>
              </button>

              <button
                type="button"
                onClick={copiarPlan}
                className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
              >
                {copiado ? <Check size={15} /> : <Copy size={15} />}
                <span>{copiado ? (locale === 'es' ? '¡Copiado!' : 'Copied!') : (locale === 'es' ? 'Copiar Plan' : 'Copy Plan')}</span>
              </button>
            </div>
          </div>

          {/* Calorías Objetivo Centrales */}
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                {locale === 'es' ? 'Meta Calórica Diaria' : 'Target Daily Calories'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black font-mono text-[var(--color-primary)] tracking-tight">
                  {caloriasObjetivo.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-neutral-400">kcal / día</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {objetivoActual.nombre} • {objetivoActual.desc}
              </p>
            </div>

            <div className="sm:text-right flex sm:flex-col justify-between sm:justify-center items-start sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
              <span className="text-xs text-neutral-400 block">
                {locale === 'es' ? 'Ritmo proyectado:' : 'Projected rate:'}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 font-mono font-black text-sm px-3 py-1.5 rounded-full mt-1 ${
                  cambioSemanalKg < 0
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : cambioSemanalKg > 0
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-black/60 text-neutral-300 border border-white/10'
                }`}
              >
                {cambioSemanalKg < 0 ? <ArrowDownRight size={16} /> : cambioSemanalKg > 0 ? <ArrowUpRight size={16} /> : null}
                {cambioSemanalKg > 0 ? `+${cambioSemanalKg}` : cambioSemanalKg} kg / sem
              </span>
            </div>
          </div>

          {/* Desglose de Correlación Matemática (BMR -> TDEE -> Meta) */}
          <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
              {locale === 'es' ? 'Correlación del Gasto Energético:' : 'Energy Expenditure Breakdown:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <HeartPulse size={14} className="text-rose-400" />
                  <span>{locale === 'es' ? 'Metabolismo Basal (BMR)' : 'Basal Rate (BMR)'}</span>
                </div>
                <span className="text-base font-black text-white">{bmr} kcal</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">En reposo absoluto</span>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Activity size={14} className="text-amber-400" />
                  <span>{locale === 'es' ? `Actividad (${factorSeleccionado}x)` : `Activity (${factorSeleccionado}x)`}</span>
                </div>
                <span className="text-base font-black text-amber-400">+{caloriasActividad} kcal</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">{factoresActividad[nivelActividad].nombre}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Scale size={14} className="text-blue-400" />
                  <span>{locale === 'es' ? 'Mantenimiento (TDEE)' : 'Maintenance (TDEE)'}</span>
                </div>
                <span className="text-base font-black text-white">{tdee} kcal</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Gasto real diario</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tarjetas de Macronutrientes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Proteína */}
          <Card className="p-5 space-y-3 border border-blue-500/30" hoverable={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                {locale === 'es' ? 'Proteínas' : 'Protein'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {pctRealProt}% kcal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-3xl sm:text-4xl font-black text-white">{gramosProteina}</span>
              <span className="text-sm font-bold text-neutral-400">g / día</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>{locale === 'es' ? 'Ratio corporal:' : 'Body ratio:'}</span>
              <strong className="text-blue-400">{protPorKg} g/kg</strong>
            </div>
          </Card>

          {/* Carbohidratos */}
          <Card className="p-5 space-y-3 border border-amber-500/30" hoverable={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                {locale === 'es' ? 'Carbohidratos' : 'Carbohydrates'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {pctRealCarb}% kcal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-3xl sm:text-4xl font-black text-white">{gramosCarbos}</span>
              <span className="text-sm font-bold text-neutral-400">g / día</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>{locale === 'es' ? 'Ratio corporal:' : 'Body ratio:'}</span>
              <strong className="text-amber-400">{carbPorKg} g/kg</strong>
            </div>
          </Card>

          {/* Grasas */}
          <Card className="p-5 space-y-3 border border-rose-500/30" hoverable={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                {locale === 'es' ? 'Grasas Saludables' : 'Healthy Fats'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {pctRealGras}% kcal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-3xl sm:text-4xl font-black text-white">{gramosGrasas}</span>
              <span className="text-sm font-bold text-neutral-400">g / día</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>{locale === 'es' ? 'Ratio corporal:' : 'Body ratio:'}</span>
              <strong className="text-rose-400">{grasPorKg} g/kg</strong>
            </div>
          </Card>
        </div>

        {/* Reparto por comidas */}
        <Card className="p-6 space-y-4" hoverable={false}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Utensils size={18} className="text-[var(--color-primary)]" />
              <h3 className="text-sm font-extrabold text-white">
                {locale === 'es' ? `Reparto en ${numComidas} Comidas Diarias` : `Split across ${numComidas} Daily Meals`}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
              ~{kcalPorComida} kcal / {locale === 'es' ? 'comida' : 'meal'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: numComidas }).map((_, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-center">
                <span className="text-xs font-bold text-white block">
                  {locale === 'es' ? `Comida ${idx + 1}` : `Meal ${idx + 1}`}
                </span>
                <span className="text-xs font-mono text-neutral-400 block font-bold">
                  {kcalPorComida} kcal
                </span>
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-[11px] font-mono font-bold">
                  <span className="text-blue-400">{protPorComida}g P</span>
                  <span className="text-amber-400">{carbPorComida}g C</span>
                  <span className="text-rose-400">{grasPorComida}g G</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Botones de acción finales */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={exportarPDF}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
          >
            <Printer size={16} />
            <span>{locale === 'es' ? 'Exportar a PDF / Imprimir' : 'Export to PDF / Print'}</span>
          </button>

          <button
            type="button"
            onClick={reiniciarTodo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-black/60 hover:bg-white/10 border border-white/15 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95"
          >
            <RotateCcw size={16} />
            <span>{locale === 'es' ? 'Hacerlo de nuevo (Reiniciar)' : 'Calculate Again (Reset)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setPaso(1)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-black/60 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Pencil size={15} />
            <span>{locale === 'es' ? 'Modificar mis datos' : 'Edit my inputs'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ── PROCESO PASO A PASO LIMPIO Y ESPACIOSO                ──
  // ════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fadeIn pb-8">
      {/* ── BARRA DE PROGRESO DEL PROCESO ── */}
      <Card className="p-4 sm:p-5" hoverable={false}>
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-neutral-950 font-mono font-black text-xs flex items-center justify-center">
              {paso}
            </span>
            <span className="font-extrabold text-white uppercase tracking-wider">
              {paso === 1 && (locale === 'es' ? 'Paso 1 de 4: Tus Datos Corporales' : 'Step 1 of 4: Body Parameters')}
              {paso === 2 && (locale === 'es' ? 'Paso 2 de 4: Nivel de Actividad' : 'Step 2 of 4: Activity Level')}
              {paso === 3 && (locale === 'es' ? 'Paso 3 de 4: Tu Objetivo Calórico' : 'Step 3 of 4: Calorie Goal')}
              {paso === 4 && (locale === 'es' ? 'Paso 4 de 4: Estrategia de Macros' : 'Step 4 of 4: Macro Strategy')}
            </span>
          </div>
          <span className="font-mono text-neutral-400 text-xs">
            {paso === 1 ? '25%' : paso === 2 ? '50%' : paso === 3 ? '75%' : '100%'}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300 rounded-full"
            style={{
              width: paso === 1 ? '25%' : paso === 2 ? '50%' : paso === 3 ? '75%' : '100%',
            }}
          />
        </div>
      </Card>

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 1: TUS DATOS CORPORALES                       ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 1 && (
        <Card className="p-6 sm:p-8 space-y-6" hoverable={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                <User size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {locale === 'es' ? '1. ¿Cuáles son tus medidas?' : '1. What are your body metrics?'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {locale === 'es'
                    ? 'Necesario para calcular con precisión las calorías basales que quema tu cuerpo.'
                    : 'Needed to accurately compute your baseline metabolic rate.'}
                </p>
              </div>
            </div>

            {/* Sexo biológico */}
            <div className="flex bg-black/60 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setGenero('masculino')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  genero === 'masculino'
                    ? 'bg-[var(--color-primary)] text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {locale === 'es' ? 'Hombre' : 'Male'}
              </button>
              <button
                type="button"
                onClick={() => setGenero('femenino')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  genero === 'femenino'
                    ? 'bg-[var(--color-primary)] text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {locale === 'es' ? 'Mujer' : 'Female'}
              </button>
            </div>
          </div>

          {/* Grid de Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Peso */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300">
                  {locale === 'es' ? 'Peso corporal' : 'Body weight'}
                </label>
                <div className="flex text-[10px] bg-black/80 rounded-lg p-0.5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setUnidadPeso('kg')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      unidadPeso === 'kg' ? 'bg-[var(--color-primary)] text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnidadPeso('lbs')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      unidadPeso === 'lbs' ? 'bg-[var(--color-primary)] text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.5"
                value={peso || ''}
                onChange={(e) => setPeso(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 text-white font-mono font-black text-xl focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="75"
              />
              <span className="text-[11px] text-neutral-500 block">
                {locale === 'es' ? 'Tu peso actual en ayunas' : 'Current morning weight'}
              </span>
            </div>

            {/* Estatura */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                {locale === 'es' ? 'Estatura (cm)' : 'Height (cm)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={altura || ''}
                  onChange={(e) => setAltura(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 text-white font-mono font-black text-xl focus:border-[var(--color-primary)] focus:outline-none"
                  placeholder="178"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500 font-bold">
                  cm
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 block">
                {locale === 'es' ? 'Altura descalzo' : 'Height without shoes'}
              </span>
            </div>

            {/* Edad */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">
                {locale === 'es' ? 'Edad (años)' : 'Age (years)'}
              </label>
              <input
                type="number"
                value={edad || ''}
                onChange={(e) => setEdad(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 text-white font-mono font-black text-xl focus:border-[var(--color-primary)] focus:outline-none"
                placeholder="26"
              />
              <span className="text-[11px] text-neutral-500 block">
                {locale === 'es' ? 'Ajuste del ritmo metabólico' : 'Metabolic rate factor'}
              </span>
            </div>

            {/* % Grasa Corporal (Opcional) */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300">
                  {locale === 'es' ? '% Grasa corporal' : 'Body fat %'}
                </label>
                <span className="text-[10px] text-[var(--color-primary)] font-mono">
                  {locale === 'es' ? 'Opcional' : 'Optional'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  placeholder="15"
                  value={grasaCorporal}
                  onChange={(e) => setGrasaCorporal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 text-white font-mono font-black text-xl focus:border-[var(--color-primary)] focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500 font-bold">
                  %
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 block">
                {locale === 'es' ? 'Si lo conoces, usa fórmula magra' : 'Enables Katch-McArdle formula'}
              </span>
            </div>
          </div>

          {/* Botón Siguiente */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => setPaso(2)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Siguiente: Nivel de Actividad' : 'Next: Activity Level'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 2: NIVEL DE ACTIVIDAD                         ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 2 && (
        <Card className="p-6 sm:p-8 space-y-6" hoverable={false}>
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <Activity size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {locale === 'es' ? '2. ¿Cuál es tu nivel de actividad física?' : '2. What is your activity level?'}
              </h3>
              <p className="text-xs text-neutral-400">
                {locale === 'es'
                  ? 'Selecciona la opción que mejor describa tu semana habitual de entrenamiento.'
                  : 'Pick the option that best reflects your weekly workout routine.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(Object.keys(factoresActividad) as NivelActividad[]).map((key) => {
              const item = factoresActividad[key];
              const activo = nivelActividad === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNivelActividad(key)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    activo
                      ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white shadow-lg ring-1 ring-[var(--color-primary)]/40'
                      : 'bg-black/60 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-extrabold ${activo ? 'text-[var(--color-primary)]' : 'text-neutral-200'}`}>
                        {item.nombre}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/80 text-neutral-400 border border-white/10">
                        {item.entreno}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      activo
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-neutral-950'
                        : 'border-white/15 bg-black/80'
                    }`}>
                      {activo && <Check size={14} strokeWidth={3} />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navegación Paso 2 */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="px-5 py-3 rounded-2xl bg-black/60 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>{locale === 'es' ? 'Anterior' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaso(3)}
              className="px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Siguiente: Tu Objetivo' : 'Next: Calorie Goal'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 3: OBJETIVO NUTRICIONAL                       ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 3 && (
        <Card className="p-6 sm:p-8 space-y-6" hoverable={false}>
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <Target size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {locale === 'es' ? '3. ¿Cuál es tu objetivo principal?' : '3. What is your primary fitness goal?'}
              </h3>
              <p className="text-xs text-neutral-400">
                {locale === 'es'
                  ? 'Ajustaremos tu superávit o déficit respecto a tus calorías de mantenimiento.'
                  : 'We will adjust surplus or deficit relative to your maintenance burn.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(Object.keys(objetivosConfig) as TipoObjetivo[]).map((key) => {
              const item = objetivosConfig[key];
              const activo = objetivo === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setObjetivo(key)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    activo
                      ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white shadow-lg ring-1 ring-[var(--color-primary)]/40'
                      : 'bg-black/60 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-extrabold ${activo ? 'text-[var(--color-primary)]' : 'text-neutral-200'}`}>
                        {item.nombre}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          item.tipo === 'cut'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            : item.tipo === 'bulk'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            : 'bg-black/80 text-neutral-300 border border-white/10'
                        }`}
                      >
                        {item.ritmo}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      activo
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-neutral-950'
                        : 'border-white/15 bg-black/80'
                    }`}>
                      {activo && <Check size={14} strokeWidth={3} />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navegación Paso 3 */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaso(2)}
              className="px-5 py-3 rounded-2xl bg-black/60 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>{locale === 'es' ? 'Anterior' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaso(4)}
              className="px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(219,240,89,0.3)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Siguiente: Estrategia de Macros' : 'Next: Macro Strategy'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── PASO 4: ESTRATEGIA DE MACROS Y COMIDAS             ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {paso === 4 && (
        <Card className="p-6 sm:p-8 space-y-6" hoverable={false}>
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              <Utensils size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {locale === 'es' ? '4. Estrategia de Proteína y Comidas' : '4. Protein Strategy & Meals'}
              </h3>
              <p className="text-xs text-neutral-400">
                {locale === 'es'
                  ? 'La proteína se calcula de acuerdo a tu peso corporal, y el resto se equilibra para darte energía.'
                  : 'Protein is calculated from bodyweight, with carbs and fats fueling your workouts.'}
              </p>
            </div>
          </div>

          {/* Selector de Proteína en g/kg */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-300 block">
              {locale === 'es' ? '¿Cuánta proteína por kilo deseas consumir?' : 'How much protein per kg do you prefer?'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { ratio: 1.8, label: '1.8 g / kg', desc: locale === 'es' ? 'Mantenimiento y Salud' : 'Health & Balance' },
                { ratio: 2.0, label: '2.0 g / kg', desc: locale === 'es' ? 'Óptima para Gimnasio (Estándar)' : 'Gym Optimal (Standard)' },
                { ratio: 2.2, label: '2.2 g / kg', desc: locale === 'es' ? 'Máxima Retención en Déficit' : 'Maximum Retention in Cut' },
              ].map((p) => {
                const activo = ratioProteina === p.ratio;
                return (
                  <button
                    key={p.ratio}
                    type="button"
                    onClick={() => setRatioProteina(p.ratio)}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      activo
                        ? 'bg-blue-500/20 border-blue-500 text-white shadow-md ring-1 ring-blue-500/40'
                        : 'bg-black/60 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm font-mono font-black block">{p.label}</span>
                    <span className="text-xs text-neutral-400 block mt-1">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Número de Comidas */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300">
                {locale === 'es' ? '¿En cuántas comidas prefieres repartirlas?' : 'How many daily meals do you prefer?'}
              </label>
              <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                {numComidas} {locale === 'es' ? 'comidas' : 'meals'}
              </span>
            </div>

            <div className="flex gap-2">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumComidas(n)}
                  className={`flex-1 py-3 rounded-2xl font-mono font-black text-sm border transition-all cursor-pointer ${
                    numComidas === n
                      ? 'bg-[var(--color-primary)] text-neutral-950 border-[var(--color-primary)] shadow-md'
                      : 'bg-black/60 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación Paso 4 -> GENERAR RESUMEN */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPaso(3)}
              className="px-5 py-3 rounded-2xl bg-black/60 border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>{locale === 'es' ? 'Anterior' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaso('resumen')}
              className="px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(219,240,89,0.35)] active:scale-95"
            >
              <span>{locale === 'es' ? 'Ver Mi Resumen Completo' : 'View Full Blueprint'}</span>
              <Sparkles size={16} />
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
