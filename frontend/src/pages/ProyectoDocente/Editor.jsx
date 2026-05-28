import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProyectoDocente, getFormato, saveFormato, getContenido, createContenido, updateContenido, deleteContenido, getBibliografia, createBibliografia, updateBibliografia, deleteBibliografia, enviarProyectoDocente } from '../../api/proyectosDocente';
import { Save, Send, Plus, Trash2 } from 'lucide-react';

const ProyectoDocenteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [formato, setFormato] = useState({});
  const [contenido, setContenido] = useState([]);
  const [bibliografia, setBibliografia] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
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
      setContenido((contenidoData || []).filter(c => c.tema && c.descripcion));
      setBibliografia((bibliografiaData || []).filter(b => b.referencia));
    } catch (error) {
      console.error('Error fetching data:', error);
      setContenido([]);
      setBibliografia([]);
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

  const handleAddContenido = async () => {
    const newSemana = (contenido?.length || 0) + 1;
    const newItem = {
      semana: newSemana,
      tema: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    };
    setContenido([...contenido, { ...newItem, id: Date.now() }]);
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

  const handleDeleteContenido = async (itemId) => {
    try {
      await deleteContenido(proyecto.id, itemId);
      setContenido(contenido.filter(c => c.id !== itemId));
    } catch (error) {
      console.error('Error deleting contenido:', error);
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

  const handleEnviar = async () => {
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
          {['general', 'resultados', 'contenido', 'evaluacion', 'bibliografia'].map((tab) => (
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
        {activeTab === 'general' && (
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
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Estrategias de Enseñanza</label>
              <textarea
                value={formato.estrategias || ''}
                onChange={(e) => setFormato({ ...formato, estrategias: e.target.value })}
                className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-32"
                placeholder="Metodologías de enseñanza"
              />
            </div>
          </div>
        )}

        {activeTab === 'resultados' && (
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Resultados de Aprendizaje</label>
            <textarea
              value={formato.resultados_aprendizaje || ''}
              onChange={(e) => setFormato({ ...formato, resultados_aprendizaje: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-64"
              placeholder="Liste los resultados de aprendizaje de la asignatura"
            />
          </div>
        )}

        {activeTab === 'contenido' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1E1E1E]">Contenido Semanal</h3>
              <button onClick={handleAddContenido} className="flex items-center text-[#F5A623] font-semibold hover:text-[#E09415]">
                <Plus className="w-4 h-4 mr-1" />
                Agregar Semana
              </button>
            </div>
            <div className="space-y-4">
              {!contenido || contenido.length === 0 ? (
                <p className="text-[#4A4A4A]">No hay contenido para mostrar</p>
              ) : (
                contenido.map((item) => (
                  <div key={item.id} className="border border-[#F0F0F0] p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-[#1E1E1E]">Semana {item.semana}</span>
                      <button onClick={() => handleDeleteContenido(item.id)} className="text-[#E53E3E] hover:text-[#C53030]">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                    <input
                      type="date"
                      value={item.fecha ? item.fecha.split('T')[0] : ''}
                      onChange={(e) => handleUpdateContenido({ ...item, fecha: e.target.value })}
                      className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 mt-2"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'evaluacion' && (
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Criterios y Porcentajes de Evaluación</label>
            <textarea
              value={formato.evaluacion_resultados || ''}
              onChange={(e) => setFormato({ ...formato, evaluacion_resultados: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA] h-64"
              placeholder="Describa los criterios de evaluación y sus porcentajes"
            />
          </div>
        )}

        {activeTab === 'bibliografia' && (
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
