import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, Sun, Moon, LogOut, LayoutDashboard, Calendar, 
  BookOpen, Award, CheckSquare, BarChart2, User, Menu, X, PlusCircle
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Schedules', path: '/schedules', icon: PlusCircle },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Habits', path: '/habits', icon: Award },
    { name: 'Statistics', path: '/stats', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 glass shadow-md dark:shadow-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Streaks */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              LifeOS
            </Link>
            {user && (
              <div className="flex items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-3 py-1 rounded-full text-sm border border-amber-500/20 shadow-sm transition-all hover:scale-105">
                <Flame className="w-4 h-4 mr-1 fill-amber-500 stroke-amber-600 dark:stroke-amber-400" />
                <span>{user.currentStreak} Day Streak</span>
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {user && navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Gamification Stats & Controls */}
          <div className="hidden lg:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800/60 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-right">
                  <p className="font-bold text-slate-800 dark:text-slate-200">LVL {user.level}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{user.xp} XP</p>
                </div>
                <div className="w-16 h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500" 
                    style={{ width: `${Math.min(100, (user.xp % 500) / 5)}%` }} // 500 XP per level-up check visual representation
                  ></div>
                </div>
              </div>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {user && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && user && (
        <div className="lg:hidden glass border-t border-slate-200 dark:border-slate-800 slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Gamification Stats */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">LVL {user.level} (Consistent)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.xp} XP total</p>
              </div>
              <div className="w-32 h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500" 
                  style={{ width: `${Math.min(100, (user.xp % 500) / 5)}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center px-4 py-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
