import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getPendingOrganizers: async () => {
    const res = await api.get('/admin/pending-organizers');
    return res.data;
  },

  getPendingEvents: async () => {
    const res = await api.get('/admin/pending-events');
    return res.data;
  },

  getAllBookings: async (params = {}) => {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  approveOrganizer: async (userId) => {
    const res = await api.put(`/users/${userId}/approve-organizer`);
    return res.data;
  },

  setUserStatus: async (userId, isActive) => {
    const res = await api.put(`/users/${userId}/status`, { isActive });
    return res.data;
  },

  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  setEventApproval: async (eventId, status) => {
    const res = await api.put(`/events/${eventId}/approval`, { status });
    return res.data;
  },
};