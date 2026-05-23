import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProyectoDocente, getSeguimiento } from '../../api/proyectosDocente';
import { ArrowLeft } from 'lucide-react';

const ProyectoDocenteDetail = () => {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [seguimiento, setSeguimiento] = useState([]);
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

  if (loading) return <div className="p-8">Cargando...</div>;

  const avanceTotal = seguimiento.reduce((acc, seg) => {
    return acc + (seg.estado === 'CUMPLIDO' ? seg.porcentaje_avance : 0);
  }, 0);

  return (
    <div className="p-8">
      <button onClick={() => window.history.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </button>

      <h1 className="text-2xl font-bold mb-6">{proyecto.curso?.nombre}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-gray-600">Versión:</span> {proyecto.version}
          </div>
          <div>
            <span className="text-gray-600">Estado:</span> {proyecto.estado.replace(/_/g, ' ')}
          </div>
          <div>
            <span className="text-gray-600">Docente:</span> {proyecto.docente?.nombre} {proyecto.docente?.apellido}
          </div>
          <div>
            <span className="text-gray-600">Créditos:</span> {proyecto.curso?.creditos}
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

      {proyecto.estado === 'APROBADO' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-4">Seguimiento de Clases</h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span>Avance Total</span>
              <span>{avanceTotal}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${avanceTotal}%` }}></div>
            </div>
          </div>
          {seguimiento.length > 0 ? (
            <div className="space-y-3">
              {seguimiento.map((seg) => (
                <div key={seg.id} className="border p-3 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{new Date(seg.fecha).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      seg.estado === 'CUMPLIDO' ? 'bg-green-100 text-green-800' :
                      seg.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {seg.estado}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{seg.descripcion}</p>
                  <p className="text-xs text-gray-600">Avance: {seg.porcentaje_avance}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay registros de seguimiento</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProyectoDocenteDetail;
