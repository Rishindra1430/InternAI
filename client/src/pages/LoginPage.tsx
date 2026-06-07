import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { setUser, setAccessToken } from '../store/slices/authSlice';
import { authApi } from '../api';
import { validateEmail } from '../utils';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';

const getErrorMessage = (err: unknown, fallback: string) => {
  const apiError = err as { response?: { data?: { message?: string } }; message?: string };
  return apiError.response?.data?.message || apiError.message || fallback;
};

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      dispatch(setAccessToken(response.data.data.accessToken));
      dispatch(setUser(response.data.data.user));
      navigate('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Subtle gradient background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="card w-full max-w-md relative">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <span className="text-2xl font-bold text-white">iA</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to InternAI</h1>
          <p className="mt-2 text-gray-500">Sign in to track your career journey</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                className="input pl-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0">Password</label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                className="input pl-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 text-base"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
