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
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={() => { setShowModal(true); setEditingUsuario(null); }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Rol</th>
                <th className="text-left p-4">Programa</th>
                <th className="text-left p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{usuario.nombre} {usuario.apellido}</td>
                  <td className="p-4">{usuario.email}</td>
                  <td className="p-4">{usuario.rol}</td>
                  <td className="p-4">{usuario.programa?.nombre || '-'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(usuario)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                <label className="block text-sm font-medium mb-1">Apellido</label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              {!editingUsuario && (
                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="DOCENTE">Docente</option>
                  <option value="JEFE_DEPARTAMENTO">Jefe de Departamento</option>
                  <option value="DIRECTOR_PROGRAMA">Director de Programa</option>
                  <option value="COORDINADOR_PROGRAMA">Coordinador de Programa</option>
                  <option value="COMITE_CURRICULAR">Comité Curricular</option>
                  <option value="DECANO">Decano</option>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Programa</label>
                <select
                  value={formData.programa_id}
                  onChange={(e) => setFormData({ ...formData, programa_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleccionar programa</option>
                  {programas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Facultad</label>
                <select
                  value={formData.facultad_id}
                  onChange={(e) => setFormData({ ...formData, facultad_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
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

export default AdminUsuarios;
