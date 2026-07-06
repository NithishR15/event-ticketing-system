import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiMail, FiPhone } from 'react-icons/fi';
import { format } from 'date-fns';
import { bookingService } from '../../services/bookingService';
import { attendanceService } from '../../services/attendanceService';

function Registrations() {
  const params = useParams();
  const eventId = params.eventId;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    bookingService
      .getEventBookings(eventId)
      .then(function (data) {
        setBookings(data.bookings);
      })
      .catch(function (err) {
        console.error(err);
      })
      .finally(function () {
        setLoading(false);
      });
  }, [eventId]);

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    'checked-in': 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/organizer/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm font-medium">
        <FiArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrations</h1>
          <p className="text-gray-500 dark:text-gray-400">{bookings.length} total registrations</p>
        </div>
        <button
          onClick={function () { attendanceService.exportAttendanceCSV(eventId); }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-lg transition"
        >
          <FiDownload className="w-4 h-4" />
          Export Attendance CSV
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500">No registrations yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Ticket ID</th>
                <th className="px-5 py-3 font-medium">Booked On</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {bookings.map(function (b) {
                return (
                  <tr key={b._id}>
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{b.user.name}</td>
                    <td className="px-5 py-4 text-gray-500">
                      <div className="flex items-center gap-1"><FiMail className="w-3.5 h-3.5" /> {b.user.email}</div>
                      {b.user.phone && <div className="flex items-center gap-1 mt-0.5"><FiPhone className="w-3.5 h-3.5" /> {b.user.phone}</div>}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{b.ticketId}</td>
                    <td className="px-5 py-4 text-gray-500">{format(new Date(b.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="px-5 py-4">
                      <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (statusColors[b.status] || '')}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Registrations;