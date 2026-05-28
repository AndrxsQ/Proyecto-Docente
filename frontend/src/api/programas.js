import api from './api';

export const getProgramas = async (filters = {}) => {
  const response = await api.get('/programas', { params: filters });
  return response.data;
};

export const getPrograma = async (id) => {
  const response = await api.get(`/programas/${id}`);
  return response.data;
};

export const createPrograma = async (data) => {
  const response = await api.post('/programas', data);
  return response.data;
};

export const updatePrograma = async (id, data) => {
  const response = await api.put(`/programas/${id}`, data);
  return response.data;
};

export const deletePrograma = async (id) => {
  const response = await api.delete(`/programas/${id}`);
  return response.data;
};
