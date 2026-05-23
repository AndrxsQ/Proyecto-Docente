import api from './api';

export const getCursos = async (filters = {}) => {
  const response = await api.get('/cursos', { params: filters });
  return response.data;
};

export const getCurso = async (id) => {
  const response = await api.get(`/cursos/${id}`);
  return response.data;
};

export const createCurso = async (data) => {
  const response = await api.post('/cursos', data);
  return response.data;
};

export const updateCurso = async (id, data) => {
  const response = await api.put(`/cursos/${id}`, data);
  return response.data;
};
