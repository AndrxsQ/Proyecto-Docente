import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProyectosDocentes, createProyectoDocente, aprobarProyectoDocente, enviarProyectoDocente } from '../../api/proyectosDocente';
import { getCursos } from '../../api/cursos';
import { useAuth } from '../../context/AuthContext';
import { Plus, Eye, Edit, Check, Send } from 'lucide-react';

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
      setProyectos([]);
      setCursos([]);
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

  const handleAprobar = async (proyectoId) => {
    try {
      await aprobarProyectoDocente(proyectoId, '');
      fetchData();
    } catch (error) {
      console.error('Error approving proyecto:', error);
      alert('Error al aprobar el proyecto');
    }
  };

  const handleEnviar = async (proyectoId) => {
    try {
      await enviarProyectoDocente(proyectoId);
      fetchData();
    } catch (error) {
      console.error('Error sending proyecto:', error);
      alert('Error al enviar el proyecto');
    }
  };

  const getPermissionGroup = (rol) => {
    const groups = {
      'DOCENTE': 'DOCENTE',
      'JEFE_DEPARTAMENTO': 'REVISION',
      'DIRECTOR_PROGRAMA': 'REVISION',
      'COORDINADOR_PROGRAMA': 'REVISION',
      'COMITE_CURRICULAR': 'COMITE',
      'COMITE_ACADEMICO_INSTITUTO': 'COMITE',
      'DECANO': 'APROBACION_FINAL',
    };
    return groups[rol] || '';
  };

  const canAprobar = (proyecto) => {
    const grupo = getPermissionGroup(user.rol);
    switch (grupo) {
      case 'REVISION':
        return proyecto.estado === 'EN_REVISION';
      case 'COMITE':
        return proyecto.estado === 'REVISADO';
      case 'APROBACION_FINAL':
        return proyecto.estado === 'AVALADO';
      default:
        return false;
    }
  };

  const getNextEstado = (estado) => {
    const nextStates = {
      'EN_REVISION': 'REVISADO',
      'REVISADO': 'AVALADO',
      'AVALADO': 'APROBADO',
    };
    return nextStates[estado];
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'ELABORADO': 'bg-[#F0F0F0] text-[#666666]',
      'EN_REVISION': 'bg-[#FEF3C7] text-[#92600A]',
      'REVISADO': 'bg-[#FEF3C7] text-[#92600A]',
      'AVALADO': 'bg-[#DBEAFE] text-[#1E40AF]',
      'APROBADO': 'bg-[#D1FAE5] text-[#065F46]',
    };
    return badges[estado] || 'bg-[#F0F0F0] text-[#666666]';
  };

  if (loading) return <div className="p-8 text-[#4A4A4A]">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Proyectos <span className="text-[#F5A623]">Docente</span></h1>
        {user.rol === 'DOCENTE' && (
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E1E1E]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Curso</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Versión</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Última Modificación</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!proyectos || proyectos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-[#4A4A4A]">
                    No hay proyectos para mostrar
                  </td>
                </tr>
              ) : (
                proyectos.map((proyecto, index) => (
                  <tr key={proyecto.id} className={`border-b border-[#F0F0F0] hover:bg-[#FFF8EC] ` + (index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]')}>
                    <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.curso?.nombre}</td>
                    <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.version}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ` + getEstadoBadge(proyecto.estado)}>
                        {proyecto.estado.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#4A4A4A]">{new Date(proyecto.ultima_modificacion).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/proyectos-docente/${proyecto.id}`)}
                          className="p-2 hover:bg-[#F0F0F0] rounded-lg text-[#4A4A4A]"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(user.rol === 'DOCENTE' || user.rol === 'ADMIN') && (
                          <button
                            onClick={() => navigate(`/proyectos-docente/${proyecto.id}/edit`)}
                            className="p-2 hover:bg-[#F0F0F0] rounded-lg text-[#4A4A4A]"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {user.rol === 'DOCENTE' && proyecto.estado === 'ELABORADO' && (
                          <button
                            onClick={() => handleEnviar(proyecto.id)}
                            className="p-2 hover:bg-[#FFFBF2] rounded-lg text-[#F5A623]"
                            title="Enviar a revisión"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {canAprobar(proyecto) && (
                          <button
                            onClick={() => handleAprobar(proyecto.id)}
                            className="p-2 hover:bg-[#FFFBF2] rounded-lg text-[#F5A623]"
                            title={`Aprobar - Pasar a ${getNextEstado(proyecto.estado).replace(/_/g, ' ')}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-4">Crear Nuevo Proyecto Docente</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Curso</label>
                <select
                  value={selectedCurso}
                  onChange={(e) => setSelectedCurso(e.target.value)}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
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
                  className="px-4 py-2 border border-[#F5A623] text-[#F5A623] rounded-lg hover:bg-[#FFFBF2] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5A623] text-[#1E1E1E] font-semibold rounded-lg hover:bg-[#E09415] transition-colors"
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
