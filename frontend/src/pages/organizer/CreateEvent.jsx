import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUpload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    eventService.getCategories().then(function (data) { setCategories(data.categories); });
  }, []);

  const onSubmit = async function (data) {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(function (key) {
        if (data[key]) formData.append(key, data[key]);
      });
      if (banner) formData.append('banner', banner);

      await eventService.createEvent(formData);
      toast.success('Event submitted for admin approval!');
      navigate('/organizer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/organizer/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm font-medium">
        <FiArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Event</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Name</label>
          <input {...register('title', { required: 'Title is required' })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="AI Hackathon 2026" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea {...register('description', { required: 'Description is required' })}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="Describe your event..." />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
          <select {...register('category', { required: 'Category is required' })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Select category</option>
            {categories.map(function (cat) {
              return <option key={cat._id} value={cat._id}>{cat.name}</option>;
            })}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Venue</label>
            <input {...register('venue', { required: 'Venue is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Main Auditorium" />
            {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Participants</label>
            <input type="number" {...register('maxParticipants', { required: 'Required', min: 1 })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="100" />
            {errors.maxParticipants && <p className="text-red-500 text-xs mt-1">{errors.maxParticipants.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Date</label>
            <input type="date" {...register('date', { required: 'Date is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Time</label>
            <input {...register('time', { required: 'Time is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="09:00 AM" />
            {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registration Deadline</label>
          <input type="date" {...register('registrationDeadline', { required: 'Deadline is required' })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          {errors.registrationDeadline && <p className="text-red-500 text-xs mt-1">{errors.registrationDeadline.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Email</label>
            <input type="email" {...register('contactEmail')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Phone</label>
            <input {...register('contactPhone')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="9876543210" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Banner Image</label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg py-6 cursor-pointer hover:border-primary-400">
            <FiUpload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">{banner ? banner.name : 'Click to upload banner image'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={function (e) { setBanner(e.target.files[0]); }} />
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;