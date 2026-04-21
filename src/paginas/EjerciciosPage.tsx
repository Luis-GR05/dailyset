import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, Input, BotonPrimario, Loading } from "../componentes";
import { useEjercicios } from '../context/EjerciciosContext';
import type { Ejercicio } from '../context/EjerciciosContext';
import FormularioEjercicio from '../componentes/forms/FormularioEjercicio';
import { Pencil, Trash2, X, Dumbbell, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import {
  translateEquipmentEs,
  translateExerciseTitleEs,
  translateMuscleEs,
} from '../lib/exerciseTranslations';

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

const MIN_EXERCISES_PER_CATEGORY = 2;
const normalizeCategory = (cat?: string) => (cat === 'general' ? 'all' : (cat ?? 'all'));

export default function EjerciciosPage() {
  const { ejercicios, cargando, error, agregarEjercicio, editarEjercicio, eliminarEjercicio } = useEjercicios();
  const { t, locale } = useI18n();

  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [filtroMusculo, setFiltroMusculo] = useState<string>('all');
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

  const ejerciciosFiltrados = useMemo(() => {
    return ejercicios.filter(ej => {
      const equipamientoMostrado = ej.equipamiento ?? '';
      const categoriaNormalizada = normalizeCategory(ej.categoriaEjercicio);
      const matchCat = filtroCategoria === 'all' || categoriaNormalizada === filtroCategoria;
      const matchMus = filtroMusculo === 'all' || ej.musculosPrimarios.includes(filtroMusculo);
      const matchBus = busqueda === '' ||
        ej.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        ej.grupo.toLowerCase().includes(busqueda.toLowerCase()) ||
        equipamientoMostrado.toLowerCase().includes(busqueda.toLowerCase());
      return matchCat && matchMus && matchBus;
    });
  }, [ejercicios, filtroCategoria, filtroMusculo, busqueda]);

  // Reset page when filters change
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroCategoria, filtroMusculo, busqueda]);

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
              placeholder={'Buscar por nombre, músculo o equipo...'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card p-2.5 sm:p-3 rounded-2xl">
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-neutral-2000)' }}>
              {locale === 'es' ? 'Categoría' : 'Category'}
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--color-neutral-800)',
                border: '1px solid var(--color-neutral-900)',
                color: 'var(--color-white)',
              }}
            >
              <option value="all">{locale === 'es' ? 'Todos / General' : 'All / General'}</option>
              {categoriasConConteo.map(({ cat, count }) => (
                <option key={cat} value={cat}>
                  {catLabel(cat)} ({count})
                </option>
              ))}
            </select>
          </div>

          {musculos.length > 0 && (
            <div className="card p-2.5 sm:p-3 rounded-2xl">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-neutral-2000)' }}>
                {locale === 'es' ? 'Músculo' : 'Muscle'}
              </label>
              <select
                value={filtroMusculo}
                onChange={(e) => setFiltroMusculo(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{
                  backgroundColor: 'var(--color-neutral-800)',
                  border: '1px solid var(--color-neutral-900)',
                  color: 'var(--color-white)',
                }}
              >
                <option value="all">{locale === 'es' ? 'Todos' : 'All'}</option>
                {musculos.map((m) => (
                  <option key={m} value={m}>
                    {m}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {ejerciciosPaginados.length > 0 ? (
              ejerciciosPaginados.map((ejercicio) => (
                <div key={ejercicio.id} className="relative group">
                  {(() => {
                    const nombreMostrado = locale === 'es'
                      ? translateExerciseTitleEs(ejercicio.nombre)
                      : ejercicio.nombre;
                    const grupoMostrado = locale === 'es'
                      ? translateMuscleEs(ejercicio.grupo || ejercicio.musculosPrimarios[0] || '')
                      : (ejercicio.grupo || ejercicio.musculosPrimarios[0] || '');
                    const equipamientoMostrado = locale === 'es' && ejercicio.equipamiento
                      ? translateEquipmentEs(ejercicio.equipamiento)
                      : ejercicio.equipamiento;
                    return (
                  <Link to={`/ejercicios/${ejercicio.id}`} className="block">
                    <div className="card card-hover overflow-hidden">
                      {/* Imagen */}
                      <div className="w-full aspect-square overflow-hidden relative" style={{ backgroundColor: 'var(--color-neutral-700)' }}>
                        {ejercicio.imagenInicio ? (
                          <img
                            src={ejercicio.imagenInicio}
                            alt={nombreMostrado}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.style.display = 'none';
                              const parent = img.parentElement;
                              if (parent && !parent.querySelector('[data-fallback]')) {
                                const fb = document.createElement('div');
                                fb.setAttribute('data-fallback', '1');
                                fb.className = 'w-full h-full flex items-center justify-center';
                                fb.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="var(--color-neutral-900)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m6.5 6.5 11 11M6.5 17.5l11-11M3 12h3m15 0h-3M12 3v3m0 12v3"/></svg>`;
                                parent.appendChild(fb);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Dumbbell size={28} style={{ color: 'var(--color-neutral-900)' }} />
                          </div>
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
                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-bold text-xs leading-tight line-clamp-2 mb-1" style={{ color: 'var(--color-white)' }}>
                          {nombreMostrado}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--color-neutral-2000)' }}>
                          {grupoMostrado || '—'}
                        </p>
                        {ejercicio.equipamiento && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-neutral-1000)' }}>
                            {equipamientoMostrado}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                    );
                  })()}

                  {/* Acciones hover */}
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
                ¿Seguro que quieres eliminar <strong style={{ color: 'var(--color-white)' }}>"{locale === 'es' ? translateExerciseTitleEs(modal.ejercicio.nombre) : modal.ejercicio.nombre}"</strong>?
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