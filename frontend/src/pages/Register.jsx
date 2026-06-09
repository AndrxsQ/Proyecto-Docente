import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, GraduationCap, Mail, Lock, User, Building2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'ESTUDIANTE',
    programa_id: '',
    facultad_id: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await register(
        formData.nombre,
        formData.apellido,
        formData.email,
        formData.password,
        formData.rol,
        formData.programa_id ? parseInt(formData.programa_id) : null,
        formData.facultad_id ? parseInt(formData.facultad_id) : null
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Error al registrar usuario');
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="bg-white px-16 py-12 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-[#F5A623] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-[#1E1E1E]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#F5A623] text-center mb-2">Registrarse</h1>
          <p className="text-sm text-[#4A4A4A] text-center mb-8">Sistema de Gestión de Proyectos Docente</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                    placeholder="Nombre"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Apellido</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                    placeholder="Apellido"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  placeholder="Ingresa tu email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  placeholder="Confirma tu contraseña"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Rol</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15"
                required
              >
                <option value="ESTUDIANTE">Estudiante</option>
                <option value="DOCENTE">Docente</option>
                <option value="JEFE_DEPARTAMENTO">Jefe de Departamento</option>
                <option value="DIRECTOR_PROGRAMA">Director de Programa</option>
                <option value="COORDINADOR_PROGRAMA">Coordinador de Programa</option>
                <option value="COMITE_CURRICULAR">Comité Curricular</option>
                <option value="COMITE_ACADEMICO_INSTITUTO">Comité Académico de Instituto</option>
                <option value="DECANO">Decano</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">ID Programa (opcional)</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                  <input
                    type="number"
                    name="programa_id"
                    value={formData.programa_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                    placeholder="ID del programa"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">ID Facultad (opcional)</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                  <input
                    type="number"
                    name="facultad_id"
                    value={formData.facultad_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                    placeholder="ID de la facultad"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#F5A623] text-[#1E1E1E] font-bold py-3 rounded-lg hover:bg-[#E09415] transition-colors flex items-center justify-center gap-2"
            >
              Registrarse
              <UserPlus className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-sm text-[#4A4A4A] mt-6">
            ¿Ya tienes cuenta? <a href="/login" className="text-[#F5A623] font-semibold hover:text-[#E09415]">Inicia sesión</a>
          </p>
        </div>
      </div>

      <div className="bg-[#1E1E1E] relative flex flex-col justify-center px-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E1E] to-[#2E2E2E] opacity-90"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-[#F5A623] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-[#1E1E1E]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">SGPD</h2>
              <p className="text-sm text-gray-400">Sistema de Gestión de Proyectos Docente</p>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            Únete al <span className="text-[#F5A623]">Sistema</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Regístrate para empezar a gestionar tus proyectos docente de la Universidad de Cartagena
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#F5A623] rounded-full"></div>
              <p className="text-gray-300">Gestión completa de proyectos docente</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#F5A623] rounded-full"></div>
              <p className="text-gray-300">Seguimiento de clases y contenidos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#F5A623] rounded-full"></div>
              <p className="text-gray-300">Control de aprobaciones por roles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
