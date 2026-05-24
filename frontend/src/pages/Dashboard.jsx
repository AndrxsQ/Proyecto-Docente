import { useAuth } from '../context/AuthContext';
import { getProyectosDocentes } from '../api/proyectosDocente';
import { getCursos } from '../api/cursos';
import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.rol === 'DOCENTE') {
          const cursosData = await getCursos({ docente_id: user.id });
          setCursos(cursosData);
          
          const proyectosData = await getProyectosDocentes({ docente_id: user.id });
          setProyectos(proyectosData);
        } else if (user.rol === 'JEFE_DEPARTAMENTO' || user.rol === 'DIRECTOR_PROGRAMA' || user.rol === 'COORDINADOR_PROGRAMA') {
          const proyectosData = await getProyectosDocentes({ estado: 'EN_REVISION_JEFE' });
          setProyectos(proyectosData);
        } else if (user.rol === 'COMITE_CURRICULAR') {
          const proyectosData = await getProyectosDocentes({ estado: 'EN_REVISION_COMITE' });
          setProyectos(proyectosData);
        } else if (user.rol === 'DECANO') {
          const proyectosData = await getProyectosDocentes({ estado: 'EN_APROBACION_DECANO' });
          setProyectos(proyectosData);
        } else if (user.rol === 'ESTUDIANTE') {
          const proyectosData = await getProyectosDocentes({ estado: 'APROBADO' });
          setProyectos(proyectosData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setProyectos([]);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const getEstadoBadge = (estado) => {
    const badges = {
      'BORRADOR': 'bg-gray-100 text-gray-800',
      'EN_REVISION_JEFE': 'bg-yellow-100 text-yellow-800',
      'EN_REVISION_COMITE': 'bg-yellow-100 text-yellow-800',
      'EN_APROBACION_DECANO': 'bg-yellow-100 text-yellow-800',
      'DEVUELTO_DOCENTE': 'bg-red-100 text-red-800',
      'APROBADO': 'bg-green-100 text-green-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const getRolLabel = (rol) => {
    const labels = {
      'DOCENTE': 'Docente',
      'JEFE_DEPARTAMENTO': 'Jefe de Departamento',
      'DIRECTOR_PROGRAMA': 'Director de Programa',
      'COORDINADOR_PROGRAMA': 'Coordinador de Programa',
      'COMITE_CURRICULAR': 'Comité Curricular',
      'DECANO': 'Decano',
      'ESTUDIANTE': 'Estudiante',
      'ADMIN': 'Administrador',
    };
    return labels[rol] || rol;
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido, {user?.nombre}</h1>
        <p className="text-gray-600">{getRolLabel(user?.rol)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{proyectos?.length || 0}</p>
              <p className="text-gray-600">Proyectos</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{proyectos?.filter(p => p.estado?.includes('REVISION')).length || 0}</p>
              <p className="text-gray-600">En Revisión</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{proyectos?.filter(p => p.estado === 'APROBADO').length || 0}</p>
              <p className="text-gray-600">Aprobados</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{proyectos?.filter(p => p.estado === 'DEVUELTO_DOCENTE').length || 0}</p>
              <p className="text-gray-600">Devueltos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Proyectos Recientes</h2>
        </div>
        <div className="p-6">
          {!proyectos || proyectos.length === 0 ? (
            <p className="text-gray-500">No hay proyectos para mostrar</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Curso</th>
                    <th className="text-left p-3">Versión</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-left p-3">Última Modificación</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.slice(0, 5).map((proyecto) => (
                    <tr key={proyecto.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{proyecto.curso?.nombre}</td>
                      <td className="p-3">{proyecto.version}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(proyecto.estado)}`}>
                          {proyecto.estado.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">{new Date(proyecto.ultima_modificacion).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
