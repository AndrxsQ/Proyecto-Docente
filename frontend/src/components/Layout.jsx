import { useState, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, ClipboardList, Settings, LogOut, User, GraduationCap, ArrowUp } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef(null);

  const handleScroll = () => {
    if (!mainRef.current) return;
    setShowScrollTop(mainRef.current.scrollTop > 250);
  };

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isActive = (path) => location.pathname === path;

  const getMenuItems = () => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: Home, show: true },
      { path: '/proyectos-docente', label: 'Proyectos Docente', icon: FileText, show: true },
      { path: '/seguimiento', label: 'Seguimiento', icon: ClipboardList, show: user?.rol === 'DOCENTE' || user?.rol === 'ADMIN' },
      { path: '/admin/usuarios', label: 'Usuarios', icon: User, show: user?.rol === 'ADMIN' },
      { path: '/admin/asignaturas', label: 'Asignaturas', icon: Settings, show: user?.rol === 'ADMIN' },
      { path: '/admin/programas', label: 'Programas', icon: Settings, show: user?.rol === 'ADMIN' },
    ];
    return items.filter(item => item.show);
  };

  return (
    <div className="flex h-screen bg-[#EAF0F7] overflow-hidden">
      <aside className="w-72 h-screen bg-[#1E1E1E] flex flex-col fixed left-0 top-0">
        <div className="p-6 border-b border-[#333333]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#F5A623] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-[#1E1E1E]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SGPD</h1>
              <p className="text-xs text-gray-400">Unicartagena</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mt-6 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9A9A9A]">Principal</p>
          </div>
          <ul className="space-y-1">
            {getMenuItems().map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl transition-colors ` + (
                    isActive(item.path)
                      ? 'bg-[#F5A623] text-[#1E1E1E] font-semibold'
                      : 'text-white hover:bg-[#2E2E2E]'
                  )}
                >
                  <item.icon className={`w-5 h-5 mr-3 ` + (isActive(item.path) ? 'text-[#1E1E1E]' : 'text-white')} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#333333]">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 bg-[#F5A623] rounded-full flex items-center justify-center text-[#1E1E1E] font-bold">
              {user?.nombre?.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-gray-400">{user?.rol?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 bg-[#F5A623] text-[#1E1E1E] font-semibold rounded-xl hover:bg-[#E09415] transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
      <main ref={mainRef} onScroll={handleScroll} className="flex-1 ml-72 overflow-y-auto relative">
        <Outlet />
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed right-6 bottom-6 z-50 p-3 rounded-full bg-[#F5A623] text-[#1E1E1E] shadow-lg hover:bg-[#E09415] transition-colors"
            aria-label="Volver arriba"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </main>
    </div>
  );
};

export default Layout;
