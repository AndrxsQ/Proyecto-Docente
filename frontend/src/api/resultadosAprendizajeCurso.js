import api from './api';

export const getResultadosAprendizajeCurso = async (proyectoDocenteId) => {
  const response = await api.get('/resultados-aprendizaje-curso', { params: { proyecto_docente_id: proyectoDocenteId } });
  return response.data;
};

export const createResultadoAprendizajeCurso = async (resultado) => {
  const response = await api.post('/resultados-aprendizaje-curso', resultado);
  return response.data;
};

export const updateResultadoAprendizajeCurso = async (resultado) => {
  const response = await api.put('/resultados-aprendizaje-curso', resultado);
  return response.data;
};

export const deleteResultadoAprendizajeCurso = async (id) => {
  await api.delete('/resultados-aprendizaje-curso', { params: { id } });
};
