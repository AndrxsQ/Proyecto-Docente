import api from './api';

export const getAsignaturas = async (filters = {}) => {
  const response = await api.get('/asignaturas', { params: filters });
  return response.data;
};

export const getAsignatura = async (id) => {
  const response = await api.get(`/asignaturas/${id}`);
  return response.data;
};

export const createAsignatura = async (data) => {
  const response = await api.post('/asignaturas', data);
  return response.data;
};

export const updateAsignatura = async (id, data) => {
  const response = await api.put(`/asignaturas/${id}`, data);
  return response.data;
};
