import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMenu, FiX, FiUser, FiLogOut, FiBell, FiCalendar, FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getSocket } from '../services/socket';
import { notificationService } from '../services/notificationService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const themeContext = useTheme();
  const mode = themeContext.mode;
  const cycleTheme = themeContext.cycleTheme;

  const themeIcon =
    mode === 'light' ? <FiSun className="w-5 h-5" /> :
    mode === 'dark' ? <FiMoon className="w-5 h-5" /> :
    <FiMonitor className="w-5 h-5" />;

  const themeLabel =
    mode === 'light' ? 'Light Mode' :
    mode === 'dark' ? 'Dark Mode' :
    'System Default';

  useEffect(function () {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    notificationService.getMyNotifications().then(function (data) {
      setUnreadCount(data.unreadCount);
    }).catch(function () {});

    const socket = getSocket();
    if (!socket) return;

    function handleNewNotification(notification) {
      setUnreadCount(function (prev) { return prev + 1; });
      toast(notification.title, {
        icon: '🔔',
        duration: 4000,
      });
    }

    function handleReadEvent() {
      setUnreadCount(0);
    }

    socket.on('notification', handleNewNotification);
    window.addEventListener('notifications-read', handleReadEvent);

    return function cleanup() {
      socket.off('notification', handleNewNotification);
      window.removeEventListener('notifications-read', handleReadEvent);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink =
    user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'organizer' ? '/organizer/dashboard' : '/student/dashboard';

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <FiCalendar className="w-6 h-6" />
            <span>EventTix</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 font-medium">
              Browse Events
            </Link>

            <button
              onClick={cycleTheme}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              title={themeLabel + ' — click to change'}
            >
              {themeIcon}
            </button>

            {user ? (
              <>
                <Link to={dashboardLink} className="text-gray-700 dark:text-gray-200 hover:text-primary-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/notifications" className="relative text-gray-700 dark:text-gray-200 hover:text-primary-600">
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-primary-600">
                    <FiUser className="w-5 h-5" />
                    <span className="font-medium">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium">
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-700 dark:text-gray-200" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-3 space-y-2">
          <button
            onClick={cycleTheme}
            className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-200 w-full text-left"
          >
            {themeIcon}
            {themeLabel}
          </button>

          <Link to="/events" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">
            Browse Events
          </Link>
          {user ? (
            <>
              <Link to={dashboardLink} onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">
                Dashboard
              </Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">
                Profile
              </Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 text-primary-600 font-medium">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;