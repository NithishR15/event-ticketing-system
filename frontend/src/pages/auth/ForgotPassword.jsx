import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiMail, FiCalendar } from 'react-icons/fi';
import { authService } from '../../services/authService';

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const formHook = useForm();
  const register = formHook.register;
  const handleSubmit = formHook.handleSubmit;

  function onSubmit(data) {
    setLoading(true);
    authService
      .forgotPassword(data.email)
      .then(function (res) {
        setSent(true);
        if (res.resetToken) {
          setDevToken(res.resetToken);
        }
        toast.success('Reset instructions sent');
      })
      .catch(function (err) {
        toast.error((err.response && err.response.data && err.response.data.message) || 'Request failed');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive reset instructions</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          {sent ? (
            <div className="text-center">
              <p className="text-green-600 font-medium mb-2">Check your email!</p>
              <p className="text-sm text-gray-500 mb-4">
                If an account exists with that email, reset instructions have been sent.
              </p>
              {devToken && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left mb-4">
                  <p className="text-xs text-yellow-800 font-medium mb-1">Development mode - reset token:</p>
                  <p className="text-xs font-mono text-yellow-900 break-all">{devToken}</p>
                  <Link to={'/reset-password/' + devToken} className="text-xs text-primary-600 hover:underline mt-2 inline-block">
                    Click here to reset now →
                  </Link>
                </div>
              )}
              <Link to="/login" className="text-primary-600 font-medium hover:underline text-sm">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="email" {...register('email', { required: true })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="you@example.com" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;