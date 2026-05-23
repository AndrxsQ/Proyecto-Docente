import { useState, useEffect } from 'react';
import { getCursos, createCurso, updateCurso } from '../../api/cursos';
import { getProgramas } from '../../api/programas';
import { Plus, Edit } from 'lucide-react';

const AdminCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    componente: '',
    creditos: '',
    total_horas: '',
    tipo: 'teórico-práctico',
    prerrequisitos: '',
    correquisitos: '',
    periodo_academico: '',
    programa_id: '',
    docente_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cursosData, programasData] = await Promise.all([
        getCursos(),
        getProgramas()
      ]);
      setCursos(cursosData);
      setProgramas(programasData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        creditos: parseInt(formData.creditos),
        total_horas: parseInt(formData.total_horas),
        programa_id: parseInt(formData.programa_id),
        docente_id: formData.docente_id ? parseInt(formData.docente_id) : null
      };
      if (editingCurso) {
        await updateCurso(editingCurso.id, data);
      } else {
        await createCurso(data);
      }
      setShowModal(false);
      setEditingCurso(null);
      setFormData({
        nombre: '',
        componente: '',
        creditos: '',
        total_horas: '',
        tipo: 'teórico-práctico',
        prerrequisitos: '',
        correquisitos: '',
        periodo_academico: '',
        programa_id: '',
        docente_id: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving curso:', error);
    }
  };

  const handleEdit = (curso) => {
    setEditingCurso(curso);
    setFormData({
      nombre: curso.nombre,
      componente: curso.componente,
      creditos: curso.creditos,
      total_horas: curso.total_horas,
      tipo: curso.tipo,
      prerrequisitos: curso.prerrequisitos,
      correquisitos: curso.correquisitos,
      periodo_academico: curso.periodo_academico,
      programa_id: curso.programa_id,
      docente_id: curso.docente_id || ''
    });
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
        <button
          onClick={() => { setShowModal(true); setEditingCurso(null); }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Curso
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Componente</th>
                <th className="text-left p-4">Créditos</th>
                <th className="text-left p-4">Tipo</th>
                <th className="text-left p-4">Periodo</th>
                <th className="text-left p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso) => (
                <tr key={curso.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{curso.nombre}</td>
                  <td className="p-4">{curso.componente}</td>
                  <td className="p-4">{curso.creditos}</td>
                  <td className="p-4">{curso.tipo}</td>
                  <td className="p-4">{curso.periodo_academico}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(curso)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl m-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCurso ? 'Editar Curso' : 'Nuevo Curso'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Componente</label>
                <input
                  type="text"
                  value={formData.componente}
                  onChange={(e) => setFormData({ ...formData, componente: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Créditos</label>
                <input
                  type="number"
                  value={formData.creditos}
                  onChange={(e) => setFormData({ ...formData, creditos: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Horas</label>
                <input
                  type="number"
                  value={formData.total_horas}
                  onChange={(e) => setFormData({ ...formData, total_horas: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="teórico">Teórico</option>
                  <option value="práctico">Práctico</option>
                  <option value="teórico-práctico">Teórico-Práctico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Periodo Académico</label>
                <input
                  type="text"
                  value={formData.periodo_academico}
                  onChange={(e) => setFormData({ ...formData, periodo_academico: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="ej. 2025-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Programa</label>
                <select
                  value={formData.programa_id}
                  onChange={(e) => setFormData({ ...formData, programa_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Seleccionar programa</option>
                  {programas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Prerrequisitos</label>
                <input
                  type="text"
                  value={formData.prerrequisitos}
                  onChange={(e) => setFormData({ ...formData, prerrequisitos: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Correquisitos</label>
                <input
                  type="text"
                  value={formData.correquisitos}
                  onChange={(e) => setFormData({ ...formData, correquisitos: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCursos;
