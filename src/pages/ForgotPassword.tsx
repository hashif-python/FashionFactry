import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export const ForgotPassword = ({ onNavigate }: ForgotPasswordProps) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-white/80 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-[#C8A962] text-white py-3 rounded-lg hover:bg-[#C8A962] transition-colors font-semibold"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
            <p className="text-white/80">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A962]"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8A962] text-white py-3 rounded-lg hover:bg-[#C8A962] transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('login')}
              className="text-[#C8A962] hover:text-[#0B1D39] font-semibold"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
