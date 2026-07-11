import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Phone, ShieldCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        rememberMe
      });
      login(response.data);
      navigate('/');
    } catch (err) {
      console.error('Login error details:', err);
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
        setError('Invalid login credentials.');
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
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">LifeOS Login</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">Reclaim your focus, build ultimate discipline.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-400 p-3.5 rounded-xl text-sm mb-6 animate-pulse">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1.5" htmlFor="username">
              Email or Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                {username.includes('@') ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </div>
              <input
                id="username"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="email@example.com or +9198765..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-400 font-medium cursor-pointer">
              <input
                type="checkbox"
                className="mr-2 rounded border-slate-700 bg-slate-950/40 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
