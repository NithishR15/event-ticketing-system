import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiCalendar, FiUsers, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getMyEvents();
        setEvents(data.events);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async function (id) {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter(function (e) { return e._id !== id; }));
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.isApprovedOrganizer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Account Pending Approval
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Your organizer account is awaiting admin approval. You'll be able to create events once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Organizer Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your events and check-ins.</p>
        </div>
        <Link
          to="/organizer/create-event"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-lg transition"
        >
          <FiPlus className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-3xl font-bold text-primary-600">{events.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Events</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-3xl font-bold text-green-600">
            {events.filter(function (e) { return e.status === 'approved'; }).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Approved</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-3xl font-bold text-yellow-600">
            {events.filter(function (e) { return e.status === 'pending'; }).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Pending Approval</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
          <Link to="/organizer/create-event" className="text-primary-600 font-medium hover:underline">
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(function (event) {
            return (
              <div
                key={event._id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers className="w-4 h-4" />
                      {event.availableSeats} / {event.maxParticipants} seats
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/organizer/events/${event._id}/scan`}
                    className="text-sm font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-lg"
                  >
                    Scan QR
                  </Link>
                  <Link
                    to={`/organizer/events/${event._id}/registrations`}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg"
                  >
                    Registrations
                  </Link>
                  <button
                    onClick={function () { handleDelete(event._id); }}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
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
};

export default OrganizerDashboard;