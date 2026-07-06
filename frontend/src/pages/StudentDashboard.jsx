import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { bookingService } from '../services/bookingService';

const StudentDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getMyBookings();
        setBookings(data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    'checked-in': 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const upcoming = bookings.filter(
    (b) => b.status !== 'cancelled' && b.event && new Date(b.event.date) >= new Date()
  );
  const past = bookings.filter(
    (b) => b.status === 'cancelled' || (b.event && new Date(b.event.date) < new Date())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          View your booked events and QR tickets.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-3xl font-bold text-primary-600">{bookings.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Bookings</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-3xl font-bold text-green-600">{upcoming.length}</p>
          <p className="text-sm text-gray-500 mt-1">Upcoming Events</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-3xl font-bold text-blue-600">
            {bookings.filter((b) => b.status === 'checked-in').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Attended</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Upcoming Events
      </h2>

      {upcoming.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 mb-10">
          <p className="text-gray-500 mb-4">You haven't booked any events yet.</p>
          <Link to="/events" className="text-primary-600 font-medium hover:underline">
            Browse events →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {upcoming.map((booking) => (
            <Link
              key={booking._id}
              to={`/my-bookings/${booking._id}`}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {booking.event?.title}
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    statusColors[booking.status]
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  {booking.event?.date &&
                    format(new Date(booking.event.date), 'MMM dd, yyyy')}{' '}
                  · {booking.event?.time}
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  {booking.event?.venue}
                </div>
              </div>
              <p className="mt-3 font-mono text-xs text-gray-400">{booking.ticketId}</p>
            </Link>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Past / Cancelled
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {past.map((booking) => (
              <Link
                key={booking._id}
                to={`/my-bookings/${booking._id}`}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 opacity-70 hover:opacity-100 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {booking.event?.title}
                  </h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      statusColors[booking.status]
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  {booking.event?.date && format(new Date(booking.event.date), 'MMM dd, yyyy')}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;