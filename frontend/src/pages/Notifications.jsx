import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { notificationService } from '../services/notificationService';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadNotifications() {
    notificationService
      .getMyNotifications()
      .then(function (data) {
        setNotifications(data.notifications);
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    loadNotifications();
  }, []);

  function handleMarkRead(id) {
    notificationService.markAsRead(id).then(function () {
      loadNotifications();
    });
  }

  function handleMarkAllRead() {
    notificationService.markAllAsRead().then(function () {
      loadNotifications();
    });
  }

  function handleDelete(id) {
    notificationService.deleteNotification(id).then(function () {
      loadNotifications();
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        {notifications.length > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm font-medium text-primary-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <FiBell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(function (n) {
            return (
              <div
                key={n._id}
                className={
                  'bg-white dark:bg-gray-900 rounded-xl border p-4 flex items-start justify-between gap-3 ' +
                  (n.isRead ? 'border-gray-100 dark:border-gray-800' : 'border-primary-200 bg-primary-50/30 dark:bg-primary-900/10')
                }
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(n.createdAt), 'MMM dd, yyyy · h:mm a')}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!n.isRead && (
                    <button
                      onClick={function () { handleMarkRead(n._id); }}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="Mark as read"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={function () { handleDelete(n._id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;