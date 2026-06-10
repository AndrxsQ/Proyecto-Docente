import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProyectoDocente, getSeguimiento, getContenido, aprobarProyectoDocente, denegarProyectoDocente } from '../../api/proyectosDocente';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProyectoDocenteDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [proyecto, setProyecto] = useState(null);
  const [seguimiento, setSeguimiento] = useState([]);
  const [contenido, setContenido] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Información');
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [denyObservation, setDenyObservation] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [proyectoData, seguimientoData, contenidoData] = await Promise.all([
        getProyectoDocente(id),
        getSeguimiento(id),
        getContenido(id)
      ]);
      setProyecto(proyectoData);
      setSeguimiento(seguimientoData || []);
      setContenido(contenidoData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSeguimiento([]);
      setContenido([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-[#4A4A4A]">Cargando...</div>;

  const avanceTotal = seguimiento?.reduce((acc, seg) => {
    return acc + (seg.estado === 'CUMPLIDO' ? seg.porcentaje_avance : 0);
  }, 0) || 0;

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

  const handleAprobar = async () => {
    try {
      await aprobarProyectoDocente(proyecto.id, '');
      fetchData();
    } catch (error) {
      console.error('Error approving proyecto:', error);
      alert('Error al aprobar el proyecto');
    }
  };

  const canDenegar = (proyecto) => {
    const grupo = getPermissionGroup(user.rol);
    // Same groups as approve can deny
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

  const handleDenegar = async () => {
    if (!denyObservation.trim()) {
      alert('Por favor ingrese una observación para denegar el proyecto');
      return;
    }
    try {
      await denegarProyectoDocente(proyecto.id, denyObservation);
      setShowDenyModal(false);
      setDenyObservation('');
      fetchData();
    } catch (error) {
      console.error('Error denying proyecto:', error);
      alert('Error al denegar el proyecto');
    }
  };

  const getAprobarButtonText = () => {
    const grupo = getPermissionGroup(user.rol);
    switch (grupo) {
      case 'REVISION':
        return 'Marcar como Revisado';
      case 'COMITE':
        return 'Avalar';
      case 'APROBACION_FINAL':
        return 'Aprobar';
      default:
        return 'Aprobar';
    }
  };

  return (
    <div className="p-8">
      <div className="sticky top-0 z-10 bg-white py-4 shadow-sm mb-4">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => window.history.back()} className="flex items-center text-[#4A4A4A] hover:text-[#1E1E1E] mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </button>
            <h1 className="text-3xl font-bold text-[#1E1E1E]">{proyecto.asignatura?.nombre}</h1>
          </div>
          <div className="flex gap-2">
            {canDenegar(proyecto) && (
              <button
                onClick={() => setShowDenyModal(true)}
                className="flex items-center bg-[#E53E3E] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#C53030] transition-colors"
              >
                Denegar
              </button>
            )}
            {canAprobar(proyecto) && (
              <button
                onClick={handleAprobar}
                className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors"
              >
                {getAprobarButtonText()}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex border-b-2 border-[#E5E7EB]">
          {['Información', 'Contenido', 'Seguimiento'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 ` + (activeTab === tab ? 'text-[#F5A623] font-semibold border-b-2 border-[#F5A623]' : 'text-[#7A7A7A] hover:text-[#1E1E1E]')}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'Información' && (
          <div className="space-y-6">
            <div className="border-b border-[#F0F0F0] pb-4">
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Facultad</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.programa?.facultad?.nombre || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Programa</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.programa?.nombre || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Asignatura</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.nombre || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Versión del Proyecto Docente</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.version || '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Información de la Asignatura</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Código de la Asignatura</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.codigo || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Componente</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.componente || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Tipo de Asignatura</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.tipo || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Número de Créditos</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.creditos || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Horas Totales</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.total_horas || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Horas de Trabajo Independiente (TI)</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.horas_ti || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Horas Teóricas de Acompañamiento Directo (TDE)</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.horas_tde || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Horas Prácticas de Acompañamiento Directo (TDP)</label>
                  <p className="text-[#4A4A4A] font-medium">{proyecto?.asignatura?.horas_tdp || '-'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Prerrequisitos</label>
                <p className="text-[#4A4A4A] font-medium whitespace-pre-line">{proyecto?.asignatura?.prerrequisitos || 'Ninguno'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Correquisitos</label>
                <p className="text-[#4A4A4A] font-medium whitespace-pre-line">{proyecto?.asignatura?.correquisitos || 'Ninguno'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Contenido' && (
          <div>
            <div className="border-b border-[#F0F0F0] pb-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[#7A7A7A] text-sm">Facultad:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.asignatura?.programa?.facultad?.nombre}</span>
                </div>
                <div>
                  <span className="text-[#7A7A7A] text-sm">Programa:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.asignatura?.programa?.nombre}</span>
                </div>
                <div>
                  <span className="text-[#7A7A7A] text-sm">Código:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.asignatura?.codigo}</span>
                </div>
                <div>
                  <span className="text-[#7A7A7A] text-sm">Docente:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.docente?.nombre} {proyecto.docente?.apellido}</span>
                </div>
              </div>
            </div>

            {proyecto.formato && (
              <div className="mb-6">
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
              <div className="mb-6">
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
              <div>
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
          </div>
        )}

        {activeTab === 'Seguimiento' && (
          <div>
            <div className="border-b border-[#F0F0F0] pb-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[#7A7A7A] text-sm">Facultad:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.asignatura?.programa?.facultad?.nombre}</span>
                </div>
                <div>
                  <span className="text-[#7A7A7A] text-sm">Programa:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.asignatura?.programa?.nombre}</span>
                </div>
                <div>
                  <span className="text-[#7A7A7A] text-sm">Código:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.asignatura?.codigo}</span>
                </div>
                <div>
                  <span className="text-[#7A7A7A] text-sm">Docente:</span> <span className="text-[#1E1E1E] font-medium">{proyecto.docente?.nombre} {proyecto.docente?.apellido}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-[#4A4A4A]">Avance Total</span>
                <span className="text-[#1E1E1E] font-semibold">{avanceTotal}%</span>
              </div>
              <div className="w-full bg-[#E5E7EB] rounded-full h-2.5">
                <div className={(avanceTotal === 100 ? 'bg-[#38A169]' : 'bg-[#F5A623]') + ' h-2.5 rounded-full'} style={{ width: `${avanceTotal}%` }}></div>
              </div>
            </div>

            {(() => {
              const numSemanas = proyecto?.asignatura?.semanas || 16;
              const sesionesPorSemana = proyecto?.sesiones_por_semana || 1;
              const groupedByWeek = {};
              
              // Initialize all weeks
              for (let semana = 1; semana <= numSemanas; semana++) {
                groupedByWeek[semana] = [];
                for (let sesion = 1; sesion <= sesionesPorSemana; sesion++) {
                  const seguimientoRecord = seguimiento.find(s => s.semana === semana && s.sesion === sesion);
                  const contenidoRecord = contenido.find(c => c.semana === semana && c.sesion === sesion);
                  groupedByWeek[semana].push({
                    semana,
                    sesion,
                    seguimiento: seguimientoRecord || null,
                    contenido: contenidoRecord || null
                  });
                }
              }

              return Object.keys(groupedByWeek).sort((a, b) => parseInt(a) - parseInt(b)).map((weekNum) => (
                <div key={weekNum} className="border border-[#F0F0F0] p-4 rounded-xl mb-4">
                  <div className="mb-4">
                    <span className="font-semibold text-[#1E1E1E] text-lg">Semana {weekNum}</span>
                  </div>
                  <div className="space-y-4">
                    {groupedByWeek[weekNum].map((item) => (
                      <div key={`${item.semana}-${item.sesion}`} className="border-l-4 border-[#F5A623] pl-4">
                        <div className="mb-2">
                          <span className="font-medium text-[#2C2C2C]">Sesión {item.sesion}</span>
                        </div>
                        {item.contenido && (
                          <div className="mb-2">
                            <p className="text-[#4A4A4A] font-medium">{item.contenido.tema}</p>
                            <p className="text-[#4A4A4A] text-sm">{item.contenido.descripcion}</p>
                          </div>
                        )}
                        {item.seguimiento ? (
                          <div className="bg-[#D1FAE5] p-3 rounded-lg">
                            <div className="flex justify-between mb-2">
                              <span className="font-semibold text-[#065F46]">{new Date(item.seguimiento.fecha).toLocaleDateString()}</span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ` + (
                                item.seguimiento.estado === 'CUMPLIDO' ? 'bg-[#38A169] text-white' :
                                item.seguimiento.estado === 'PENDIENTE' ? 'bg-[#F59E0B] text-white' :
                                'bg-[#6B7280] text-white'
                              )}>
                                {item.seguimiento.estado}
                              </span>
                            </div>
                            <p className="text-sm text-[#065F46]">{item.seguimiento.tema_desarrollado || item.seguimiento.descripcion}</p>
                            {item.seguimiento.descripcion_tema && (
                              <p className="text-xs text-[#065F46] mt-1">{item.seguimiento.descripcion_tema}</p>
                            )}
                            <p className="text-xs text-[#065F46] mt-2">Avance: {item.seguimiento.porcentaje_avance}%</p>
                          </div>
                        ) : (
                          <div className="bg-[#F3F4F6] p-3 rounded-lg">
                            <p className="text-sm text-[#6B7280]">Sin registro de seguimiento</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      {showDenyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-4">Denegar Proyecto Docente</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Observación</label>
              <textarea
                value={denyObservation}
                onChange={(e) => setDenyObservation(e.target.value)}
                className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#E53E3E] focus:ring-3 focus:ring-[#E53E3E]/15 placeholder-[#AAAAAA] h-32"
                placeholder="Indique la razón de la denegación..."
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDenyModal(false);
                  setDenyObservation('');
                }}
                className="px-4 py-2 border border-[#E53E3E] text-[#E53E3E] rounded-lg hover:bg-[#FEF2F2] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDenegar}
                className="px-4 py-2 bg-[#E53E3E] text-white font-semibold rounded-lg hover:bg-[#C53030] transition-colors"
              >
                Denegar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProyectoDocenteDetail;
