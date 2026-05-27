import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProyectosDocentes } from '../../api/proyectosDocente';
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
        getProyectosDocentes(filters),
        getCursos(user.rol === 'DOCENTE' ? { docente_id: user.id } : {})
      ]);
      setProyectos(proyectosData);
      setCursos(cursosData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setProyectos([]);
      setCursos([]);
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
      <h1 className="text-3xl font-bold text-[#1E1E1E] mb-6">Seguimiento de <span className="text-[#F5A623]">Clases</span></h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Seleccionar Curso</label>
            <select
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
            >
              <option value="">Seleccionar curso</option>
              {cursos?.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleNuevoSeguimiento}
            disabled={!selectedCurso}
            className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Registro
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E1E1E]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Curso</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Versión</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Docente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!proyectos || proyectos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-[#4A4A4A]">
                    No hay proyectos para mostrar
                  </td>
                </tr>
              ) : (
                proyectos.map((proyecto, index) => (
                  <tr key={proyecto.id} className={`border-b border-[#F0F0F0] hover:bg-[#FFF8EC] ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                    <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.curso?.nombre}</td>
                    <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.version}</td>
                    <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.docente?.nombre} {proyecto.docente?.apellido}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/seguimiento/${proyecto.id}`)}
                        className="text-[#F5A623] font-semibold hover:text-[#E09415]"
                      >
                        Ver Seguimiento
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoList;
