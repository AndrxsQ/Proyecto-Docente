import { useAuth } from '../context/AuthContext';
import { getProyectosDocentes } from '../api/proyectosDocente';
import { getAsignaturas } from '../api/asignaturas';
import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.rol === 'DOCENTE') {
          const asignaturasData = await getAsignaturas({ docente_id: user.id });
          setAsignaturas(asignaturasData);
          
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
        setAsignaturas([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const getEstadoBadge = (estado) => {
    const badges = {
      'ELABORADO': 'bg-[#F0F0F0] text-[#666666]',
      'EN_REVISION': 'bg-[#FEF3C7] text-[#92600A]',
      'REVISADO': 'bg-[#FEF3C7] text-[#92600A]',
      'AVALADO': 'bg-[#DBEAFE] text-[#1E40AF]',
      'APROBADO': 'bg-[#D1FAE5] text-[#065F46]',
    };
    return badges[estado] || 'bg-[#F0F0F0] text-[#666666]';
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

  if (loading) return <div className="p-8 text-[#4A4A4A]">Cargando...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Bienvenido, <span className="text-[#F5A623]">{user?.nombre}</span></h1>
        <p className="text-[#4A4A4A]">{getRolLabel(user?.rol)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-[#F5A623] mr-3" />
            <div>
              <p className="text-2xl font-bold text-[#1E1E1E]">{proyectos?.length || 0}</p>
              <p className="text-[#4A4A4A]">Proyectos</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-[#F5A623] mr-3" />
            <div>
              <p className="text-2xl font-bold text-[#1E1E1E]">{proyectos?.filter(p => p.estado?.includes('REVISION')).length || 0}</p>
              <p className="text-[#4A4A4A]">En Revisión</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-[#38A169] mr-3" />
            <div>
              <p className="text-2xl font-bold text-[#1E1E1E]">{proyectos?.filter(p => p.estado === 'APROBADO').length || 0}</p>
              <p className="text-[#4A4A4A]">Aprobados</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-[#E53E3E] mr-3" />
            <div>
              <p className="text-2xl font-bold text-[#1E1E1E]">{proyectos?.filter(p => p.estado === 'ELABORADO').length || 0}</p>
              <p className="text-[#4A4A4A]">En Elaboración</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F0F0F0]">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">Proyectos Recientes</h2>
        </div>
        <div className="p-6">
          {!proyectos || proyectos.length === 0 ? (
            <p className="text-[#4A4A4A]">No hay proyectos para mostrar</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1E1E1E]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Asignatura</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Versión</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Última Modificación</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.slice(0, 5).map((proyecto, index) => (
                    <tr key={proyecto.id} className={`border-b border-[#F0F0F0] hover:bg-[#FFF8EC] ` + (index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]')}>
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.asignatura?.nombre}</td>
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">{proyecto.version}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ` + getEstadoBadge(proyecto.estado)}>
                          {proyecto.estado.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#4A4A4A]">{new Date(proyecto.ultima_modificacion).toLocaleDateString()}</td>
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
