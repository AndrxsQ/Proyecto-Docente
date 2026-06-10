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
      setSeguimiento(seguimientoData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSeguimiento([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-[#4A4A4A]">Cargando...</div>;

  const avanceTotal = seguimiento?.reduce((acc, seg) => {
    return acc + (seg.estado === 'CUMPLIDO' ? seg.porcentaje_avance : 0);
  }, 0) || 0;

  return (
    <div className="p-8">
      <div className="sticky top-0 z-10 bg-white py-4 shadow-sm mb-4">
        <button onClick={() => window.history.back()} className="flex items-center text-[#4A4A4A] hover:text-[#1E1E1E]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-[#1E1E1E] mt-2">{proyecto.asignatura?.nombre}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-[#7A7A7A] text-sm">Versión:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.version}</span>
          </div>
          <div>
            <span className="text-[#7A7A7A] text-sm">Estado:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.estado.replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="text-[#7A7A7A] text-sm">Docente:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.docente?.nombre} {proyecto.docente?.apellido}</span>
          </div>
          <div>
            <span className="text-[#7A7A7A] text-sm">Créditos:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.asignatura?.creditos}</span>
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
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Contenido de la Asignatura</h3>
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

      {proyecto.estado === 'APROBADO' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Seguimiento de Clases</h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-[#4A4A4A]">Avance Total</span>
              <span className="text-[#1E1E1E] font-semibold">{avanceTotal}%</span>
            </div>
            <div className="w-full bg-[#E5E7EB] rounded-full h-2.5">
              <div className={(avanceTotal === 100 ? 'bg-[#38A169]' : 'bg-[#F5A623]') + ' h-2.5 rounded-full'} style={{ width: `${avanceTotal}%` }}></div>
            </div>
          </div>
          {(seguimiento || []).length > 0 ? (
            <div className="space-y-3">
              {(seguimiento || []).map((seg) => (
                <div key={seg.id} className="border border-[#F0F0F0] p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#1E1E1E]">{new Date(seg.fecha).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ` + (
                      seg.estado === 'CUMPLIDO' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      seg.estado === 'PENDIENTE' ? 'bg-[#FEF3C7] text-[#92600A]' :
                      'bg-[#F0F0F0] text-[#666666]'
                    )}>
                      {seg.estado}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-[#4A4A4A]">{seg.descripcion}</p>
                  <p className="text-xs text-[#7A7A7A]">Avance: {seg.porcentaje_avance}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#4A4A4A]">No hay registros de seguimiento</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProyectoDocenteDetail;
