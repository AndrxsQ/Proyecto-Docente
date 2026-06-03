import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProyectosDocentes } from '../../api/proyectosDocente';
import { getAsignaturas } from '../../api/asignaturas';
import { getFacultades } from '../../api/facultades';
import { getProgramas } from '../../api/programas';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';

const SeguimientoList = () => {
  const [proyectos, setProyectos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState('');
  const [selectedFacultad, setSelectedFacultad] = useState('');
  const [selectedPrograma, setSelectedPrograma] = useState('');
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
      const [proyectosData, asignaturasData, facultadesData, programasData] = await Promise.all([
        getProyectosDocentes(filters),
        getAsignaturas(user.rol === 'DOCENTE' ? { docente_id: user.id } : {}),
        getFacultades(),
        getProgramas()
      ]);
      setProyectos(proyectosData);
      setFacultades(facultadesData);
      
      // Set default values based on user's programa if docente
      let defaultFacultadId = '';
      let defaultProgramaId = '';
      
      if (user.rol === 'DOCENTE' && user.programa_id) {
        defaultProgramaId = user.programa_id.toString();
        // Find the programa to get its facultad
        const programa = programasData?.find(p => p.id === user.programa_id);
        if (programa && programa.facultad_id) {
          defaultFacultadId = programa.facultad_id.toString();
        }
      }
      
      setSelectedFacultad(defaultFacultadId);
      setSelectedPrograma(defaultProgramaId);
      
      // Filter programas based on facultad
      if (defaultFacultadId) {
        const filteredProgramas = programasData?.filter(p => p.facultad_id === parseInt(defaultFacultadId)) || [];
        setProgramas(filteredProgramas);
      } else {
        setProgramas(programasData);
      }
      
      // Filter asignaturas based on programa
      if (defaultProgramaId) {
        const filteredAsignaturas = asignaturasData?.filter(a => a.programa_id === parseInt(defaultProgramaId)) || [];
        setAsignaturas(filteredAsignaturas);
      } else {
        setAsignaturas(asignaturasData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setProyectos([]);
      setAsignaturas([]);
      setFacultades([]);
      setProgramas([]);
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
        setAsignaturas(asignaturasData);
      } catch (error) {
        console.error('Error fetching asignaturas:', error);
        setAsignaturas([]);
      }
    } else {
      // If no programa selected, fetch all asignaturas
      try {
        const asignaturasData = await getAsignaturas(user.rol === 'DOCENTE' ? { docente_id: user.id } : {});
        setAsignaturas(asignaturasData);
      } catch (error) {
        console.error('Error fetching asignaturas:', error);
        setAsignaturas([]);
      }
    }
  };

  const handleNuevoSeguimiento = () => {
    if (selectedAsignatura) {
      const proyecto = proyectos.find(p => p.asignatura_id === parseInt(selectedAsignatura));
      if (proyecto) {
        navigate(`/seguimiento/${proyecto.id}`);
      }
    }
  };

  // Filter proyectos based on selected filters
  const filteredProyectos = proyectos.filter((proyecto) => {
    if (selectedAsignatura) {
      return proyecto.asignatura_id === parseInt(selectedAsignatura);
    }
    if (selectedPrograma) {
      return proyecto.asignatura?.programa_id === parseInt(selectedPrograma);
    }
    if (selectedFacultad) {
      return proyecto.asignatura?.programa?.facultad_id === parseInt(selectedFacultad);
    }
    return true;
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#1E1E1E] mb-6">Seguimiento de <span className="text-[#F5A623]">Clases</span></h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Facultad</label>
            <select
              value={selectedFacultad}
              onChange={handleFacultadChange}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
            >
              <option value="">Seleccionar facultad</option>
              {facultades.map((facultad) => (
                <option key={facultad.id} value={facultad.id}>
                  {facultad.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Programa</label>
            <select
              value={selectedPrograma}
              onChange={handleProgramaChange}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
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
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Asignatura</label>
            <select
              value={selectedAsignatura}
              onChange={(e) => setSelectedAsignatura(e.target.value)}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
              disabled={!selectedPrograma}
            >
              <option value="">Seleccionar asignatura</option>
              {asignaturas?.map((asignatura) => (
                <option key={asignatura.id} value={asignatura.id}>
                  {asignatura.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-4 items-end mt-4">
          <button
            onClick={handleNuevoSeguimiento}
            disabled={!selectedAsignatura}
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Asignatura</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Versión</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Docente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!filteredProyectos || filteredProyectos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-[#4A4A4A]">
                    No hay proyectos para mostrar
                  </td>
                </tr>
              ) : (
                filteredProyectos.map((proyecto, index) => (
                  <tr key={proyecto.id} className={`border-b border-[#F0F0F0] hover:bg-[#FFF8EC] ` + (index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]')}>
                    <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.asignatura?.nombre}</td>
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
