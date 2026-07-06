import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiGlobe,
  FiLock,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTag,
  FiActivity,
  FiDownload,
  FiEdit3,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { authService } from '../services/authService';
import { bookingService } from '../services/bookingService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const auth = useAuth();
  const user = auth.user;
  const updateUserInContext = auth.updateUserInContext;

  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
  const [activity, setActivity] = useState([]);
  const [prefs, setPrefs] = useState(
    user.notificationPreferences || { email: true, sms: false, reminder: true }
  );
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const formHook = useForm({
    defaultValues: {
      name: user.name,
      phone: user.phone || '',
      dob: user.dob ? user.dob.substring(0, 10) : '',
      gender: user.gender || '',
      city: user.city || '',
      country: user.country || '',
    },
  });
  const register = formHook.register;
  const handleSubmit = formHook.handleSubmit;

  const passwordForm = useForm();

  useEffect(function () {
    bookingService.getMyBookings().then(function (data) {
      const bookings = data.bookings;
      const now = new Date();
      const upcoming = bookings.filter(function (b) {
        return b.status !== 'cancelled' && b.event && new Date(b.event.date) >= now;
      }).length;
      const completed = bookings.filter(function (b) {
        return b.status === 'checked-in' || (b.status !== 'cancelled' && b.event && new Date(b.event.date) < now);
      }).length;
      const cancelled = bookings.filter(function (b) {
        return b.status === 'cancelled';
      }).length;
      setStats({ total: bookings.length, upcoming, completed, cancelled });
    }).catch(function () {});

    notificationService.getMyNotifications().then(function (data) {
      setActivity(data.notifications.slice(0, 5));
    }).catch(function () {});
  }, []);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onSubmit(data) {
    setSaving(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('dob', data.dob);
    formData.append('gender', data.gender);
    formData.append('city', data.city);
    formData.append('country', data.country);
    formData.append('notificationPreferences', JSON.stringify(prefs));
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    authService.updateProfile(formData).then(function (res) {
      updateUserInContext(res.user);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile updated successfully');
    }).catch(function (err) {
      toast.error((err.response && err.response.data && err.response.data.message) || 'Update failed');
    }).finally(function () {
      setSaving(false);
    });
  }

  function onChangePassword(data) {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    authService.changePassword(data.currentPassword, data.newPassword).then(function () {
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      passwordForm.reset();
    }).catch(function (err) {
      toast.error((err.response && err.response.data && err.response.data.message) || 'Failed to change password');
    }).finally(function () {
      setChangingPassword(false);
    });
  }

  function togglePref(key) {
    setPrefs(function (prev) {
      const next = Object.assign({}, prev);
      next[key] = !prev[key];
      return next;
    });
  }

  const memberSince = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '—';
  const userIdShort = user.id ? user.id.slice(-8).toUpperCase() : '—';
  const avatarUrl = user.avatar
    ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '') + user.avatar
    : null;

  const activityIcon = {
    booking: FiCheckCircle,
    'event-update': FiTag,
    reminder: FiClock,
    system: FiActivity,
    'organizer-approval': FiCheckCircle,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      {/* Header card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <label className="relative w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl flex-shrink-0 overflow-hidden cursor-pointer group">
          {avatarPreview ? (
            <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <FiEdit3 className="w-5 h-5 text-white" />
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
          <p className="text-sm text-gray-500 capitalize mb-2">{user.role}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            <span>Member since: <span className="font-medium text-gray-700 dark:text-gray-300">{memberSince}</span></span>
            <span>User ID: <span className="font-mono font-medium text-gray-700 dark:text-gray-300">EVT-{userIdShort}</span></span>
          </div>
          {avatarPreview && (
            <p className="text-xs text-primary-600 mt-1">New photo selected — click Save Changes below to apply</p>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiEdit3 className="w-4 h-4 text-primary-600" />
          Personal Information
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input {...register('name', { required: true })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input value={user.email} disabled
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-lg outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input {...register('phone')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date of Birth</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="date" {...register('dob')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
            <select {...register('gender')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input {...register('city')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Chennai" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
            <div className="relative">
              <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input {...register('country')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="India" />
            </div>
          </div>
        </div>

        {/* Booking Statistics */}
        <h3 className="font-semibold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
          <FiCheckCircle className="w-4 h-4 text-primary-600" />
          Booking Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Tickets Booked</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
            <p className="text-xs text-gray-500 mt-1">Upcoming</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-gray-500 mt-1">Cancelled</p>
          </div>
        </div>

        {/* Notification Settings */}
        <h3 className="font-semibold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
          <FiActivity className="w-4 h-4 text-primary-600" />
          Notification Settings
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={prefs.email} onChange={function () { togglePref('email'); }}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={prefs.sms} onChange={function () { togglePref('sms'); }}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">SMS notifications</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={prefs.reminder} onChange={function () { togglePref('reminder'); }}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Event reminders</span>
          </label>
        </div>

        <button type="submit" disabled={saving}
          className="w-full mt-8 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Security */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiLock className="w-4 h-4 text-primary-600" />
          Security
        </h3>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Password</span>
          <button onClick={function () { setShowPasswordForm(!showPasswordForm); }}
            className="text-sm font-medium text-primary-600 hover:underline">
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <input type="password" placeholder="Current password"
              {...passwordForm.register('currentPassword', { required: true })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            <input type="password" placeholder="New password"
              {...passwordForm.register('newPassword', { required: true, minLength: 6 })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            <input type="password" placeholder="Confirm new password"
              {...passwordForm.register('confirmPassword', { required: true })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            <button type="submit" disabled={changingPassword}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-60">
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="flex items-center justify-between py-2 mt-2 border-t border-gray-100 dark:border-gray-800 pt-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Two-Factor Authentication</span>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">Not enabled</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
          <span className="text-sm text-gray-500">
            {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy · h:mm a') : 'This session'}
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiActivity className="w-4 h-4 text-primary-600" />
          Recent Activity
        </h3>

        {activity.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity yet.</p>
        ) : (
          <div className="space-y-3">
            {activity.map(function (item) {
              const Icon = activityIcon[item.type] || FiActivity;
              return (
                <div key={item._id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{item.title}</p>
                    <p className="text-xs text-gray-400">{format(new Date(item.createdAt), 'MMM dd, yyyy · h:mm a')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;