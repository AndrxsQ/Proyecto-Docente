import { useState, useEffect } from 'react';
import { getProgramas, createPrograma, updatePrograma, deletePrograma } from '../../api/programas';
import { getFacultades } from '../../api/facultades';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminProgramas = () => {
  const [programas, setProgramas] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPrograma, setEditingPrograma] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    modalidad: 'presencial',
    jornada: 'diurna',
    plan_estudio: '',
    facultad_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programasData, facultadesData] = await Promise.all([
        getProgramas(),
        getFacultades()
      ]);
      setProgramas(programasData);
      setFacultades(facultadesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        plan_estudio: parseInt(formData.plan_estudio),
        facultad_id: parseInt(formData.facultad_id)
      };
      if (editingPrograma) {
        await updatePrograma(editingPrograma.id, data);
      } else {
        await createPrograma(data);
      }
      setShowModal(false);
      setEditingPrograma(null);
      setFormData({
        nombre: '',
        modalidad: 'presencial',
        jornada: 'diurna',
        plan_estudio: '',
        facultad_id: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving programa:', error);
    }
  };

  const handleEdit = (programa) => {
    setEditingPrograma(programa);
    setFormData({
      nombre: programa.nombre,
      modalidad: programa.modalidad,
      jornada: programa.jornada,
      plan_estudio: programa.plan_estudio,
      facultad_id: programa.facultad_id
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este programa?')) return;
    try {
      await deletePrograma(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting programa:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Programas Académicos</h1>
        <button
          onClick={() => { setShowModal(true); setEditingPrograma(null); }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Programa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Modalidad</th>
                <th className="text-left p-4">Jornada</th>
                <th className="text-left p-4">Plan de Estudio</th>
                <th className="text-left p-4">Facultad</th>
                <th className="text-left p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programas.map((programa) => (
                <tr key={programa.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{programa.nombre}</td>
                  <td className="p-4">{programa.modalidad}</td>
                  <td className="p-4">{programa.jornada}</td>
                  <td className="p-4">{programa.plan_estudio}</td>
                  <td className="p-4">{programa.facultad?.nombre}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(programa)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(programa.id)}
                        className="p-2 hover:bg-gray-100 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingPrograma ? 'Editar Programa' : 'Nuevo Programa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
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
                <label className="block text-sm font-medium mb-1">Modalidad</label>
                <select
                  value={formData.modalidad}
                  onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="mixta">Mixta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jornada</label>
                <select
                  value={formData.jornada}
                  onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="diurna">Diurna</option>
                  <option value="nocturna">Nocturna</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plan de Estudio</label>
                <input
                  type="number"
                  value={formData.plan_estudio}
                  onChange={(e) => setFormData({ ...formData, plan_estudio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Facultad</label>
                <select
                  value={formData.facultad_id}
                  onChange={(e) => setFormData({ ...formData, facultad_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Seleccionar facultad</option>
                  {facultades.map((f) => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
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

export default AdminProgramas;
