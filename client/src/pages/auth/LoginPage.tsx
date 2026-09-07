import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({ email: form.email, password: form.password, name: form.name, phone: form.phone || undefined });
      } else {
        await login(form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-surface-950 via-primary-900/20 to-surface-950">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139,92,246,0.1) 0%, transparent 40%)',
        }} />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ComplaintOS</h1>
              <p className="text-xs text-primary-400 uppercase tracking-widest">AI-Powered</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Intelligent Complaint<br />
            <span className="gradient-text">Management System</span>
          </h2>
          <p className="text-surface-400 text-lg leading-relaxed max-w-md">
            AI-powered classification, smart routing, SLA tracking, and real-time analytics — all in one platform.
          </p>
          <div className="mt-12 space-y-4">
            {[
              'Automatic AI categorization & priority detection',
              'Smart department routing & assignment',
              'Real-time SLA tracking with alerts',
              'Comprehensive analytics dashboard',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-surface-300">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-950">
        <div className="w-full max-w-md animate-slideUp">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ComplaintOS</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-surface-400 mb-8">
            {isRegister ? 'Register to start submitting complaints' : 'Sign in to your account'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-scaleIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    type="tel"
                    placeholder="+91-9876543210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl hover:from-primary-500 hover:to-primary-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isRegister ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-primary-400 hover:text-primary-300 font-medium">
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </p>


        </div>
      </div>
    </div>
  );
}
