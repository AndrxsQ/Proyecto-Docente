import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProyectosDocentes, getProyectoDocente, createProyectoDocente, enviarProyectoDocente } from '../../api/proyectosDocente';
import { getAsignaturas } from '../../api/asignaturas';
import { getFacultades } from '../../api/facultades';
import { getProgramas } from '../../api/programas';
import { useAuth } from '../../context/AuthContext';
import { Plus, Eye, Edit, Send, Bell } from 'lucide-react';

const ProyectoDocenteList = () => {
  const [proyectos, setProyectos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState('');
  const [selectedFacultad, setSelectedFacultad] = useState('');
  const [selectedPrograma, setSelectedPrograma] = useState('');
  const [sesionesPorSemana, setSesionesPorSemana] = useState(1);
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const [selectedProjectObservations, setSelectedProjectObservations] = useState([]);
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
      
      // Fetch facultades and programas
      const [facultadesData, programasData] = await Promise.all([
        getFacultades(),
        getProgramas()
      ]);
      setFacultades(facultadesData || []);
      setProgramas(programasData || []);
      
      // Pre-select facultad and programa based on user's relationships
      if (user.facultad_id) {
        setSelectedFacultad(user.facultad_id.toString());
        // Filter programas to show only those from the user's facultad
        const filteredProgramas = programasData.filter(p => p.facultad_id === user.facultad_id);
        setProgramas(filteredProgramas || []);
      }
      if (user.programa_id) {
        setSelectedPrograma(user.programa_id.toString());
      }
      
      // Fetch proyectos and asignaturas
      const [proyectosData, asignaturasData] = await Promise.all([
        getProyectosDocentes(filters),
        getAsignaturas(user.rol === 'DOCENTE' ? { docente_id: user.id } : {})
      ]);
      setProyectos(proyectosData || []);
      setAsignaturas(asignaturasData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setProyectos([]);
      setAsignaturas([]);
      setFacultades([]);
      setProgramas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFacultadChange = async (e) => {
    const facultadId = e.target.value;
    setSelectedFacultad(facultadId);
    setSelectedPrograma('');
    setSelectedAsignatura('');
    
    // Fetch programas filtered by facultad
    if (facultadId) {
      try {
        const programasData = await getProgramas({ facultad_id: facultadId });
        setProgramas(programasData);
      } catch (error) {
        console.error('Error fetching programas:', error);
        setProgramas([]);
      }
    } else {
      // If no facultad selected, fetch all programas
      try {
        const programasData = await getProgramas();
        setProgramas(programasData);
      } catch (error) {
        console.error('Error fetching programas:', error);
        setProgramas([]);
      }
    }
  };

  const handleProgramaChange = async (e) => {
    const programaId = e.target.value;
    setSelectedPrograma(programaId);
    setSelectedAsignatura('');
    
    // Fetch asignaturas filtered by programa
    if (programaId) {
      try {
        const asignaturasData = await getAsignaturas({ programa_id: programaId });
        setAsignaturas(asignaturasData || []);
      } catch (error) {
        console.error('Error fetching asignaturas:', error);
        setAsignaturas([]);
      }
    } else {
      // If no programa selected, fetch all asignaturas for the docente
      try {
        const asignaturasData = await getAsignaturas(user.rol === 'DOCENTE' ? { docente_id: user.id } : {});
        setAsignaturas(asignaturasData || []);
      } catch (error) {
        console.error('Error fetching asignaturas:', error);
        setAsignaturas([]);
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProyectoDocente({ 
        asignatura_id: parseInt(selectedAsignatura), 
        docente_id: user.id,
        sesiones_por_semana: sesionesPorSemana
      });
      setShowNewModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating proyecto:', error);
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

  const handleShowObservations = async (proyecto) => {
    try {
      const proyectoData = await getProyectoDocente(proyecto.id);
      setSelectedProjectObservations(proyectoData.observaciones || []);
      setShowObservationsModal(true);
    } catch (error) {
      console.error('Error fetching observations:', error);
      alert('Error al cargar las observaciones');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'ELABORADO': 'bg-[#F0F0F0] text-[#666666]',
      'EN_REVISION': 'bg-[#FEF3C7] text-[#92600A]',
      'REVISADO': 'bg-[#FEF3C7] text-[#92600A]',
      'AVALADO': 'bg-[#DBEAFE] text-[#1E40AF]',
      'APROBADO': 'bg-[#D1FAE5] text-[#065F46]',
      'DENEGADO': 'bg-[#FEE2E2] text-[#991B1B]',
    };
    return badges[estado] || 'bg-[#F0F0F0] text-[#666666]';
  };

  const getActivoBadge = (activo) => {
    if (activo) {
      return 'bg-[#D1FAE5] text-[#065F46]';
    }
    return 'bg-[#F3F4F6] text-[#6B7280]';
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Asignatura</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Versión</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Activo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Última Modificación</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!proyectos || proyectos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-[#4A4A4A]">
                    No hay proyectos para mostrar
                  </td>
                </tr>
              ) : (
                proyectos.map((proyecto, index) => (
                  <tr key={proyecto.id} className={`border-b border-[#F0F0F0] hover:bg-[#FFF8EC] ` + (index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]')}>
                    <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.asignatura?.nombre}</td>
                    <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.version}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ` + getEstadoBadge(proyecto.estado)}>
                        {proyecto.estado.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ` + getActivoBadge(proyecto.activo)}>
                        {proyecto.activo ? 'ACTIVO' : 'INACTIVO'}
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
                        {(user.rol === 'DOCENTE' || user.rol === 'ADMIN') && (proyecto.estado === 'ELABORADO' || proyecto.estado === 'DENEGADO') && (
                          <button
                            onClick={() => navigate(`/proyectos-docente/${proyecto.id}/edit`)}
                            className="p-2 hover:bg-[#F0F0F0] rounded-lg text-[#4A4A4A]"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {proyecto.estado === 'DENEGADO' && (
                          <button
                            onClick={() => handleShowObservations(proyecto)}
                            className="p-2 hover:bg-[#F0F0F0] rounded-lg text-[#4A4A4A]"
                            title="Ver observaciones"
                          >
                            <Bell className="w-4 h-4" />
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

      {showObservationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1E1E1E]">Observaciones del Proyecto</h2>
              <button
                onClick={() => setShowObservationsModal(false)}
                className="text-[#4A4A4A] hover:text-[#1E1E1E]"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            {selectedProjectObservations.length === 0 ? (
              <p className="text-[#4A4A4A]">No hay observaciones registradas para este proyecto.</p>
            ) : (
              <div className="space-y-4">
                {selectedProjectObservations.map((observacion) => (
                  <div key={observacion.id} className="border border-[#E5E7EB] rounded-xl p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-sm font-semibold text-[#1E1E1E]">{observacion.tipo}</span>
                        <p className="text-xs text-[#6B7280] mt-1">{new Date(observacion.fecha).toLocaleString()}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#4A4A4A]">
                        {observacion.autor ? `${observacion.autor.nombre} ${observacion.autor.apellido}` : 'Sin autor'}
                      </span>
                    </div>
                    <p className="mt-3 text-[#4A4A4A] whitespace-pre-line">{observacion.descripcion || 'Sin descripción'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-4">Crear Nuevo Proyecto Docente</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Facultad</label>
                <select
                  value={selectedFacultad}
                  onChange={handleFacultadChange}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                  required
                >
                  <option value="">Seleccionar facultad</option>
                  {facultades.map((facultad) => (
                    <option key={facultad.id} value={facultad.id}>
                      {facultad.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Programa</label>
                <select
                  value={selectedPrograma}
                  onChange={handleProgramaChange}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                  required
                  disabled={!selectedFacultad}
                >
                  <option value="">Seleccionar programa</option>
                  {programas.map((programa) => (
                    <option key={programa.id} value={programa.id}>
                      {programa.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Asignatura</label>
                <select
                  value={selectedAsignatura}
                  onChange={(e) => setSelectedAsignatura(e.target.value)}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                  required
                  disabled={!selectedPrograma}
                >
                  <option value="">Seleccionar asignatura</option>
                  {asignaturas && asignaturas.map((asignatura) => (
                    <option key={asignatura.id} value={asignatura.id}>
                      {asignatura.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Sesiones por Semana</label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={sesionesPorSemana}
                  onChange={(e) => setSesionesPorSemana(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewModal(false);
                    setSelectedFacultad('');
                    setSelectedPrograma('');
                    setSelectedAsignatura('');
                    setSesionesPorSemana(1);
                  }}
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
