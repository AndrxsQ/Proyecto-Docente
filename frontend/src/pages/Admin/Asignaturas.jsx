import { useState, useEffect } from 'react';
import { getAsignaturas, createAsignatura, updateAsignatura } from '../../api/asignaturas';
import { getProgramas } from '../../api/programas';
import { Plus, Edit } from 'lucide-react';

const AdminAsignaturas = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAsignatura, setEditingAsignatura] = useState(null);
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
      const [asignaturasData, programasData] = await Promise.all([
        getAsignaturas(),
        getProgramas()
      ]);
      setAsignaturas(asignaturasData);
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
      if (editingAsignatura) {
        await updateAsignatura(editingAsignatura.id, data);
      } else {
        await createAsignatura(data);
      }
      setShowModal(false);
      setEditingAsignatura(null);
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
      console.error('Error saving asignatura:', error);
    }
  };

  const handleEdit = (asignatura) => {
    setEditingAsignatura(asignatura);
    setFormData({
      nombre: asignatura.nombre,
      componente: asignatura.componente,
      creditos: asignatura.creditos,
      total_horas: asignatura.total_horas,
      tipo: asignatura.tipo,
      prerrequisitos: asignatura.prerrequisitos,
      correquisitos: asignatura.correquisitos,
      periodo_academico: asignatura.periodo_academico,
      programa_id: asignatura.programa_id,
      docente_id: asignatura.docente_id || ''
    });
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Gestión de <span className="text-[#F5A623]">Asignaturas</span></h1>
        <button
          onClick={() => { setShowModal(true); setEditingAsignatura(null); }}
          className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Asignatura
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E1E1E]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Nombre</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Componente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Créditos</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Periodo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaturas.map((asignatura, index) => (
                <tr key={asignatura.id} className={`border-b border-[#F0F0F0] hover:bg-[#FFF8EC] ` + (index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]')}>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{asignatura.nombre}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{asignatura.componente}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{asignatura.creditos}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{asignatura.tipo}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{asignatura.periodo_academico}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(asignatura)}
                      className="p-2 hover:bg-[#F0F0F0] rounded-lg text-[#4A4A4A]"
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
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl m-4 shadow-lg">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-4">
              {editingAsignatura ? 'Editar Asignatura' : 'Nueva Asignatura'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Componente</label>
                <input
                  type="text"
                  value={formData.componente}
                  onChange={(e) => setFormData({ ...formData, componente: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Créditos</label>
                <input
                  type="number"
                  value={formData.creditos}
                  onChange={(e) => setFormData({ ...formData, creditos: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Total Horas</label>
                <input
                  type="number"
                  value={formData.total_horas}
                  onChange={(e) => setFormData({ ...formData, total_horas: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                >
                  <option value="teórico">Teórico</option>
                  <option value="práctico">Práctico</option>
                  <option value="teórico-práctico">Teórico-Práctico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Periodo Académico</label>
                <input
                  type="text"
                  value={formData.periodo_academico}
                  onChange={(e) => setFormData({ ...formData, periodo_academico: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  placeholder="ej. 2025-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Programa</label>
                <select
                  value={formData.programa_id}
                  onChange={(e) => setFormData({ ...formData, programa_id: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                  required
                >
                  <option value="">Seleccionar programa</option>
                  {programas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Prerrequisitos</label>
                <input
                  type="text"
                  value={formData.prerrequisitos}
                  onChange={(e) => setFormData({ ...formData, prerrequisitos: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Correquisitos</label>
                <input
                  type="text"
                  value={formData.correquisitos}
                  onChange={(e) => setFormData({ ...formData, correquisitos: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
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

export default AdminAsignaturas;
