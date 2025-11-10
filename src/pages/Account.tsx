import { useState, useEffect } from 'react';
import { User, Phone, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, UserProfile } from '../lib/supabase';

interface AccountProps {
  onNavigate: (page: string) => void;
}

export const Account = ({ onNavigate }: AccountProps) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <p className="text-xl text-white/80 mb-4">Please login to view your account</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-2 bg-[#C8A962] text-white rounded-lg hover:bg-[#C8A962] transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white/80">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-white/80">Full Name</p>
                  <p className="font-semibold text-white">{profile?.full_name || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-white/80">Email</p>
                  <p className="font-semibold text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-white/80">Phone</p>
                  <p className="font-semibold text-white">{profile?.phone || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('orders')}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-[#C8A962] hover:bg-transparent transition-colors"
              >
                <p className="font-semibold text-white">My Orders</p>
                <p className="text-sm text-white/80">View your order history</p>
              </button>
              <button
                onClick={() => onNavigate('cart')}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:border-[#C8A962] hover:bg-transparent transition-colors"
              >
                <p className="font-semibold text-white">Shopping Cart</p>
                <p className="text-sm text-white/80">View items in your cart</p>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <p className="font-semibold">Logout</p>
                <p className="text-sm">Sign out of your account</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
