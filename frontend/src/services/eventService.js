import api from './api';

export const eventService = {
  getEvents: async (params = {}) => {
    const res = await api.get('/events', { params });
    return res.data;
  },

  getEventById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  getMyEvents: async () => {
    const res = await api.get('/events/organizer/mine');
    return res.data;
  },

  createEvent: async (formData) => {
    const res = await api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateEvent: async (id, formData) => {
    const res = await api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },

  setEventApproval: async (id, status) => {
    const res = await api.put(`/events/${id}/approval`, { status });
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
};