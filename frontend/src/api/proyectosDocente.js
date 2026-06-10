import api from './api';

export const getProyectosDocentes = async (filters = {}) => {
  const response = await api.get('/proyectos-docentes', { params: filters });
  return response.data;
};

export const getProyectoDocente = async (id) => {
  const response = await api.get(`/proyectos-docentes/${id}`);
  return response.data;
};

export const createProyectoDocente = async (data) => {
  const response = await api.post('/proyectos-docentes', data);
  return response.data;
};

export const enviarProyectoDocente = async (id) => {
  const response = await api.post(`/proyectos-docentes/${id}/enviar`);
  return response.data;
};

export const aprobarProyectoDocente = async (id, observacion) => {
  const response = await api.post(`/proyectos-docentes/${id}/aprobar`, { observacion });
  return response.data;
};

export const denegarProyectoDocente = async (id, observacion) => {
  const response = await api.post(`/proyectos-docentes/${id}/denegar`, { observacion });
  return response.data;
};

export const devolverProyectoDocente = async (id, observacion) => {
  const response = await api.post(`/proyectos-docentes/${id}/devolver`, { observacion });
  return response.data;
};

export const getFormato = async (proyectoDocenteId) => {
  const response = await api.get(`/proyectos-docentes/${proyectoDocenteId}/formato`, {
    params: { proyecto_docente_id: proyectoDocenteId }
  });
  return response.data;
};

export const saveFormato = async (proyectoDocenteId, data) => {
  const response = await api.post(`/proyectos-docentes/${proyectoDocenteId}/formato`, {
    ...data,
    proyecto_docente_id: proyectoDocenteId
  });
  return response.data;
};

export const getContenido = async (proyectoDocenteId) => {
  const response = await api.get(`/proyectos-docentes/${proyectoDocenteId}/contenido`, {
    params: { proyecto_docente_id: proyectoDocenteId }
  });
  return response.data;
};

export const createContenido = async (proyectoDocenteId, data) => {
  const response = await api.post(`/proyectos-docentes/${proyectoDocenteId}/contenido`, {
    ...data,
    proyecto_docente_id: proyectoDocenteId
  });
  return response.data;
};

export const updateContenido = async (proyectoDocenteId, semanaId, data) => {
  const response = await api.put(`/proyectos-docentes/${proyectoDocenteId}/contenido/${semanaId}`, data);
  return response.data;
};

export const deleteContenido = async (proyectoDocenteId, semanaId) => {
  const response = await api.delete(`/proyectos-docentes/${proyectoDocenteId}/contenido/${semanaId}`);
  return response.data;
};

export const getBibliografia = async (proyectoDocenteId) => {
  const response = await api.get(`/proyectos-docentes/${proyectoDocenteId}/bibliografia`, {
    params: { proyecto_docente_id: proyectoDocenteId }
  });
  return response.data;
};

export const createBibliografia = async (proyectoDocenteId, data) => {
  const response = await api.post(`/proyectos-docentes/${proyectoDocenteId}/bibliografia`, {
    ...data,
    proyecto_docente_id: proyectoDocenteId
  });
  return response.data;
};

export const updateBibliografia = async (proyectoDocenteId, bibId, data) => {
  const response = await api.put(`/proyectos-docentes/${proyectoDocenteId}/bibliografia/${bibId}`, data);
  return response.data;
};

export const deleteBibliografia = async (proyectoDocenteId, bibId) => {
  const response = await api.delete(`/proyectos-docentes/${proyectoDocenteId}/bibliografia/${bibId}`, {
    params: { id: bibId }
  });
  return response.data;
};

export const getSeguimiento = async (proyectoDocenteId) => {
  const response = await api.get(`/proyectos-docentes/${proyectoDocenteId}/seguimiento`, {
    params: { proyecto_docente_id: proyectoDocenteId }
  });
  return response.data;
};

export const createSeguimiento = async (proyectoDocenteId, data) => {
  const response = await api.post(`/proyectos-docentes/${proyectoDocenteId}/seguimiento`, data);
  return response.data;
};

export const updateSeguimiento = async (proyectoDocenteId, segId, data) => {
  const response = await api.put(`/proyectos-docentes/${proyectoDocenteId}/seguimiento/${segId}`, data);
  return response.data;
};
