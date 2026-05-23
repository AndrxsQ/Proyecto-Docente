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
      const [proyectoData, seguimientoData] = await Promise.all([
        getProyectoDocente(id),
        getSeguimiento(id)
      ]);
      setProyecto(proyectoData);
      setSeguimiento(seguimientoData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSeguimiento(id, {
        ...nuevoRegistro,
        curso_id: proyecto.curso_id,
        docente_id: proyecto.docente_id
      });
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

  if (loading) return <div className="p-8">Cargando...</div>;

  const avanceTotal = seguimiento.reduce((acc, seg) => {
    return acc + (seg.estado === 'CUMPLIDO' ? seg.porcentaje_avance : 0);
  }, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seguimiento - {proyecto.curso?.nombre}</h1>
        <button onClick={() => navigate('/seguimiento')} className="text-gray-600 hover:text-gray-900">
          Volver
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Avance Total del Curso</span>
          <span className="font-bold">{avanceTotal}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${avanceTotal}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4">Nuevo Registro de Seguimiento</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              value={nuevoRegistro.fecha}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, fecha: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={nuevoRegistro.estado}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, estado: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="CUMPLIDO">CUMPLIDO</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="REPROGRAMADO">REPROGRAMADO</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Tema / Descripción</label>
            <input
              type="text"
              value={nuevoRegistro.descripcion}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, descripcion: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Desarrollo de la Clase</label>
            <textarea
              value={nuevoRegistro.desarrollo}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, desarrollo: e.target.value })}
              className="w-full px-3 py-2 border rounded-md h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Porcentaje de Avance (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={nuevoRegistro.porcentaje_avance}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, porcentaje_avance: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Observaciones</label>
            <textarea
              value={nuevoRegistro.observaciones}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, observaciones: e.target.value })}
              className="w-full px-3 py-2 border rounded-md h-20"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Registro
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4">Historial de Seguimiento</h3>
        {seguimiento.length > 0 ? (
          <div className="space-y-4">
            {seguimiento.map((seg) => (
              <div key={seg.id} className="border p-4 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{new Date(seg.fecha).toLocaleDateString()}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      seg.estado === 'CUMPLIDO' ? 'bg-green-100 text-green-800' :
                      seg.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {seg.estado}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{seg.porcentaje_avance}%</span>
                </div>
                <p className="font-medium">{seg.descripcion}</p>
                <p className="text-gray-600 text-sm mt-1">{seg.desarrollo}</p>
                {seg.observaciones && (
                  <p className="text-gray-500 text-sm mt-2">Obs: {seg.observaciones}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay registros de seguimiento</p>
        )}
      </div>
    </div>
  );
};

export default SeguimientoForm;
