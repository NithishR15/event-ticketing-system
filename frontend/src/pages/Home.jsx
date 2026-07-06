import { Link } from 'react-router-dom';
import { FiCalendar, FiGrid, FiUsers } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-white dark:from-gray-950 dark:to-gray-900 min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
          Discover. Book. Attend.
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto animate-fade-in-up stagger-1">
          Find college events, conferences, workshops, and hackathons. Book your free ticket instantly and get a QR code for seamless entry.
        </p>
        <Link to="/events" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium px-8 py-3 rounded-lg transition-all hover:scale-105 animate-fade-in-up stagger-2">
          Browse Events
        </Link>

        <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all animate-fade-in-up stagger-3">
            <FiCalendar className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Discover Events</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Browse hackathons, workshops, and conferences happening near you.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all animate-fade-in-up stagger-4">
            <FiGrid className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Instant QR Tickets</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Book free tickets and get a unique QR code for quick, contactless entry.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all animate-fade-in-up stagger-5">
            <FiUsers className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">For Organizers</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage registrations, scan tickets, and track attendance in real time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;