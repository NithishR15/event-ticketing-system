import api from './api';

export const bookingService = {
  createBooking: async (eventId) => {
    const res = await api.post('/bookings', { eventId });
    return res.data;
  },

  getMyBookings: async () => {
    const res = await api.get('/bookings');
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  cancelBooking: async (id) => {
    const res = await api.delete(`/bookings/${id}`);
    return res.data;
  },

  getEventBookings: async (eventId) => {
    const res = await api.get(`/bookings/event/${eventId}`);
    return res.data;
  },
};