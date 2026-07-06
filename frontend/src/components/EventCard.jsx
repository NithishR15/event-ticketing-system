import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';

const EventCard = ({ event }) => {
  const imageUrl = event.banner
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${event.banner}`
    : null;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all animate-scale-in"
    >
      <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <FiCalendar className="w-12 h-12 text-primary-400" />
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-full">
            {event.category?.name || 'General'}
          </span>
          {event.avgRating > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <FiStar className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {event.avgRating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 flex-shrink-0" />
            <span>{format(new Date(event.date), 'MMM dd, yyyy')} · {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiUsers className="w-4 h-4 flex-shrink-0" />
            <span>{event.availableSeats} seats left</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;