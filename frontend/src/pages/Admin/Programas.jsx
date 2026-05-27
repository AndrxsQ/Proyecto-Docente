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
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Gestión de <span className="text-[#F5A623]">Programas</span> Académicos</h1>
        <button
          onClick={() => { setShowModal(true); setEditingPrograma(null); }}
          className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Programa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E1E1E]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Nombre</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Modalidad</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Jornada</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Plan de Estudio</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Facultad</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programas.map((programa, index) => (
                <tr key={programa.id} className={`border-b border-[#F0F0F0] hover:bg-[#FFF8EC] ` + (index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]')}>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{programa.nombre}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{programa.modalidad}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{programa.jornada}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{programa.plan_estudio}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{programa.facultad?.nombre}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(programa)}
                        className="p-2 hover:bg-[#F0F0F0] rounded-lg text-[#4A4A4A]"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(programa.id)}
                        className="p-2 hover:bg-[#F0F0F0] rounded-lg text-[#E53E3E]"
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
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-4">
              {editingPrograma ? 'Editar Programa' : 'Nuevo Programa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Modalidad</label>
                <select
                  value={formData.modalidad}
                  onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="mixta">Mixta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Jornada</label>
                <select
                  value={formData.jornada}
                  onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                >
                  <option value="diurna">Diurna</option>
                  <option value="nocturna">Nocturna</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Plan de Estudio</label>
                <input
                  type="number"
                  value={formData.plan_estudio}
                  onChange={(e) => setFormData({ ...formData, plan_estudio: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Facultad</label>
                <select
                  value={formData.facultad_id}
                  onChange={(e) => setFormData({ ...formData, facultad_id: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
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
                  className="px-4 py-2 border border-[#F5A623] text-[#F5A623] rounded-lg hover:bg-[#FFFBF2] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5A623] text-[#1E1E1E] font-semibold rounded-lg hover:bg-[#E09415] transition-colors"
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
