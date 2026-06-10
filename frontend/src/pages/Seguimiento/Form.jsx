import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProyectoDocente, getSeguimiento, createSeguimiento, updateSeguimiento, getContenido } from '../../api/proyectosDocente';
import { Save, Plus } from 'lucide-react';

const SeguimientoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [proyecto, setProyecto] = useState(null);
  const [contenido, setContenido] = useState([]);
  const [seguimiento, setSeguimiento] = useState([]);
  const [currentSemana, setCurrentSemana] = useState(1);
  const [currentSesion, setCurrentSesion] = useState(1);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tema_desarrollado: '',
    descripcion_tema: '',
    porcentaje_avance: 1,
    estado: 'CUMPLIDO',
    observaciones: '',
    modalidad_entorno: '',
    modalidad_sincronia: '',
    modalidad_enfoque: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      console.log('Fetching data for proyecto id:', id);
      const [proyectoData, contenidoData, seguimientoData] = await Promise.all([
        getProyectoDocente(id),
        getContenido(id),
        getSeguimiento(id)
      ]);
      console.log('Proyecto data:', proyectoData);
      console.log('Contenido data:', contenidoData);
      console.log('Seguimiento data:', seguimientoData);
      setProyecto(proyectoData);
      setContenido(contenidoData || []);
      setSeguimiento(seguimientoData || []);
      
      // Calculate next week/session to register
      calculateNextSession(contenidoData || [], seguimientoData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setProyecto(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextSession = (contenido, seguimiento) => {
    if (!contenido || contenido.length === 0) {
      setCurrentSemana(1);
      setCurrentSesion(1);
      return;
    }

    // Sort contenido by semana and sesion
    const sortedContenido = contenido.sort((a, b) => {
      if (a.semana !== b.semana) return a.semana - b.semana;
      return a.sesion - b.sesion;
    });

    // Find the first session that doesn't have a seguimiento record
    for (const item of sortedContenido) {
      const hasRecord = seguimiento.some(seg => 
        seg.semana === item.semana && seg.sesion === item.sesion
      );
      if (!hasRecord) {
        setCurrentSemana(item.semana);
        setCurrentSesion(item.sesion);
        return;
      }
    }

    // If all sessions have records, set to the first one
    if (sortedContenido.length > 0) {
      setCurrentSemana(sortedContenido[0].semana);
      setCurrentSesion(sortedContenido[0].sesion);
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
        tema_desarrollado: nuevoRegistro.tema_desarrollado,
        descripcion_tema: nuevoRegistro.descripcion_tema,
        porcentaje_avance: nuevoRegistro.porcentaje_avance,
        estado: nuevoRegistro.estado,
        observaciones: nuevoRegistro.observaciones,
        semana: currentSemana,
        sesion: currentSesion,
        modalidad_entorno: nuevoRegistro.modalidad_entorno,
        modalidad_sincronia: nuevoRegistro.modalidad_sincronia,
        modalidad_enfoque: nuevoRegistro.modalidad_enfoque
      };
      console.log('Creating seguimiento with data:', dataToSend);
      await createSeguimiento(id, dataToSend);
      setNuevoRegistro({
        fecha: new Date().toISOString().split('T')[0],
        tema_desarrollado: '',
        descripcion_tema: '',
        porcentaje_avance: 1,
        estado: 'CUMPLIDO',
        observaciones: '',
        modalidad_entorno: '',
        modalidad_sincronia: '',
        modalidad_enfoque: ''
      });
      alert('Registro de seguimiento creado exitosamente');
      // Recalculate next session after creating a record
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
      alert('Registro de seguimiento actualizado exitosamente');
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-white py-4 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Nuevo Registro de Seguimiento - <span className="text-[#F5A623]">{proyecto.asignatura?.nombre}</span></h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/seguimiento/${id}/detail`, { state: { filters: location.state?.filters } })}
            className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors"
          >
            Ver Seguimiento
          </button>
          <button onClick={() => navigate('/seguimiento', { state: { filters: location.state?.filters } })} className="text-[#4A4A4A] hover:text-[#1E1E1E]">
            Volver
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Semana</label>
            <select
              value={currentSemana}
              onChange={(e) => {
                const semana = parseInt(e.target.value);
                setCurrentSemana(semana);
                // Find the first session for this week without seguimiento
                const firstSession = contenido
                  .filter(c => c.semana === semana)
                  .sort((a, b) => a.sesion - b.sesion)
                  .find(c => !seguimiento.some(seg => seg.semana === c.semana && seg.sesion === c.sesion));
                if (firstSession) {
                  setCurrentSesion(firstSession.sesion);
                }
              }}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
            >
              {[...new Set(contenido.map(c => c.semana))]
                .filter(semana => contenido.some(c => c.semana === semana && !seguimiento.some(seg => seg.semana === c.semana && seg.sesion === c.sesion)))
                .sort((a, b) => a - b)
                .map(semana => (
                  <option key={semana} value={semana}>
                    Semana {semana}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Sesión</label>
            <select
              value={currentSesion}
              onChange={(e) => setCurrentSesion(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
            >
              {contenido
                .filter(c => c.semana === currentSemana && !seguimiento.some(seg => seg.semana === c.semana && seg.sesion === c.sesion))
                .sort((a, b) => a.sesion - b.sesion)
                .map(c => (
                  <option key={c.id} value={c.sesion}>
                    Sesión {c.sesion}
                  </option>
                ))}
            </select>
          </div>
        </div>
        
        {(() => {
          const selectedContenido = contenido.find(c => c.semana === currentSemana && c.sesion === currentSesion);
          if (selectedContenido) {
            return (
              <div className="mt-4 p-4 bg-[#FFF8EC] rounded-lg border border-[#F5A623]/20">
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
                  <div>
                    <span className="text-sm font-medium text-[#4A4A4A]">Fecha Programada:</span>
                    <p className="text-[#1E1E1E]">{selectedContenido.fecha || 'Por definir'}</p>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}
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
          <div className="md:col-span-2 mt-4">
            <h4 className="text-md font-semibold text-[#1E1E1E] mb-3">Modalidades de Enseñanza</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Según el Entorno</label>
                <select
                  value={nuevoRegistro.modalidad_entorno}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, modalidad_entorno: e.target.value })}
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
                  value={nuevoRegistro.modalidad_sincronia}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, modalidad_sincronia: e.target.value })}
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
                  value={nuevoRegistro.modalidad_enfoque}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, modalidad_enfoque: e.target.value })}
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Tema Desarrollado</label>
            <input
              type="text"
              value={nuevoRegistro.tema_desarrollado}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, tema_desarrollado: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Descripción del Tema</label>
            <textarea
              value={nuevoRegistro.descripcion_tema}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, descripcion_tema: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-24"
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
    </div>
  );
};

export default SeguimientoForm;
