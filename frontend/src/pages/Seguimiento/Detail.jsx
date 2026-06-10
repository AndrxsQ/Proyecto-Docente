import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProyectoDocente, getSeguimiento, updateSeguimiento, getContenido } from '../../api/proyectosDocente';
import { ArrowLeft, Plus, Edit, Save, X } from 'lucide-react';

const SeguimientoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [proyecto, setProyecto] = useState(null);
  const [seguimiento, setSeguimiento] = useState([]);
  const [contenido, setContenido] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [proyectoData, seguimientoData, contenidoData] = await Promise.all([
        getProyectoDocente(id),
        getSeguimiento(id),
        getContenido(id)
      ]);
      setProyecto(proyectoData);
      setSeguimiento(seguimientoData || []);
      setContenido(contenidoData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setProyecto(null);
      setSeguimiento([]);
      setContenido([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (seg) => {
    setEditingId(seg.id);
    setEditForm({
      fecha: seg.fecha.split('T')[0],
      tema_desarrollado: seg.tema_desarrollado || '',
      descripcion_tema: seg.descripcion_tema || '',
      estado: seg.estado,
      observaciones: seg.observaciones || '',
      modalidad_entorno: seg.modalidad_entorno || '',
      modalidad_sincronia: seg.modalidad_sincronia || '',
      modalidad_enfoque: seg.modalidad_enfoque || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    try {
      await updateSeguimiento(id, editingId, editForm);
      setEditingId(null);
      setEditForm({});
      fetchData();
    } catch (error) {
      console.error('Error updating seguimiento:', error);
      alert('Error al actualizar el registro de seguimiento');
    }
  };

  if (loading) return <div className="p-8 text-[#4A4A4A]">Cargando...</div>;

  if (!proyecto) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-[#4A4A4A] mb-4">No se pudo cargar el proyecto docente.</p>
          <button onClick={() => navigate('/seguimiento', { state: { filters: location.state?.filters } })} className="text-[#F5A623] font-semibold hover:text-[#E09415]">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const avanceTotal = (seguimiento || []).reduce((acc, seg) => {
    return acc + (seg.estado === 'CUMPLIDO' ? seg.porcentaje_avance : 0);
  }, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-white py-4 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Seguimiento - <span className="text-[#F5A623]">{proyecto.asignatura?.nombre}</span></h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/seguimiento/${id}`, { state: { filters: location.state?.filters } })}
            className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Registro
          </button>
          <button onClick={() => navigate('/seguimiento', { state: { filters: location.state?.filters } })} className="text-[#4A4A4A] hover:text-[#1E1E1E]">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-[#1E1E1E]">Avance Total de la Asignatura</span>
          <span className="font-bold text-[#1E1E1E]">{avanceTotal}%</span>
        </div>
        <div className="w-full bg-[#E5E7EB] rounded-full h-4">
          <div className={(avanceTotal === 100 ? 'bg-[#38A169]' : 'bg-[#F5A623]') + ' h-4 rounded-full transition-all'} style={{ width: `${avanceTotal}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Historial de Seguimiento</h3>
        {seguimiento.length > 0 ? (
          <div className="space-y-4">
            {seguimiento.map((seg) => (
              <div key={seg.id} className={`border p-4 rounded-xl ${editingId === seg.id ? 'border-[#F5A623] border-2 bg-[#FFF8EC]' : 'border-[#F0F0F0]'}`}>
                {editingId === seg.id ? (
                  <div className="space-y-4">
                    <div className="mb-2">
                      <span className="font-semibold text-[#1E1E1E]">Semana {seg.semana} - Sesión {seg.sesion}</span>
                    </div>
                    
                    {(() => {
                      const selectedContenido = contenido.find(c => c.semana === seg.semana && c.sesion === seg.sesion);
                      if (selectedContenido) {
                        return (
                          <div className="p-4 bg-[#FFF8EC] rounded-lg border border-[#F5A623]/20">
                            <h4 className="font-semibold text-[#1E1E1E] mb-2">Información de la Sesión</h4>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-[#4A4A4A]">Tema Programado:</span>
                                <p className="text-[#1E1E1E]">{selectedContenido.tema || 'No especificado'}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-[#4A4A4A]">Descripción:</span>
                                <p className="text-[#1E1E1E]">{selectedContenido.descripcion || 'No especificado'}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Fecha</label>
                        <input
                          type="date"
                          value={editForm.fecha}
                          onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
                          className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Estado</label>
                        <select
                          value={editForm.estado}
                          onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                          className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                        >
                          <option value="CUMPLIDO">CUMPLIDO</option>
                          <option value="PENDIENTE">PENDIENTE</option>
                          <option value="REPROGRAMADO">REPROGRAMADO</option>
                        </select>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-md font-semibold text-[#1E1E1E] mb-3">Modalidades de Enseñanza</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Según el Entorno</label>
                          <select
                            value={editForm.modalidad_entorno}
                            onChange={(e) => setEditForm({ ...editForm, modalidad_entorno: e.target.value })}
                            className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                          >
                            <option value="">Seleccionar</option>
                            <option value="Presencial">Presencial</option>
                            <option value="Virtual o en línea">Virtual o en línea</option>
                            <option value="Semipresencial o híbrida">Semipresencial o híbrida</option>
                            <option value="A distancia">A distancia</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Según la Sincronía</label>
                          <select
                            value={editForm.modalidad_sincronia}
                            onChange={(e) => setEditForm({ ...editForm, modalidad_sincronia: e.target.value })}
                            className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                          >
                            <option value="">Seleccionar</option>
                            <option value="Sincrónica">Sincrónica</option>
                            <option value="Asincrónica">Asincrónica</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Según el Enfoque Pedagógico</label>
                          <select
                            value={editForm.modalidad_enfoque}
                            onChange={(e) => setEditForm({ ...editForm, modalidad_enfoque: e.target.value })}
                            className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                          >
                            <option value="">Seleccionar</option>
                            <option value="Magistral o expositiva">Magistral o expositiva</option>
                            <option value="Activa o participativa">Activa o participativa</option>
                            <option value="Invertida (Flipped Classroom)">Invertida (Flipped Classroom)</option>
                            <option value="Por proyectos (ABP)">Por proyectos (ABP)</option>
                            <option value="Por problemas">Por problemas</option>
                            <option value="Tutoría o mentoría">Tutoría o mentoría</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Tema Desarrollado</label>
                      <input
                        type="text"
                        value={editForm.tema_desarrollado}
                        onChange={(e) => setEditForm({ ...editForm, tema_desarrollado: e.target.value })}
                        className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Descripción del Tema</label>
                      <textarea
                        value={editForm.descripcion_tema}
                        onChange={(e) => setEditForm({ ...editForm, descripcion_tema: e.target.value })}
                        className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 h-20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Observaciones</label>
                      <textarea
                        value={editForm.observaciones}
                        onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                        className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 h-20"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center bg-[#38A169] text-white font-semibold px-3 py-1 rounded-lg hover:bg-[#2F855A] transition-colors"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Guardar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center bg-[#E53E3E] text-white font-semibold px-3 py-1 rounded-lg hover:bg-[#C53030] transition-colors"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-[#1E1E1E]">Semana {seg.semana} - Sesión {seg.sesion}</span>
                        <span className="ml-2 text-sm text-[#4A4A4A]">{new Date(seg.fecha).toLocaleDateString()}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ` + (
                          seg.estado === 'CUMPLIDO' ? 'bg-[#D1FAE5] text-[#065F46]' :
                          seg.estado === 'PENDIENTE' ? 'bg-[#FEF3C7] text-[#92600A]' :
                          'bg-[#F0F0F0] text-[#666666]'
                        )}>
                          {seg.estado}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1E1E1E]">{seg.porcentaje_avance}%</span>
                        <button
                          onClick={() => handleStartEdit(seg)}
                          className="text-[#F5A623] hover:text-[#E09415]"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-[#1E1E1E]">{seg.tema_desarrollado || seg.descripcion || 'Sin tema'}</p>
                    {seg.descripcion_tema && (
                      <p className="text-[#4A4A4A] text-sm mt-1">{seg.descripcion_tema}</p>
                    )}
                    {seg.observaciones && (
                      <p className="text-[#7A7A7A] text-sm mt-2">Obs: {seg.observaciones}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#4A4A4A]">No hay registros de seguimiento</p>
        )}
      </div>
    </div>
  );
};

export default SeguimientoDetail;
