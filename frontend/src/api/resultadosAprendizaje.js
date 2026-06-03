import api from './api';

export const getResultadosAprendizajeByAsignatura = async (asignaturaId) => {
  const response = await api.get('/resultados-aprendizaje', { params: { asignatura_id: asignaturaId } });
  return response.data;
};

export const getResultadosAprendizajeByPrograma = async (programaId) => {
  const response = await api.get('/resultados-aprendizaje', { params: { programa_id: programaId } });
  return response.data;
};

export const createResultadoAprendizaje = async (resultado) => {
  const response = await api.post('/resultados-aprendizaje', resultado);
  return response.data;
};

export const updateResultadoAprendizaje = async (resultado) => {
  const response = await api.put('/resultados-aprendizaje', resultado);
  return response.data;
};

export const deleteResultadoAprendizaje = async (id) => {
  await api.delete('/resultados-aprendizaje', { params: { id } });
};
