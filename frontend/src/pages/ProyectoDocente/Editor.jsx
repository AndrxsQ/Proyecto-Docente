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
      setContenido(contenidoData);
      setBibliografia(bibliografiaData);
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
    try {
      const response = await createContenido(proyecto.id, newItem);
      setContenido([...contenido, { ...newItem, id: response.id }]);
    } catch (error) {
      console.error('Error adding contenido:', error);
    }
  };

  const handleUpdateContenido = async (item) => {
    setContenido(contenido.map(c => c.id === item.id ? item : c));
    try {
      await updateContenido(proyecto.id, item.id, item);
    } catch (error) {
      console.error('Error updating contenido:', error);
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
    try {
      const newBibliografia = await createBibliografia(proyecto.id, {
        referencia: '',
        tipo: 'BASICA'
      });
      setBibliografia([...(bibliografia || []), newBibliografia]);
    } catch (error) {
      console.error('Error adding bibliografia:', error);
    }
  };

  const handleUpdateBibliografia = async (item) => {
    setBibliografia(bibliografia.map(b => b.id === item.id ? item : b));
    try {
      await updateBibliografia(proyecto.id, item.id, item);
    } catch (error) {
      console.error('Error updating bibliografia:', error);
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

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {proyecto ? `Editar Proyecto - ${proyecto.curso?.nombre}` : 'Nuevo Proyecto Docente'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleSaveFormato}
            disabled={saving}
            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </button>
          {proyecto && (proyecto.estado === 'BORRADOR' || proyecto.estado === 'DEVUELTO_DOCENTE') && (
            <button
              onClick={handleEnviar}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar para Revisión
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex border-b">
          {['general', 'resultados', 'contenido', 'evaluacion', 'bibliografia'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Descripción del Curso</label>
              <textarea
                value={formato.descripcion || ''}
                onChange={(e) => setFormato({ ...formato, descripcion: e.target.value })}
                className="w-full px-3 py-2 border rounded-md h-32"
                placeholder="Justificación e información general del curso"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estrategias de Enseñanza</label>
              <textarea
                value={formato.estrategias || ''}
                onChange={(e) => setFormato({ ...formato, estrategias: e.target.value })}
                className="w-full px-3 py-2 border rounded-md h-32"
                placeholder="Metodologías de enseñanza"
              />
            </div>
          </div>
        )}

        {activeTab === 'resultados' && (
          <div>
            <label className="block text-sm font-medium mb-1">Resultados de Aprendizaje</label>
            <textarea
              value={formato.resultados_aprendizaje || ''}
              onChange={(e) => setFormato({ ...formato, resultados_aprendizaje: e.target.value })}
              className="w-full px-3 py-2 border rounded-md h-64"
              placeholder="Liste los resultados de aprendizaje del curso"
            />
          </div>
        )}

        {activeTab === 'contenido' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Contenido Semanal</h3>
              <button onClick={handleAddContenido} className="flex items-center text-blue-600 hover:text-blue-700">
                <Plus className="w-4 h-4 mr-1" />
                Agregar Semana
              </button>
            </div>
            <div className="space-y-4">
              {!contenido || contenido.length === 0 ? (
                <p className="text-gray-500">No hay contenido para mostrar</p>
              ) : (
                contenido.map((item) => (
                  <div key={item.id} className="border p-4 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Semana {item.semana}</span>
                      <button onClick={() => handleDeleteContenido(item.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.tema}
                      onChange={(e) => handleUpdateContenido({ ...item, tema: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md mb-2"
                      placeholder="Tema"
                    />
                    <textarea
                      value={item.descripcion}
                      onChange={(e) => handleUpdateContenido({ ...item, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md h-20"
                      placeholder="Descripción"
                    />
                    <input
                      type="date"
                      value={item.fecha ? item.fecha.split('T')[0] : ''}
                      onChange={(e) => handleUpdateContenido({ ...item, fecha: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md mt-2"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'evaluacion' && (
          <div>
            <label className="block text-sm font-medium mb-1">Criterios y Porcentajes de Evaluación</label>
            <textarea
              value={formato.evaluacion_resultados || ''}
              onChange={(e) => setFormato({ ...formato, evaluacion_resultados: e.target.value })}
              className="w-full px-3 py-2 border rounded-md h-64"
              placeholder="Describa los criterios de evaluación y sus porcentajes"
            />
          </div>
        )}

        {activeTab === 'bibliografia' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Bibliografía</h3>
              <button onClick={handleAddBibliografia} className="flex items-center text-blue-600 hover:text-blue-700">
                <Plus className="w-4 h-4 mr-1" />
                Agregar Referencia
              </button>
            </div>
            <div className="space-y-4">
              {!bibliografia || bibliografia.length === 0 ? (
                <p className="text-gray-500">No hay bibliografía para mostrar</p>
              ) : (
                bibliografia.map((item) => (
                  <div key={item.id} className="border p-4 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <select
                        value={item.tipo}
                        onChange={(e) => handleUpdateBibliografia({ ...item, tipo: e.target.value })}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="BASICA">Básica</option>
                        <option value="COMPLEMENTARIA">Complementaria</option>
                      </select>
                      <button onClick={() => handleDeleteBibliografia(item.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={item.referencia}
                      onChange={(e) => handleUpdateBibliografia({ ...item, referencia: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md h-20"
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
