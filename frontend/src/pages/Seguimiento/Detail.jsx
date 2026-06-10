import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProyectoDocente, getSeguimiento } from '../../api/proyectosDocente';
import { ArrowLeft, Plus } from 'lucide-react';

const SeguimientoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
      setProyecto(null);
      setSeguimiento([]);
    } finally {
      setLoading(false);
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

  const avanceTotal = (seguimiento || []).reduce((acc, seg) => {
    return acc + (seg.estado === 'CUMPLIDO' ? seg.porcentaje_avance : 0);
  }, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-white py-4 shadow-sm">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Seguimiento - <span className="text-[#F5A623]">{proyecto.asignatura?.nombre}</span></h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/seguimiento/${id}`, { state: { filters: location.state?.filters } })}
            className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Registro
          </button>
          <button onClick={() => navigate('/seguimiento', { state: { filters: location.state?.filters } })} className="text-[#4A4A4A] hover:text-[#1E1E1E]">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-[#1E1E1E]">Avance Total de la Asignatura</span>
          <span className="font-bold text-[#1E1E1E]">{avanceTotal}%</span>
        </div>
        <div className="w-full bg-[#E5E7EB] rounded-full h-4">
          <div className={(avanceTotal === 100 ? 'bg-[#38A169]' : 'bg-[#F5A623]') + ' h-4 rounded-full transition-all'} style={{ width: `${avanceTotal}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Historial de Seguimiento</h3>
        {seguimiento.length > 0 ? (
          <div className="space-y-4">
            {seguimiento.map((seg) => (
              <div key={seg.id} className="border border-[#F0F0F0] p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-[#1E1E1E]">{new Date(seg.fecha).toLocaleDateString()}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ` + (
                      seg.estado === 'CUMPLIDO' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      seg.estado === 'PENDIENTE' ? 'bg-[#FEF3C7] text-[#92600A]' :
                      'bg-[#F0F0F0] text-[#666666]'
                    )}>
                      {seg.estado}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#1E1E1E]">{seg.porcentaje_avance}%</span>
                </div>
                <p className="font-semibold text-[#1E1E1E]">{seg.descripcion}</p>
                <p className="text-[#4A4A4A] text-sm mt-1">{seg.desarrollo}</p>
                {seg.observaciones && (
                  <p className="text-[#7A7A7A] text-sm mt-2">Obs: {seg.observaciones}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#4A4A4A]">No hay registros de seguimiento</p>
        )}
      </div>
    </div>
  );
};

export default SeguimientoDetail;
