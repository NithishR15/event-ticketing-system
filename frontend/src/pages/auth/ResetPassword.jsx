import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiLock, FiCalendar } from 'react-icons/fi';
import { authService } from '../../services/authService';

function ResetPassword() {
  const params = useParams();
  const resetToken = params.resetToken;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const formHook = useForm();
  const register = formHook.register;
  const handleSubmit = formHook.handleSubmit;
  const watch = formHook.watch;
  const errors = formHook.formState.errors;
  const password = watch('password');

  function onSubmit(data) {
    setLoading(true);
    authService
      .resetPassword(resetToken, data.password)
      .then(function () {
        toast.success('Password reset successfully. Please log in.');
        navigate('/login');
      })
      .catch(function (err) {
        toast.error((err.response && err.response.data && err.response.data.message) || 'Reset failed');
      })
      .finally(function () {
        setLoading(false);
      });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4">
            <FiCalendar className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set new password</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="password" {...register('password', { required: true, minLength: 6 })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="••••••••" />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">Minimum 6 characters required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="password" {...register('confirmPassword', {
                required: true,
                validate: function (value) { return value === password || 'Passwords do not match'; },
              })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="••••••••" />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;