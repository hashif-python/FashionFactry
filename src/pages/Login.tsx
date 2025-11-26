import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toE164 } from '../lib/phone';

const COUNTRY_CODES = [
  { code: '91', name: 'India (+91)' },
  { code: '1', name: 'USA (+1)' },
  { code: '971', name: 'UAE (+971)' },
  { code: '44', name: 'UK (+44)' },
  { code: '61', name: 'Australia (+61)' },
  { code: '65', name: 'Singapore (+65)' },
];

export const Login = ({ onNavigate, onLoginSuccess }) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [countryCode, setCountryCode] = useState('91');
  const [localPhone, setLocalPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fullNumber = toE164(countryCode, localPhone); // +919xx...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullNumber || fullNumber.length < 7) {
      setError('Enter a valid phone number');
      setLoading(false);
      return;
    }

    const { error: loginError } = await signIn(fullNumber, password);

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      onLoginSuccess?.();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white/10 p-8 rounded-lg backdrop-blur">

        <h2 className="text-3xl font-bold text-white mb-4">Login</h2>

        {error && (
          <p className="p-3 bg-red-300 text-red-900 rounded-md">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Country code + number */}
          <div>
            <label className="text-white text-sm mb-1 block">Mobile Number</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-40 p-2 rounded-md bg-white text-black"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>

              <input
                type="tel"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="flex-1 p-2 rounded-md bg-white text-black"
              />
            </div>

            <p className="text-white/70 text-xs mt-1">
              Login as: <span className="font-semibold">{fullNumber}</span>
            </p>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-white text-sm mb-1 block">Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 rounded-md bg-white text-black"
            />

            <button
              type="button"
              className="absolute right-2 top-9 text-xs text-black"
              onClick={() => setShowPwd((s) => !s)}
            >
              {showPwd ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8A962] text-white py-3 rounded-lg mt-3"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-white mt-6 text-center">
          Don’t have an account?{' '}
          <button className="text-[#C8A962]" onClick={() => onNavigate('signup')}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};
