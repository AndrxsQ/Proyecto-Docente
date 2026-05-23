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

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Revisión de Proyecto Docente</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{proyecto.curso?.nombre}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-gray-600">Versión:</span> {proyecto.version}
          </div>
          <div>
            <span className="text-gray-600">Estado:</span> {proyecto.estado.replace(/_/g, ' ')}
          </div>
          <div>
            <span className="text-gray-600">Docente:</span> {proyecto.docente?.nombre} {proyecto.docente?.apellido}
          </div>
        </div>
      </div>

      {proyecto.formato && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold mb-4">Información General</h3>
          <p className="mb-4">{proyecto.formato.descripcion}</p>
          <h3 className="font-semibold mb-2">Resultados de Aprendizaje</h3>
          <p className="mb-4 whitespace-pre-wrap">{proyecto.formato.resultados_aprendizaje}</p>
          <h3 className="font-semibold mb-2">Estrategias</h3>
          <p className="mb-4 whitespace-pre-wrap">{proyecto.formato.estrategias}</p>
          <h3 className="font-semibold mb-2">Evaluación</h3>
          <p className="whitespace-pre-wrap">{proyecto.formato.evaluacion_resultados}</p>
        </div>
      )}

      {proyecto.contenido && proyecto.contenido.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold mb-4">Contenido del Curso</h3>
          {proyecto.contenido.map((item) => (
            <div key={item.id} className="border-b py-3">
              <p className="font-medium">Semana {item.semana}: {item.tema}</p>
              <p className="text-gray-600 text-sm">{item.descripcion}</p>
            </div>
          ))}
        </div>
      )}

      {proyecto.bibliografia && proyecto.bibliografia.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold mb-4">Bibliografía</h3>
          {proyecto.bibliografia.map((item) => (
            <div key={item.id} className="border-b py-2">
              <span className={`px-2 py-1 rounded text-xs ${item.tipo === 'BASICA' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {item.tipo}
              </span>
              <p className="mt-1">{item.referencia}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4">Acciones de Revisión</h3>
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          className="w-full px-3 py-2 border rounded-md h-32 mb-4"
          placeholder="Agregar observación (opcional para aprobación, obligatoria para devolución)"
        />
        <div className="flex gap-4">
          <button
            onClick={handleAprobar}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Aprobar
          </button>
          <button
            onClick={handleDevolver}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
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
