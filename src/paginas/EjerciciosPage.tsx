import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, TituloPagina, FiltroBoton, Input, BotonPrimario, Loading } from "../componentes";
import { useEjercicios } from '../context/EjerciciosContext';
import type { Ejercicio } from '../context/EjerciciosContext';
import FormularioEjercicio from '../componentes/forms/FormularioEjercicio';
import { Pencil, Trash2, X } from 'lucide-react';

type Modal =
  | { tipo: 'crear' }
  | { tipo: 'editar'; ejercicio: Ejercicio }
  | { tipo: 'confirmarEliminar'; ejercicio: Ejercicio }
  | null;

export default function EjerciciosPage() {
  const { ejercicios, cargando, error, agregarEjercicio, editarEjercicio, eliminarEjercicio } = useEjercicios();

  const [filtroActivo, setFiltroActivo] = useState("Fuerza");
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState<Modal>(null);

  const categorias = [...new Set(ejercicios.map(e => e.categoria))];

  const ejerciciosFiltrados = ejercicios.filter(ejercicio => {
    const coincideFiltro = ejercicio.categoria === filtroActivo;
    const coincideBusqueda = ejercicio.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });

  const handleGuardar = (data: Omit<Ejercicio, 'id'>) => {
    if (modal?.tipo === 'crear') {
      agregarEjercicio(data);
    } else if (modal?.tipo === 'editar') {
      editarEjercicio({ ...data, id: modal.ejercicio.id });
    }
    setModal(null);
  };

  const handleEliminar = () => {
    if (modal?.tipo === 'confirmarEliminar') {
      eliminarEjercicio(modal.ejercicio.id);
    }
    setModal(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <TituloPagina titulo="Ejercicios" />
          <div className="flex-1 w-full">
            <Input
              type="text"
              placeholder="Buscar ejercicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-neutral-900 border-neutral-800 rounded-2xl px-4 py-3 md:px-6 md:py-4 w-full"
            />
          </div>
          <div onClick={() => setModal({ tipo: 'crear' })} className="cursor-pointer flex-shrink-0">
            <BotonPrimario>+ Nuevo Ejercicio</BotonPrimario>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <span className="text-white font-bold text-sm">Filtros:</span>
          {categorias.map((cat) => (
            <div key={cat} onClick={() => setFiltroActivo(cat)} className="cursor-pointer">
              <FiltroBoton
                nombre={cat}
                activo={filtroActivo === cat}
              />
            </div>
          ))}
        </div>

        {/* Estado de carga / error */}
        {cargando && (
          <div className="py-10">
            <Loading />
          </div>
        )}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* Grid de resultados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ejerciciosFiltrados.length > 0 ? (
            ejerciciosFiltrados.map((ejercicio) => (
              <div key={ejercicio.id} className="relative group">
                <Link to={`/ejercicios/${ejercicio.id}`} className="block">
                  <div className="card card-hover overflow-hidden">
                    <div className="w-full aspect-square bg-neutral-800 flex items-center justify-center">
                      {ejercicio.imageUrl ? (
                        <img src={ejercicio.imageUrl} alt={ejercicio.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm">{ejercicio.nombre}</h3>
                      <p className="text-neutral-400 text-xs">{ejercicio.grupo}</p>
                    </div>
                  </div>
                </Link>
                {/* Botones de acción superpuestos */}
                <div
                  className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ zIndex: 10 }}
                >
                  <button
                    className="card-action-btn"
                    title="Editar ejercicio"
                    onClick={(e) => { e.preventDefault(); setModal({ tipo: 'editar', ejercicio }); }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="card-action-btn danger"
                    title="Eliminar ejercicio"
                    onClick={(e) => { e.preventDefault(); setModal({ tipo: 'confirmarEliminar', ejercicio }); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 col-span-full py-10 text-center">
              No se encontraron ejercicios de {filtroActivo.toLowerCase()} que coincidan con tu búsqueda.
            </p>
          )}
        </div>
      </div>

      {/* Modal: Crear / Editar ejercicio */}
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
              <h2 className="text-lg font-bold text-white">Eliminar Ejercicio</h2>
              <button className="modal-close-btn" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-form">
              <p className="text-neutral-300 text-sm">
                ¿Seguro que quieres eliminar <strong className="text-white">"{modal.ejercicio.nombre}"</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                <button
                  className="btn"
                  style={{ background: '#ef4444', color: 'white' }}
                  onClick={handleEliminar}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}