import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (nombre, apellido, email, password, rol, programaId, facultadId) => {
  const response = await api.post('/auth/register', { 
    nombre, 
    apellido, 
    email, 
    password, 
    rol,
    programa_id: programaId,
    facultad_id: facultadId
  });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
