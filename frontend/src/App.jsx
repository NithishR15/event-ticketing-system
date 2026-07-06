import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyBookingDetails from './pages/MyBookingDetails';
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import ScanQR from './pages/organizer/ScanQR';
import CreateEvent from './pages/organizer/CreateEvent';
import Registrations from './pages/organizer/Registrations';
import AdminDashboard from './pages/admin/AdminDashboard';

function ComingSoon(props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{props.title}</h2>
      <p className="text-gray-500 dark:text-gray-400">Nothing to see here.</p>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/my-bookings/:id" element={<ProtectedRoute roles={['student']}><MyBookingDetails /></ProtectedRoute>} />
              <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />

              <Route path="/organizer/dashboard" element={<ProtectedRoute roles={['organizer']}><OrganizerDashboard /></ProtectedRoute>} />
              <Route path="/organizer/create-event" element={<ProtectedRoute roles={['organizer']}><CreateEvent /></ProtectedRoute>} />
              <Route path="/organizer/events/:eventId/scan" element={<ProtectedRoute roles={['organizer']}><ScanQR /></ProtectedRoute>} />
              <Route path="/organizer/events/:eventId/registrations" element={<ProtectedRoute roles={['organizer']}><Registrations /></ProtectedRoute>} />

              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/unauthorized" element={<ComingSoon title="Unauthorized" />} />
              <Route path="*" element={<ComingSoon title="404 - Page Not Found" />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;