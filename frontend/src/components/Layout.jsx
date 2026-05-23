import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, ClipboardList, Settings, LogOut, User } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getMenuItems = () => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: Home, show: true },
      { path: '/proyectos-docente', label: 'Proyectos Docente', icon: FileText, show: true },
      { path: '/seguimiento', label: 'Seguimiento', icon: ClipboardList, show: user?.rol === 'DOCENTE' || user?.rol === 'ADMIN' },
      { path: '/admin/usuarios', label: 'Usuarios', icon: User, show: user?.rol === 'ADMIN' },
      { path: '/admin/cursos', label: 'Cursos', icon: Settings, show: user?.rol === 'ADMIN' },
      { path: '/admin/programas', label: 'Programas', icon: Settings, show: user?.rol === 'ADMIN' },
    ];
    return items.filter(item => item.show);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Proyecto Docente</h1>
          <p className="text-xs text-gray-500">Universidad de Cartagena</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {getMenuItems().map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive(item.path) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.nombre?.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-gray-500">{user?.rol?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
