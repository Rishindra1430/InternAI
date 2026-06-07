import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { setUser, setAccessToken } from '../store/slices/authSlice';
import { authApi } from '../api';
import { validateEmail } from '../utils';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi2';

const getErrorMessage = (err: unknown, fallback: string) => {
  const apiError = err as { response?: { data?: { message?: string } }; message?: string };
  return apiError.response?.data?.message || apiError.message || fallback;
};

type PasswordStrength = 'weak' | 'fair' | 'strong';

const getPasswordStrength = (password: string): { level: PasswordStrength; percent: number; color: string; label: string } => {
  if (password.length === 0) {
    return { level: 'weak', percent: 0, color: 'bg-gray-200', label: '' };
  }
  if (password.length < 6) {
    return { level: 'weak', percent: 25, color: 'bg-red-500', label: 'Weak' };
  }
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (password.length >= 8 && hasMixedCase && hasNumber) {
    return { level: 'strong', percent: 100, color: 'bg-green-500', label: 'Strong' };
  }
  return { level: 'fair', percent: 60, color: 'bg-yellow-500', label: 'Fair' };
};

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      dispatch(setAccessToken(response.data.data.accessToken));
      dispatch(setUser(response.data.data.user));
      navigate('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed'));
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
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-gray-500">Start tracking your career journey with InternAI</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                className="input pl-10"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                className="input pl-10"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                className="input pl-10"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {/* Password Strength Indicator */}
            {formData.password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Password strength</span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.level === 'weak'
                        ? 'text-red-600'
                        : passwordStrength.level === 'fair'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                className="input pl-10"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
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
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
