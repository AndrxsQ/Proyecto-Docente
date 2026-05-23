import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProyectosDocentes, createProyectoDocente } from '../../api/proyectosDocente';
import { getCursos } from '../../api/cursos';
import { useAuth } from '../../context/AuthContext';
import { Plus, Eye, Edit } from 'lucide-react';

const ProyectoDocenteList = () => {
  const [proyectos, setProyectos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const filters = {};
      if (user.rol === 'DOCENTE') {
        filters.docente_id = user.id;
      }
      const [proyectosData, cursosData] = await Promise.all([
        getProyectosDocentes(filters),
        getCursos(user.rol === 'DOCENTE' ? { docente_id: user.id } : {})
      ]);
      setProyectos(proyectosData);
      setCursos(cursosData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProyectoDocente({ curso_id: parseInt(selectedCurso), docente_id: user.id });
      setShowNewModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating proyecto:', error);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'BORRADOR': 'bg-gray-100 text-gray-800',
      'EN_REVISION_JEFE': 'bg-yellow-100 text-yellow-800',
      'EN_REVISION_COMITE': 'bg-yellow-100 text-yellow-800',
      'EN_APROBACION_DECANO': 'bg-yellow-100 text-yellow-800',
      'DEVUELTO_DOCENTE': 'bg-red-100 text-red-800',
      'APROBADO': 'bg-green-100 text-green-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Proyectos Docente</h1>
        {user.rol === 'DOCENTE' && (
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Curso</th>
                <th className="text-left p-4">Versión</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-left p-4">Última Modificación</th>
                <th className="text-left p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((proyecto) => (
                <tr key={proyecto.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{proyecto.curso?.nombre}</td>
                  <td className="p-4">{proyecto.version}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(proyecto.estado)}`}>
                      {proyecto.estado.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">{new Date(proyecto.ultima_modificacion).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/proyectos-docente/${proyecto.id}`)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(user.rol === 'DOCENTE' || user.rol === 'ADMIN') && (
                        <button
                          onClick={() => navigate(`/proyectos-docente/${proyecto.id}/edit`)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Proyecto Docente</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Curso</label>
                <select
                  value={selectedCurso}
                  onChange={(e) => setSelectedCurso(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProyectoDocenteList;
