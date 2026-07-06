import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiMail, FiPhone, FiStar, FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import { eventService } from '../services/eventService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventService.getEventById(id);
        setEvent(data.event);
      } catch (err) {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  useEffect(() => {
    const checkBooking = async () => {
      if (user?.role !== 'student') return;
      try {
        const data = await bookingService.getMyBookings();
        const existing = data.bookings.find((b) => b.event?._id === id && b.status !== 'cancelled');
        if (existing) setAlreadyBooked(true);
      } catch (err) {}
    };
    checkBooking();
  }, [id, user]);

  const handleBookTicket = async () => {
    if (!user) {
      toast.error('Please login to book a ticket');
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can book event tickets');
      return;
    }
    setBooking(true);
    try {
      const data = await bookingService.createBooking(id);
      toast.success('Ticket booked successfully!');
      navigate(`/my-bookings/${data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const imageUrl = event.banner ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${event.banner}` : null;
  const isPastDeadline = new Date() > new Date(event.registrationDeadline);
  const isFull = event.availableSeats <= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm font-medium">
        <FiArrowLeft className="w-4 h-4" />
        Back to events
      </Link>

      <div className="h-64 sm:h-80 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden mb-8">
        {imageUrl ? <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" /> : <FiCalendar className="w-16 h-16 text-primary-400" />}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span className="text-xs font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full">
              {event.category?.name || 'General'}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-3 mb-2">{event.title}</h1>
            {event.avgRating > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{event.avgRating.toFixed(1)}</span>
                <span>({event.totalReviews} reviews)</span>
              </div>
            )}
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{event.description}</p>
          </div>

          {event.rules && event.rules.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Event Rules</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {event.rules.map(function (rule, i) {
                  return <li key={i}>{rule}</li>;
                })}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Organized by</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {event.organizer?.organizationName || event.organizer?.name}
            </p>
          </div>

          {(event.contactEmail || event.contactPhone) && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {event.contactEmail && (
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4" /> {event.contactEmail}
                  </div>
                )}
                {event.contactPhone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-4 h-4" /> {event.contactPhone}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sticky top-24 space-y-4">
            <div className="flex items-start gap-3">
              <FiCalendar className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(event.date), 'EEEE, MMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-500">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FiMapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">{event.venue}</p>
            </div>

            <div className="flex items-start gap-3">
              <FiUsers className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {event.availableSeats} / {event.maxParticipants} seats available
              </p>
            </div>

            <div className="flex items-start gap-3">
              <FiClock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Registration closes {format(new Date(event.registrationDeadline), 'MMM dd, yyyy')}
              </p>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {alreadyBooked ? (
              <div className="text-center py-2">
                <p className="text-sm text-green-600 font-medium mb-2">You're registered for this event</p>
                <Link to="/student/dashboard" className="text-sm text-primary-600 hover:underline">
                  View my ticket
                </Link>
              </div>
            ) : (
              <button
                onClick={handleBookTicket}
                disabled={booking || isPastDeadline || isFull}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? 'Booking...' : isFull ? 'Fully Booked' : isPastDeadline ? 'Registration Closed' : 'Book Free Ticket'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;