import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProyectosDocente } from '../../api/proyectosDocente';
import { getCursos } from '../../api/cursos';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';

const SeguimientoList = () => {
  const [proyectos, setProyectos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const filters = { estado: 'APROBADO' };
      if (user.rol === 'DOCENTE') {
        filters.docente_id = user.id;
      }
      const [proyectosData, cursosData] = await Promise.all([
        getProyectosDocente(filters),
        getCursos(user.rol === 'DOCENTE' ? { docente_id: user.id } : {})
      ]);
      setProyectos(proyectosData);
      setCursos(cursosData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleNuevoSeguimiento = () => {
    if (selectedCurso) {
      const proyecto = proyectos.find(p => p.curso_id === parseInt(selectedCurso));
      if (proyecto) {
        navigate(`/seguimiento/${proyecto.id}`);
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Seguimiento de Clases</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Seleccionar Curso</label>
            <select
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Seleccionar curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleNuevoSeguimiento}
            disabled={!selectedCurso}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Registro
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Curso</th>
                <th className="text-left p-4">Versión</th>
                <th className="text-left p-4">Docente</th>
                <th className="text-left p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((proyecto) => (
                <tr key={proyecto.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{proyecto.curso?.nombre}</td>
                  <td className="p-4">{proyecto.version}</td>
                  <td className="p-4">{proyecto.docente?.nombre} {proyecto.docente?.apellido}</td>
                  <td className="p-4">
                    <button
                      onClick={() => navigate(`/seguimiento/${proyecto.id}`)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Ver Seguimiento
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoList;
