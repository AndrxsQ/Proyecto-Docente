import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProyectoDocente, aprobarProyectoDocente, devolverProyectoDocente } from '../../api/proyectosDocente';
import { Check, X } from 'lucide-react';

const ProyectoDocenteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const data = await getProyectoDocente(id);
      setProyecto(data);
    } catch (error) {
      console.error('Error fetching proyecto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    try {
      await aprobarProyectoDocente(id, observacion);
      alert('Proyecto aprobado');
      navigate('/proyectos-docente');
    } catch (error) {
      console.error('Error approving proyecto:', error);
      alert('Error al aprobar el proyecto');
    }
  };

  const handleDevolver = async () => {
    if (!observacion.trim()) {
      alert('Debe agregar una observación para devolver el proyecto');
      return;
    }
    try {
      await devolverProyectoDocente(id, observacion);
      alert('Proyecto devuelto');
      navigate('/proyectos-docente');
    } catch (error) {
      console.error('Error returning proyecto:', error);
      alert('Error al devolver el proyecto');
    }
  };

  if (loading) return <div className="p-8 text-[#4A4A4A]">Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#1E1E1E] mb-6">Revisión de <span className="text-[#F5A623]">Proyecto</span> Docente</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#1E1E1E] mb-4">{proyecto.curso?.nombre}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-[#7A7A7A] text-sm">Versión:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.version}</span>
          </div>
          <div>
            <span className="text-[#7A7A7A] text-sm">Estado:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.estado.replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="text-[#7A7A7A] text-sm">Docente:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.docente?.nombre} {proyecto.docente?.apellido}</span>
          </div>
        </div>
      </div>

      {proyecto.formato && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Información General</h3>
          <p className="text-[#4A4A4A] mb-4">{proyecto.formato.descripcion}</p>
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Resultados de Aprendizaje</h3>
          <p className="text-[#4A4A4A] mb-4 whitespace-pre-wrap">{proyecto.formato.resultados_aprendizaje}</p>
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Estrategias</h3>
          <p className="text-[#4A4A4A] mb-4 whitespace-pre-wrap">{proyecto.formato.estrategias}</p>
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Evaluación</h3>
          <p className="text-[#4A4A4A] whitespace-pre-wrap">{proyecto.formato.evaluacion_resultados}</p>
        </div>
      )}

      {proyecto.contenido && proyecto.contenido.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Contenido del Curso</h3>
          {proyecto.contenido.map((item) => (
            <div key={item.id} className="border-b border-[#F0F0F0] py-3">
              <p className="font-semibold text-[#1E1E1E]">Semana {item.semana}: {item.tema}</p>
              <p className="text-[#4A4A4A] text-sm">{item.descripcion}</p>
            </div>
          ))}
        </div>
      )}

      {proyecto.bibliografia && proyecto.bibliografia.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Bibliografía</h3>
          {proyecto.bibliografia.map((item) => (
            <div key={item.id} className="border-b border-[#F0F0F0] py-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ` + (item.tipo === 'BASICA' ? 'bg-[#FEF3C7] text-[#92600A]' : 'bg-[#F0F0F0] text-[#666666]')}>
                {item.tipo}
              </span>
              <p className="mt-1 text-[#4A4A4A]">{item.referencia}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Acciones de Revisión</h3>
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-32 mb-4"
          placeholder="Agregar observación (opcional para aprobación, obligatoria para devolución)"
        />
        <div className="flex gap-4">
          <button
            onClick={handleAprobar}
            className="flex items-center bg-[#38A169] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#2F855A] transition-colors"
          >
            <Check className="w-4 h-4 mr-2" />
            Aprobar
          </button>
          <button
            onClick={handleDevolver}
            className="flex items-center bg-[#E53E3E] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#C53030] transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Devolver con Observación
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProyectoDocenteReview;
