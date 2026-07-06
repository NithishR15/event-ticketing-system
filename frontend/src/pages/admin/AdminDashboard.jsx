import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiUserCheck,
  FiXCircle,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { adminService } from '../../services/adminService';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadData() {
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getPendingOrganizers(),
      adminService.getPendingEvents(),
    ])
      .then(function (results) {
        setStats(results[0].stats);
        setPendingOrganizers(results[1].organizers);
        setPendingEvents(results[2].events);
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    loadData();
  }, []);

  function handleApproveOrganizer(userId) {
    adminService
      .approveOrganizer(userId)
      .then(function () {
        toast.success('Organizer approved');
        loadData();
      })
      .catch(function (err) {
        toast.error((err.response && err.response.data && err.response.data.message) || 'Failed');
      });
  }

  function handleEventApproval(eventId, status) {
    adminService
      .setEventApproval(eventId, status)
      .then(function () {
        toast.success('Event ' + status);
        loadData();
      })
      .catch(function (err) {
        toast.error((err.response && err.response.data && err.response.data.message) || 'Failed');
      });
  }

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-primary-600' },
    { label: 'Total Events', value: stats.totalEvents, icon: FiCalendar, color: 'text-green-600' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: FiCheckCircle, color: 'text-blue-600' },
    { label: 'Pending Events', value: stats.pendingEvents, icon: FiClock, color: 'text-yellow-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Manage users, approve organizers, and oversee events.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(function (card, i) {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <Icon className={'w-6 h-6 mb-2 ' + card.color} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pending organizer approvals */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Pending Organizer Approvals ({pendingOrganizers.length})
        </h2>
        {pendingOrganizers.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 text-sm">No pending organizer approvals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrganizers.map(function (org) {
              return (
                <div key={org._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{org.name}</p>
                    <p className="text-sm text-gray-500">{org.email} · {org.organizationName}</p>
                  </div>
                  <button
                    onClick={function () { handleApproveOrganizer(org._id); }}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg"
                  >
                    <FiUserCheck className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending event approvals */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Pending Event Approvals ({pendingEvents.length})
        </h2>
        {pendingEvents.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 text-sm">No pending event approvals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingEvents.map(function (event) {
              return (
                <div key={event._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      By {event.organizer.organizationName || event.organizer.name} · {format(new Date(event.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={function () { handleEventApproval(event._id, 'approved'); }}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={function () { handleEventApproval(event._id, 'rejected'); }}
                      className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg"
                    >
                      <FiXCircle className="w-4 h-4" />
                      Reject
                    </button>
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

export default AdminDashboard;