import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/client';
import Header from '../../components/layout/Header';
import { User, Mail, Save, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage('');
    try {
      await authApi.updateProfile({ name });
      await refreshProfile();
      setMessage('Profile updated successfully.');
    } catch (e: any) {
      setMessage(e.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="My Profile" />
      <div className="p-6 max-w-2xl mx-auto space-y-6 mt-4">
        
        {/* Profile Card */}
        <div className="glass-card p-8 text-center animate-slideUp">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white">{name || user?.name}</h2>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5" />
            {user?.role}
          </div>
        </div>

        {/* Settings Form */}
        <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-white mb-6">Account Settings</h3>
          
          {message && (
            <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
              message.includes('success') 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-white focus:border-primary-500 transition-colors" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input 
                  value={user?.email || ''} 
                  disabled 
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-900/50 border border-surface-800 rounded-xl text-surface-500 cursor-not-allowed" 
                />
              </div>
              <p className="mt-2 text-xs text-surface-500">Email address cannot be changed.</p>
            </div>

            <div className="pt-4 border-t border-surface-800">
              <button 
                onClick={handleSave} 
                disabled={loading || name === user?.name} 
                className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> 
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
