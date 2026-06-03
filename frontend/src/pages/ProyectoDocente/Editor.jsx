import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProyectoDocente, getFormato, saveFormato, getContenido, createContenido, updateContenido, deleteContenido, getBibliografia, createBibliografia, updateBibliografia, deleteBibliografia, enviarProyectoDocente } from '../../api/proyectosDocente';
import { getResultadosAprendizajeByAsignatura } from '../../api/resultadosAprendizaje';
import { getResultadosAprendizajeCurso, createResultadoAprendizajeCurso, updateResultadoAprendizajeCurso, deleteResultadoAprendizajeCurso } from '../../api/resultadosAprendizajeCurso';
import { Save, Send, Plus, Trash2 } from 'lucide-react';

const ProyectoDocenteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [formato, setFormato] = useState({});
  const [contenido, setContenido] = useState([]);
  const [bibliografia, setBibliografia] = useState([]);
  const [resultadosAprendizaje, setResultadosAprendizaje] = useState([]);
  const [resultadosAprendizajeCurso, setResultadosAprendizajeCurso] = useState([]);
  const [activeTab, setActiveTab] = useState('Información');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id !== 'new') {
      fetchData();
    } else {
      setLoading(false);
    }
    return () => {
      cleanupBlankItems();
    };
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasChanges = formato.descripcion || formato.resultados_aprendizaje || formato.estrategias || formato.evaluacion_resultados;
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formato]);

  const cleanupBlankItems = async () => {
    if (!proyecto || id === 'new') return;

    const blankContenido = contenido.filter(c => !c.tema || !c.descripcion);
    const blankBibliografia = bibliografia.filter(b => !b.referencia);

    for (const item of blankContenido) {
      if (typeof item.id === 'number' && item.id < 1000000) {
        try {
          await deleteContenido(proyecto.id, item.id);
        } catch (error) {
          console.error('Error deleting blank contenido:', error);
        }
      }
    }

    for (const item of blankBibliografia) {
      if (typeof item.id === 'number' && item.id < 1000000) {
        try {
          await deleteBibliografia(proyecto.id, item.id);
        } catch (error) {
          console.error('Error deleting blank bibliografia:', error);
        }
      }
    }
  };

  const fetchData = async () => {
    try {
      const [proyectoData, formatoData, contenidoData, bibliografiaData] = await Promise.all([
        getProyectoDocente(id),
        getFormato(id),
        getContenido(id),
        getBibliografia(id)
      ]);
      setProyecto(proyectoData);
      setFormato(formatoData || {});
      
      // Fetch resultados de aprendizaje for the asignatura
      const resultadosAprendizajeData = await getResultadosAprendizajeByAsignatura(proyectoData.asignatura_id);
      const resultadosAprendizajeCursoData = await getResultadosAprendizajeCurso(id);
      
      // Auto-generate weeks based on asignatura.semanas if no contenido exists
      const numSemanas = proyectoData?.asignatura?.semanas || 16;
      if (!contenidoData || contenidoData.length === 0) {
        const generatedContenido = Array.from({ length: numSemanas }, (_, i) => ({
          id: Date.now() + i,
          semana: i + 1,
          tema: '',
          descripcion: ''
        }));
        setContenido(generatedContenido);
      } else {
        setContenido((contenidoData || []).filter(c => c.tema && c.descripcion));
      }
      
      setBibliografia((bibliografiaData || []).filter(b => b.referencia));
      setResultadosAprendizaje(resultadosAprendizajeData || []);
      setResultadosAprendizajeCurso((resultadosAprendizajeCursoData || []).filter(r => r.contribucion_programa));
    } catch (error) {
      console.error('Error fetching data:', error);
      setContenido([]);
      setBibliografia([]);
      setResultadosAprendizaje([]);
      setResultadosAprendizajeCurso([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFormato = async () => {
    setSaving(true);
    try {
      await saveFormato(proyecto.id, formato);
      alert('Formato guardado');
      navigate('/proyectos-docente');
    } catch (error) {
      console.error('Error saving formato:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContenido = async (item) => {
    setContenido(contenido.map(c => c.id === item.id ? item : c));
    if (item.tema && item.descripcion) {
      try {
        if (typeof item.id === 'number' && item.id < 1000000) {
          await updateContenido(proyecto.id, item.id, item);
        } else {
          const response = await createContenido(proyecto.id, item);
          setContenido(contenido.map(c => c.id === item.id ? { ...item, id: response.id } : c));
        }
      } catch (error) {
        console.error('Error saving contenido:', error);
      }
    }
  };

  const handleAddBibliografia = async () => {
    const newBibliografia = {
      referencia: '',
      tipo: 'BASICA'
    };
    setBibliografia([...(bibliografia || []), { ...newBibliografia, id: Date.now() }]);
  };

  const handleUpdateBibliografia = async (item) => {
    setBibliografia(bibliografia.map(b => b.id === item.id ? item : b));
    if (item.referencia) {
      try {
        if (typeof item.id === 'number' && item.id < 1000000) {
          await updateBibliografia(proyecto.id, item.id, item);
        } else {
          const response = await createBibliografia(proyecto.id, item);
          setBibliografia(bibliografia.map(b => b.id === item.id ? { ...item, id: response.id } : b));
        }
      } catch (error) {
        console.error('Error saving bibliografia:', error);
      }
    }
  };

  const handleDeleteBibliografia = async (itemId) => {
    try {
      await deleteBibliografia(proyecto.id, itemId);
      setBibliografia(bibliografia.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting bibliografia:', error);
    }
  };

  const handleAddResultadoAprendizajeCurso = async () => {
    const newResultado = {
      proyecto_docente_id: proyecto.id,
      resultado_aprendizaje_id: null,
      resultado_curso: '',
      contribucion_programa: ''
    };
    setResultadosAprendizajeCurso([...resultadosAprendizajeCurso, { ...newResultado, id: Date.now() }]);
  };

  const handleUpdateResultadoAprendizajeCurso = async (item) => {
    setResultadosAprendizajeCurso(resultadosAprendizajeCurso.map(r => r.id === item.id ? item : r));
    if (item.resultado_aprendizaje_id && item.contribucion_programa) {
      try {
        if (typeof item.id === 'number' && item.id < 1000000) {
          await updateResultadoAprendizajeCurso(item);
        } else {
          const response = await createResultadoAprendizajeCurso(item);
          setResultadosAprendizajeCurso(resultadosAprendizajeCurso.map(r => r.id === item.id ? { ...item, id: response.id } : r));
        }
      } catch (error) {
        console.error('Error saving resultado aprendizaje curso:', error);
      }
    }
  };

  const handleDeleteResultadoAprendizajeCurso = async (itemId) => {
    try {
      if (typeof itemId === 'number' && itemId < 1000000) {
        await deleteResultadoAprendizajeCurso(itemId);
      }
      setResultadosAprendizajeCurso(resultadosAprendizajeCurso.filter(r => r.id !== itemId));
    } catch (error) {
      console.error('Error deleting resultado aprendizaje curso:', error);
    }
  };

  const handleEnviar = async () => {
    // Validate all fields before sending
    const errors = [];
    
    // Validate General tab
    if (!formato.descripcion || formato.descripcion.trim() === '') {
      errors.push('La descripción de la asignatura es obligatoria');
    }
    if (!formato.estrategias || formato.estrategias.trim() === '') {
      errors.push('Las estrategias metodológicas son obligatorias');
    }
    
    // Validate Resultados tab - all contributions must have resultado_aprendizaje_id and contribucion_programa
    if (!resultadosAprendizajeCurso || resultadosAprendizajeCurso.length === 0) {
      errors.push('Las contribuciones a los resultados de aprendizaje son obligatorias');
    } else {
      resultadosAprendizajeCurso.forEach((item) => {
        if (!item.resultado_aprendizaje_id) {
          errors.push('Cada contribución debe estar vinculada a un resultado de aprendizaje');
        }
        if (!item.contribucion_programa || item.contribucion_programa.trim() === '') {
          errors.push('La descripción de la contribución es obligatoria');
        }
      });
    }
    
    // Validate Contenido tab - all weeks must have tema and descripcion
    if (!contenido || contenido.length === 0) {
      errors.push('El contenido del curso es obligatorio');
    } else {
      contenido.forEach((item, index) => {
        if (!item.tema || item.tema.trim() === '') {
          errors.push(`El tema de la semana ${item.semana} es obligatorio`);
        }
        if (!item.descripcion || item.descripcion.trim() === '') {
          errors.push(`La descripción de la semana ${item.semana} es obligatoria`);
        }
      });
    }
    
    // Validate Evaluación tab
    if (!formato.evaluacion_resultados || formato.evaluacion_resultados.trim() === '') {
      errors.push('La evaluación de los resultados de aprendizaje es obligatoria');
    }
    
    if (errors.length > 0) {
      alert('No se puede enviar con campos vacíos');
      return;
    }
    
    if (!confirm('¿Está seguro de enviar el proyecto para revisión?')) return;
    try {
      await enviarProyectoDocente(proyecto.id);
      alert('Proyecto enviado para revisión');
      navigate('/proyectos-docente');
    } catch (error) {
      console.error('Error sending proyecto:', error);
      alert('Error al enviar el proyecto');
    }
  };

  if (loading) return <div className="p-8 text-[#4A4A4A]">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">
          {proyecto ? (
            <>Editar <span className="text-[#F5A623]">Proyecto</span> - {proyecto.asignatura?.nombre}</>
          ) : (
            <>Nuevo <span className="text-[#F5A623]">Proyecto</span> Docente</>
          )}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/proyectos-docente')}
            className="flex items-center text-[#4A4A4A] font-semibold px-4 py-2 rounded-lg hover:bg-[#F0F0F0] transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleSaveFormato}
            disabled={saving}
            className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </button>
          {proyecto && (proyecto.estado === 'ELABORADO') && (
            <button
              onClick={handleEnviar}
              className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar para Revisión
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex border-b-2 border-[#E5E7EB]">
          {['Información', 'General', 'Resultados', 'Contenido', 'Evaluación', 'Bibliografía'].map((tab) => (
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

        {activeTab === 'General' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Descripción de la Asignatura</label>
              <textarea
                value={formato.descripcion || ''}
                onChange={(e) => setFormato({ ...formato, descripcion: e.target.value })}
                className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-32"
                placeholder="Justificación e información general de la asignatura"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Estrategias Metodológicas</label>
              <textarea
                value={formato.estrategias || ''}
                onChange={(e) => setFormato({ ...formato, estrategias: e.target.value })}
                className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-32"
                placeholder="Metodologías de enseñanza"
              />
            </div>
          </div>
        )}

        {activeTab === 'Resultados' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1E1E1E]">Contribuciones a los Resultados de Aprendizaje</h3>
              <button onClick={handleAddResultadoAprendizajeCurso} className="flex items-center text-[#F5A623] font-semibold hover:text-[#E09415]">
                <Plus className="w-4 h-4 mr-1" />
                Agregar Contribución
              </button>
            </div>
            <div className="space-y-4">
              {!resultadosAprendizajeCurso || resultadosAprendizajeCurso.length === 0 ? (
                <p className="text-[#4A4A4A]">No hay contribuciones para mostrar</p>
              ) : (
                resultadosAprendizajeCurso.map((item) => (
                  <div key={item.id} className="border border-[#F0F0F0] p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-[#1E1E1E]">Contribución</span>
                      <button onClick={() => handleDeleteResultadoAprendizajeCurso(item.id)} className="text-[#E53E3E] hover:text-[#C53030]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Resultado de Aprendizaje</label>
                      <select
                        value={item.resultado_aprendizaje_id || ''}
                        onChange={(e) => handleUpdateResultadoAprendizajeCurso({ ...item, resultado_aprendizaje_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                      >
                        <option value="">Seleccione un resultado de aprendizaje</option>
                        {resultadosAprendizaje.map((ra) => (
                          <option key={ra.id} value={ra.id}>
                            {ra.codigo} - {ra.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#7A7A7A] mb-1">Descripción de la Contribución</label>
                      <textarea
                        value={item.contribucion_programa || ''}
                        onChange={(e) => handleUpdateResultadoAprendizajeCurso({ ...item, contribucion_programa: e.target.value })}
                        className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-20"
                        placeholder="Describa cómo la asignatura contribuye a este resultado de aprendizaje"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'Contenido' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#1E1E1E]">Contenido del Curso/Asignatura</h3>
            </div>
            <div className="space-y-4">
              {!contenido || contenido.length === 0 ? (
                <p className="text-[#4A4A4A]">No hay contenido para mostrar</p>
              ) : (
                contenido.map((item) => (
                  <div key={item.id} className="border border-[#F0F0F0] p-4 rounded-xl">
                    <div className="mb-2">
                      <span className="font-semibold text-[#1E1E1E]">Semana {item.semana}</span>
                    </div>
                    <input
                      type="text"
                      value={item.tema}
                      onChange={(e) => handleUpdateContenido({ ...item, tema: e.target.value })}
                      className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] mb-2"
                      placeholder="Tema"
                    />
                    <textarea
                      value={item.descripcion}
                      onChange={(e) => handleUpdateContenido({ ...item, descripcion: e.target.value })}
                      className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-20"
                      placeholder="Descripción"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'Evaluación' && (
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Evaluación de los Resultados de Aprendizaje</label>
            <textarea
              value={formato.evaluacion_resultados || ''}
              onChange={(e) => setFormato({ ...formato, evaluacion_resultados: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-64"
              placeholder="Describa los criterios de evaluación"
            />
          </div>
        )}

        {activeTab === 'Bibliografía' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1E1E1E]">Bibliografía</h3>
              <button onClick={handleAddBibliografia} className="flex items-center text-[#F5A623] font-semibold hover:text-[#E09415]">
                <Plus className="w-4 h-4 mr-1" />
                Agregar Referencia
              </button>
            </div>
            <div className="space-y-4">
              {!bibliografia || bibliografia.length === 0 ? (
                <p className="text-[#4A4A4A]">No hay bibliografía para mostrar</p>
              ) : (
                bibliografia.map((item) => (
                  <div key={item.id} className="border border-[#F0F0F0] p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <select
                        value={item.tipo}
                        onChange={(e) => handleUpdateBibliografia({ ...item, tipo: e.target.value })}
                        className="px-4 py-2 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 text-sm"
                      >
                        <option value="BASICA">Básica</option>
                        <option value="COMPLEMENTARIA">Complementaria</option>
                      </select>
                      <button onClick={() => handleDeleteBibliografia(item.id)} className="text-[#E53E3E] hover:text-[#C53030]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={item.referencia}
                      onChange={(e) => handleUpdateBibliografia({ ...item, referencia: e.target.value })}
                      className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-20"
                      placeholder="Referencia bibliográfica completa"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProyectoDocenteEditor;
