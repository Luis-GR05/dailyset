import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, Input, BotonPrimario, Loading } from "../componentes";
import { useEjercicios } from '../context/EjerciciosContext';
import type { Ejercicio } from '../context/EjerciciosContext';
import FormularioEjercicio from '../componentes/forms/FormularioEjercicio';
import { Pencil, Trash2, X, Dumbbell, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

type Modal =
  | { tipo: 'crear' }
  | { tipo: 'editar'; ejercicio: Ejercicio }
  | { tipo: 'confirmarEliminar'; ejercicio: Ejercicio }
  | null;

const CATEGORY_LABELS: Record<string, string> = {
  strength: 'Fuerza',
  stretching: 'Estiramiento',
  plyometrics: 'Pliométrico',
  strongman: 'Strongman',
  powerlifting: 'Powerlifting',
  olympic_weightlifting: 'Halterofilia',
  cardio: 'Cardio',
  general: 'General',
};

const CATEGORY_COLORS: Record<string, string> = {
  strength: 'var(--color-primary)',
  stretching: '#34d399',
  plyometrics: '#f59e0b',
  strongman: '#ef4444',
  powerlifting: '#8b5cf6',
  olympic_weightlifting: '#06b6d4',
  cardio: '#ec4899',
  general: 'var(--color-neutral-2000)',
};

export const MUSCLE_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  abductors: { es: 'Abductores', en: 'Abductors' },
  abs: { es: 'Abdominales', en: 'Abs' },
  adductors: { es: 'Aductores', en: 'Adductors' },
  biceps: { es: 'Bíceps', en: 'Biceps' },
  calves: { es: 'Gemelos', en: 'Calves' },
  cardio: { es: 'Cardio', en: 'Cardio' },
  delts: { es: 'Deltoides (Hombros)', en: 'Deltoids' },
  forearms: { es: 'Antebrazos', en: 'Forearms' },
  glutes: { es: 'Glúteos', en: 'Glutes' },
  hamstrings: { es: 'Isquiotibiales', en: 'Hamstrings' },
  lats: { es: 'Dorsales', en: 'Lats' },
  'levator-scapulae': { es: 'Elevador de la escápula', en: 'Levator Scapulae' },
  pectorals: { es: 'Pectorales', en: 'Pectorals' },
  quads: { es: 'Cuádriceps', en: 'Quads' },
  'serratus-anterior': { es: 'Serrato anterior', en: 'Serratus Anterior' },
  spine: { es: 'Espina / Lumbar', en: 'Spine / Lower Back' },
  traps: { es: 'Trapecios', en: 'Traps' },
  triceps: { es: 'Tríceps', en: 'Triceps' },
  'upper-back': { es: 'Espalda superior', en: 'Upper Back' },
};

export const EQUIPMENT_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  barbell: { es: 'Barra', en: 'Barbell' },
  dumbbell: { es: 'Mancuerna', en: 'Dumbbell' },
  cable: { es: 'Polea', en: 'Cable' },
  machine: { es: 'Máquina', en: 'Machine' },
  bodyweight: { es: 'Peso corporal', en: 'Bodyweight' },
  band: { es: 'Banda elástica', en: 'Band' },
  kettlebell: { es: 'Pesa rusa (Kettlebell)', en: 'Kettlebell' },
  smith: { es: 'Máquina Smith', en: 'Smith' },
  'ez-bar': { es: 'Barra Z', en: 'EZ Bar' },
  lever: { es: 'Palanca', en: 'Lever' },
  other: { es: 'Otro', en: 'Other' },
};

const MIN_EXERCISES_PER_CATEGORY = 2;
const normalizeCategory = (cat?: string) => (cat === 'general' ? 'all' : (cat ?? 'all'));

export default function EjerciciosPage() {
  const { ejercicios, cargando, error, agregarEjercicio, editarEjercicio, eliminarEjercicio } = useEjercicios();
  const { t, locale } = useI18n();

  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [filtroMusculo, setFiltroMusculo] = useState<string>('all');
  const [filtroEquipamiento, setFiltroEquipamiento] = useState<string>('all');
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Categorías del select (sin "general", unificada dentro de "all")
  const categoriasConConteo = useMemo(() => {
    const counts = new Map<string, number>();

    ejercicios.forEach((ej) => {
      const cat = normalizeCategory(ej.categoriaEjercicio);
      if (cat === 'all') return;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .filter(([, count]) => count >= MIN_EXERCISES_PER_CATEGORY)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ cat, count }));
  }, [ejercicios]);

  // Músculos únicos presentes
  const musculos = useMemo(() => {
    const set = new Set<string>();
    ejercicios.forEach(e => e.musculosPrimarios.forEach(m => set.add(m)));
    return [...set].sort();
  }, [ejercicios]);

  // Equipamientos únicos
  const equipamientos = useMemo(() => {
    const set = new Set<string>();
    ejercicios.forEach(e => {
      if (e.equipamiento) set.add(e.equipamiento);
    });
    return [...set].sort();
  }, [ejercicios]);

  const getMuscleText = (m: string) => {
    const item = MUSCLE_TRANSLATIONS[m.toLowerCase()];
    return item ? (locale === 'es' ? item.es : item.en) : m;
  };

  const getEquipmentText = (eq: string) => {
    const item = EQUIPMENT_TRANSLATIONS[eq.toLowerCase()];
    return item ? (locale === 'es' ? item.es : item.en) : eq;
  };

  const ejerciciosFiltrados = useMemo(() => {
    return ejercicios.filter(ej => {
      const categoriaNormalizada = normalizeCategory(ej.categoriaEjercicio);
      const matchCat = filtroCategoria === 'all' || categoriaNormalizada === filtroCategoria;
      const matchMus = filtroMusculo === 'all' || ej.musculosPrimarios.includes(filtroMusculo);
      const matchEq = filtroEquipamiento === 'all' || ej.equipamiento === filtroEquipamiento;
      const matchBus = busqueda === '' ||
        ej.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        ej.grupo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (ej.equipamiento ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
        ej.musculosPrimarios.some(m => getMuscleText(m).toLowerCase().includes(busqueda.toLowerCase()));
      return matchCat && matchMus && matchEq && matchBus;
    });
  }, [ejercicios, filtroCategoria, filtroMusculo, filtroEquipamiento, busqueda, locale]);

  // Reset page when filters change
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroCategoria, filtroMusculo, filtroEquipamiento, busqueda]);

  const totalPaginas = Math.ceil(ejerciciosFiltrados.length / ITEMS_PER_PAGE);
  const ejerciciosPaginados = ejerciciosFiltrados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  const getNumerosDePagina = () => {
    const paginas = [];
    if (totalPaginas <= 5) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      // Siempre mostrar primera
      paginas.push(1);
      if (paginaActual > 3) paginas.push('...');

      const inicio = Math.max(2, paginaActual - 1);
      const fin = Math.min(totalPaginas - 1, paginaActual + 1);

      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }

      if (paginaActual < totalPaginas - 2) paginas.push('...');
      paginas.push(totalPaginas);
    }
    return paginas;
  };

  const handleGuardar = async (data: Omit<Ejercicio, 'id'>) => {
    if (modal?.tipo === 'crear') {
      await agregarEjercicio(data);
    } else if (modal?.tipo === 'editar') {
      await editarEjercicio({ ...data, id: modal.ejercicio.id });
    }
    setModal(null);
  };

  const handleEliminar = async () => {
    if (modal?.tipo === 'confirmarEliminar') {
      await eliminarEjercicio(modal.ejercicio.id);
    }
    setModal(null);
  };

  const catLabel = (cat: string) => CATEGORY_LABELS[cat] ?? cat;
  const catColor = (cat: string) => CATEGORY_COLORS[cat] ?? 'var(--color-neutral-2000)';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <TituloPagina titulo={t.exercises.title} />
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-neutral-2000)' }}
            />
            <Input
              type="text"
              placeholder={locale === 'es' ? 'Buscar por nombre, músculo o equipo...' : 'Search by name, muscle or equipment...'}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 rounded-2xl py-3 w-full"
            />
          </div>
          <div onClick={() => setModal({ tipo: 'crear' })} className="cursor-pointer flex-shrink-0">
            <BotonPrimario>+ {t.exercises.newExercise}</BotonPrimario>
          </div>
        </div>

        {/* Filtros compactos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Categoría */}
          <div className="card p-2.5 sm:p-3 rounded-2xl">
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-neutral-2000)' }}>
              {locale === 'es' ? 'Categoría' : 'Category'}
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full"
            >
              <option value="all">{locale === 'es' ? 'Todas' : 'All'}</option>
              {categoriasConConteo.map(({ cat, count }) => (
                <option key={cat} value={cat}>
                  {catLabel(cat)} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Músculo */}
          {musculos.length > 0 && (
            <div className="card p-2.5 sm:p-3 rounded-2xl">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-neutral-2000)' }}>
                {locale === 'es' ? 'Músculo' : 'Muscle'}
              </label>
              <select
                value={filtroMusculo}
                onChange={(e) => setFiltroMusculo(e.target.value)}
                className="w-full capitalize"
              >
                <option value="all">{locale === 'es' ? 'Todos los músculos' : 'All muscles'}</option>
                {musculos.map((m) => (
                  <option key={m} value={m}>
                    {getMuscleText(m)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Equipamiento */}
          {equipamientos.length > 0 && (
            <div className="card p-2.5 sm:p-3 rounded-2xl">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-neutral-2000)' }}>
                {locale === 'es' ? 'Equipamiento' : 'Equipment'}
              </label>
              <select
                value={filtroEquipamiento}
                onChange={(e) => setFiltroEquipamiento(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{
                  backgroundColor: 'var(--color-neutral-800)',
                  border: '1px solid var(--color-neutral-900)',
                  color: 'var(--color-white)',
                }}
              >
                <option value="all">{locale === 'es' ? 'Todo el equipamiento' : 'All equipment'}</option>
                {equipamientos.map((eq) => (
                  <option key={eq} value={eq}>
                    {getEquipmentText(eq)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Contador */}
        {!cargando && (
          <p className="text-sm" style={{ color: 'var(--color-neutral-2000)' }}>
            {ejerciciosFiltrados.length} {locale === 'es' ? 'ejercicios' : 'exercises'}
          </p>
        )}

        {/* Estado de carga / error */}
        {cargando && <div className="py-10"><Loading /></div>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Grid de ejercicios */}
        {!cargando && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-5 items-stretch">
            {ejerciciosPaginados.length > 0 ? (
              ejerciciosPaginados.map((ejercicio) => (
                <div key={ejercicio.id} className="relative group h-full">
                  <Link to={`/ejercicios/${ejercicio.id}`} className="block h-full">
                    <div className="card card-hover overflow-hidden flex flex-col h-full">
                      {/* Imagen — altura fija */}
                      <div className="w-full aspect-square overflow-hidden relative flex-shrink-0" style={{ backgroundColor: 'var(--color-neutral-700)' }}>
                        {ejercicio.imagenInicio ? (
                          <img
                            src={ejercicio.imagenInicio}
                            alt={ejercicio.nombre}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Dumbbell size={28} style={{ color: 'var(--color-neutral-900)' }} />
                          </div>
                        )}

                        {/* Insignia GIF */}
                        {ejercicio.imagenInicio?.endsWith('.gif') && (
                          <span
                            className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase bg-black/60 text-white backdrop-blur-md border border-white/20"
                          >
                            GIF
                          </span>
                        )}

                        {/* Badge categoría */}
                        <span
                          className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${catColor(ejercicio.categoriaEjercicio)}22`,
                            color: catColor(ejercicio.categoriaEjercicio),
                            border: `1px solid ${catColor(ejercicio.categoriaEjercicio)}44`,
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {catLabel(ejercicio.categoriaEjercicio)}
                        </span>
                      </div>
                      {/* Info — amplia para que los títulos nunca se corten */}
                      <div className="p-3.5 flex flex-col justify-between flex-1 min-h-[108px] gap-2">
                        <h3
                          className="font-bold text-xs sm:text-sm leading-snug line-clamp-2"
                          style={{
                            color: 'var(--color-white)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={ejercicio.nombre}
                        >
                          {ejercicio.nombre}
                        </h3>
                        <div className="pt-1 border-t border-neutral-800/60">
                          <p className="text-xs capitalize" style={{ color: 'var(--color-neutral-2000)' }}>
                            {ejercicio.grupo || ejercicio.musculosPrimarios[0] || '—'}
                          </p>
                          {ejercicio.equipamiento && (
                            <p className="text-xs capitalize truncate" style={{ color: 'var(--color-neutral-1000)' }}>
                              {ejercicio.equipamiento}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Acciones hover (solo si es del usuario) */}
                  {!ejercicio.esPublico || ejercicio.externalId === undefined ? null : null}
                  <div
                    className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ zIndex: 10 }}
                  >
                    <button
                      className="card-action-btn"
                      title={t.exercises.editExercise}
                      onClick={(e) => { e.preventDefault(); setModal({ tipo: 'editar', ejercicio }); }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      className="card-action-btn danger"
                      title={t.exercises.deleteExercise}
                      onClick={(e) => { e.preventDefault(); setModal({ tipo: 'confirmarEliminar', ejercicio }); }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 col-span-full py-16 text-center">
                {locale === 'es'
                  ? 'No se encontraron ejercicios con esos filtros.'
                  : 'No exercises matched your filters.'}
              </p>
            )}
          </div>
        )}

        {/* Paginación */}
        {!cargando && totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            {getNumerosDePagina().map((pag, index) => {
              if (pag === '...') {
                return <span key={`ellipsis-${index}`} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-500">...</span>;
              }
              return (
                <button
                  key={pag}
                  onClick={() => setPaginaActual(pag as number)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl font-bold transition-colors ${paginaActual === pag
                      ? 'bg-neutral-800 text-white border-neutral-700'
                      : 'border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  style={paginaActual === pag ? { borderWidth: '1px' } : undefined}
                >
                  {pag}
                </button>
              );
            })}

            <button
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Modal: Crear / Editar */}
      {(modal?.tipo === 'crear' || modal?.tipo === 'editar') && (
        <FormularioEjercicio
          ejercicio={modal.tipo === 'editar' ? modal.ejercicio : null}
          onGuardar={handleGuardar}
          onCerrar={() => setModal(null)}
        />
      )}

      {/* Modal: Confirmar eliminación */}
      {modal?.tipo === 'confirmarEliminar' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-white)' }}>{t.exercises.deleteExercise}</h2>
              <button className="modal-close-btn" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-form">
              <p className="text-sm" style={{ color: 'var(--color-neutral-3000)' }}>
                ¿Seguro que quieres eliminar <strong style={{ color: 'var(--color-white)' }}>"{modal.ejercicio.nombre}"</strong>?
                {` ${t.exercises.confirmDeleteDesc}`}
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setModal(null)}>{t.exercises.cancel}</button>
                <button
                  className="btn"
                  style={{ background: '#ef4444', color: 'white' }}
                  onClick={handleEliminar}
                >
                  {t.exercises.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}