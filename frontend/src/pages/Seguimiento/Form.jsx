import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProyectoDocente, getSeguimiento, createSeguimiento, updateSeguimiento } from '../../api/proyectosDocente';
import { Save, Plus } from 'lucide-react';

const SeguimientoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [seguimiento, setSeguimiento] = useState([]);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    desarrollo: '',
    porcentaje_avance: 0,
    estado: 'CUMPLIDO',
    observaciones: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      console.log('Fetching data for proyecto id:', id);
      const [proyectoData, seguimientoData] = await Promise.all([
        getProyectoDocente(id),
        getSeguimiento(id)
      ]);
      console.log('Proyecto data:', proyectoData);
      console.log('Seguimiento data:', seguimientoData);
      setProyecto(proyectoData);
      setSeguimiento(seguimientoData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setProyecto(null);
      setSeguimiento([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        proyecto_docente_id: parseInt(id),
        asignatura_id: proyecto.asignatura_id,
        docente_id: proyecto.docente_id,
        fecha: new Date(nuevoRegistro.fecha).toISOString(),
        descripcion: nuevoRegistro.descripcion,
        desarrollo: nuevoRegistro.desarrollo,
        porcentaje_avance: nuevoRegistro.porcentaje_avance,
        estado: nuevoRegistro.estado,
        observaciones: nuevoRegistro.observaciones
      };
      console.log('Creating seguimiento with data:', dataToSend);
      await createSeguimiento(id, dataToSend);
      setNuevoRegistro({
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        desarrollo: '',
        porcentaje_avance: 0,
        estado: 'CUMPLIDO',
        observaciones: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating seguimiento:', error);
      console.error('Error response:', error.response?.data);
      alert('Error al crear el registro de seguimiento. Verifique los datos e intente nuevamente.');
    }
  };

  const handleUpdate = async (seg) => {
    try {
      await updateSeguimiento(id, seg.id, seg);
      fetchData();
    } catch (error) {
      console.error('Error updating seguimiento:', error);
    }
  };

  if (loading) return <div className="p-8 text-[#4A4A4A]">Cargando...</div>;

  if (!proyecto) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-[#4A4A4A] mb-4">No se pudo cargar el proyecto docente.</p>
          <button onClick={() => navigate('/seguimiento')} className="text-[#F5A623] font-semibold hover:text-[#E09415]">
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Seguimiento - <span className="text-[#F5A623]">{proyecto.asignatura?.nombre}</span></h1>
        <button onClick={() => navigate('/seguimiento')} className="text-[#4A4A4A] hover:text-[#1E1E1E]">
          Volver
        </button>
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

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Nuevo Registro de Seguimiento</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Fecha</label>
            <input
              type="date"
              value={nuevoRegistro.fecha}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, fecha: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Estado</label>
            <select
              value={nuevoRegistro.estado}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, estado: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
            >
              <option value="CUMPLIDO">CUMPLIDO</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="REPROGRAMADO">REPROGRAMADO</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Tema / Descripción</label>
            <input
              type="text"
              value={nuevoRegistro.descripcion}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, descripcion: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Desarrollo de la Clase</label>
            <textarea
              value={nuevoRegistro.desarrollo}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, desarrollo: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Porcentaje de Avance (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={nuevoRegistro.porcentaje_avance}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, porcentaje_avance: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Observaciones</label>
            <textarea
              value={nuevoRegistro.observaciones}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, observaciones: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-20"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Registro
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Historial de Seguimiento</h3>
        {seguimiento.length > 0 ? (
          <div className="space-y-4">
            {seguimiento.map((seg) => (
              <div key={seg.id} className="border border-[#F0F0F0] p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-[#1E1E1E]">{new Date(seg.fecha).toLocaleDateString()}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ` + (
                      seg.estado === 'CUMPLIDO' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      seg.estado === 'PENDIENTE' ? 'bg-[#FEF3C7] text-[#92600A]' :
                      'bg-[#F0F0F0] text-[#666666]'
                    )}>
                      {seg.estado}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#1E1E1E]">{seg.porcentaje_avance}%</span>
                </div>
                <p className="font-semibold text-[#1E1E1E]">{seg.descripcion}</p>
                <p className="text-[#4A4A4A] text-sm mt-1">{seg.desarrollo}</p>
                {seg.observaciones && (
                  <p className="text-[#7A7A7A] text-sm mt-2">Obs: {seg.observaciones}</p>
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

export default SeguimientoForm;
