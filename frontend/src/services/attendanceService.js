import api from './api';

export const attendanceService = {
  scanTicket: async (qrData) => {
    const res = await api.post('/scan', { qrData });
    return res.data;
  },

  getEventAttendance: async (eventId) => {
    const res = await api.get(`/attendance/${eventId}`);
    return res.data;
  },

  exportAttendanceCSV: (eventId) => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.open(`${baseUrl}/attendance/${eventId}/export?token=${token}`, '_blank');
  },
};