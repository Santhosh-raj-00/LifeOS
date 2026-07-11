import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, Phone, User, ShieldCheck, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError('Either Email or Phone Number must be provided');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/register', {
        name,
        email: email.trim() || null,
        phone: phone.trim() || null,
        password,
        confirmPassword
      });

      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error details:', err);
      const serverMessage = err.response?.data;
      if (serverMessage) {
        if (typeof serverMessage === 'string') {
          setError(serverMessage);
        } else if (serverMessage.message) {
          setError(serverMessage.message);
        } else {
          setError(JSON.stringify(serverMessage));
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-emerald-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md glass dark:glass p-8 rounded-2xl shadow-2xl border border-white/10 relative z-10 transition-all">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">Start your personal accountability journey.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-400 p-3.5 rounded-xl text-sm mb-6 animate-pulse">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-3.5 rounded-xl text-sm mb-6">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <input
                id="name"
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1" htmlFor="email">
              Email Address <span className="text-slate-500 text-xs font-normal">(Optional if Phone used)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="email"
                type="email"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1" htmlFor="phone">
              Phone Number <span className="text-slate-500 text-xs font-normal">(Optional if Email used)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-5 h-5" />
              </div>
              <input
                id="phone"
                type="tel"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1" htmlFor="password">
              Password <span className="text-slate-500 text-xs font-normal">(Min. 8 characters)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-emerald-600 hover:from-indigo-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <span>Already have an account? </span>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
