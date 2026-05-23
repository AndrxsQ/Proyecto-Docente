import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProyectoDocenteList from './pages/ProyectoDocente/List';
import ProyectoDocenteEditor from './pages/ProyectoDocente/Editor';
import ProyectoDocenteReview from './pages/ProyectoDocente/Review';
import ProyectoDocenteDetail from './pages/ProyectoDocente/Detail';
import SeguimientoList from './pages/Seguimiento/List';
import SeguimientoForm from './pages/Seguimiento/Form';
import AdminUsuarios from './pages/Admin/Usuarios';
import AdminCursos from './pages/Admin/Cursos';
import AdminProgramas from './pages/Admin/Programas';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="proyectos-docente" element={<ProyectoDocenteList />} />
            <Route path="proyectos-docente/new" element={<ProyectoDocenteEditor />} />
            <Route path="proyectos-docente/:id/edit" element={<ProyectoDocenteEditor />} />
            <Route path="proyectos-docente/:id/review" element={<ProyectoDocenteReview />} />
            <Route path="proyectos-docente/:id" element={<ProyectoDocenteDetail />} />
            <Route path="seguimiento" element={<SeguimientoList />} />
            <Route path="seguimiento/:id" element={<SeguimientoForm />} />
            <Route path="admin/usuarios" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsuarios /></ProtectedRoute>} />
            <Route path="admin/cursos" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCursos /></ProtectedRoute>} />
            <Route path="admin/programas" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProgramas /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
