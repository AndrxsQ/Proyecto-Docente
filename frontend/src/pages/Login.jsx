import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      console.log('Login successful');
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
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
          <h1 className="text-3xl font-bold text-[#F5A623] text-center mb-2">Iniciar sesión</h1>
          <p className="text-sm text-[#4A4A4A] text-center mb-8">Sistema de Gestión de Proyectos Docente</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#D0D0D0] rounded-lg focus:outline-none focus:border-[#F5A623] focus:ring-3 focus:ring-[#F5A623]/15 placeholder-[#AAAAAA]"
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#F5A623] border-[#D0D0D0] rounded focus:ring-[#F5A623]" />
                <span className="ml-2 text-sm text-[#4A4A4A]">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-[#F5A623] hover:text-[#E09415]">¿Olvidaste tu contraseña?</a>
            </div>

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#F5A623] text-[#1E1E1E] font-bold py-3 rounded-lg hover:bg-[#E09415] transition-colors flex items-center justify-center gap-2"
            >
              Ingresar
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-sm text-[#4A4A4A] mt-6">
            ¿No tienes cuenta? <a href="/register" className="text-[#F5A623] font-semibold hover:text-[#E09415]">Regístrate</a>
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
            Bienvenido al <span className="text-[#F5A623]">Sistema</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Gestiona de manera eficiente los proyectos docente de la Universidad de Cartagena
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

export default Login;
