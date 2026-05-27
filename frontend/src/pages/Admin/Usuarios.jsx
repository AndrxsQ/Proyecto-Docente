import { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario } from '../../api/usuarios';
import { getProgramas } from '../../api/programas';
import { getFacultades } from '../../api/facultades';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'DOCENTE',
    programa_id: '',
    facultad_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usuariosData, programasData, facultadesData] = await Promise.all([
        getUsuarios(),
        getProgramas(),
        getFacultades()
      ]);
      setUsuarios(usuariosData);
      setProgramas(programasData);
      setFacultades(facultadesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUsuario) {
        await updateUsuario(editingUsuario.id, formData);
      } else {
        await createUsuario(formData);
      }
      setShowModal(false);
      setEditingUsuario(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol: 'DOCENTE',
        programa_id: '',
        facultad_id: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving usuario:', error);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      programa_id: usuario.programa_id || '',
      facultad_id: usuario.facultad_id || ''
    });
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Gestión de <span className="text-[#F5A623]">Usuarios</span></h1>
        <button
          onClick={() => { setShowModal(true); setEditingUsuario(null); }}
          className="flex items-center bg-[#F5A623] text-[#1E1E1E] font-semibold px-4 py-2 rounded-lg hover:bg-[#E09415] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E1E1E]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Nombre</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Rol</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Programa</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario, index) => (
                <tr key={usuario.id} className={`border-b border-[#F0F0F0] hover:bg-[#FFF8EC] ` + (index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]')}>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{usuario.nombre} {usuario.apellido}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{usuario.email}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{usuario.rol.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 text-sm text-[#4A4A4A]">{usuario.programa?.nombre || '-'}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(usuario)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-4">
              {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Apellido</label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  required
                />
              </div>
              {!editingUsuario && (
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                >
                  <option value="DOCENTE">Docente</option>
                  <option value="JEFE_DEPARTAMENTO">Jefe de Departamento</option>
                  <option value="DIRECTOR_PROGRAMA">Director de Programa</option>
                  <option value="COORDINADOR_PROGRAMA">Coordinador de Programa</option>
                  <option value="COMITE_CURRICULAR">Comité Curricular</option>
                  <option value="COMITE_ACADEMICO_INSTITUTO">Comité Académico</option>
                  <option value="DECANO">Decano</option>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Programa</label>
                <select
                  value={formData.programa_id}
                  onChange={(e) => setFormData({ ...formData, programa_id: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                >
                  <option value="">Seleccionar programa</option>
                  {programas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Facultad</label>
                <select
                  value={formData.facultad_id}
                  onChange={(e) => setFormData({ ...formData, facultad_id: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
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

export default AdminUsuarios;
