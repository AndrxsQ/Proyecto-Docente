import api from './api';

export const getFacultades = async () => {
  const response = await api.get('/facultades');
  return response.data;
};

export const createFacultad = async (data) => {
  const response = await api.post('/facultades', data);
  return response.data;
};

export const updateFacultad = async (id, data) => {
  const response = await api.put(`/facultades/${id}`, data);
  return response.data;
};

export const deleteFacultad = async (id) => {
  const response = await api.delete(`/facultades/${id}`);
  return response.data;
};
