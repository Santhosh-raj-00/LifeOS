import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, CheckCircle2, XCircle, Clock, Calendar, ArrowRight,
  TrendingUp, Award, PlayCircle, Lock, CheckSquare2, BookOpen
} from 'lucide-react';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    missed: 0,
    pending: 0,
    percentage: 0
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's tasks
  const fetchTodayTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      const taskList = response.data;
      setTasks(taskList);

      // Fetch user profile to sync streaks, levels, and XP
      const profileResponse = await axios.get('/api/profile');
      updateUser(profileResponse.data);

      // Compute statistics
      const completed = taskList.filter(t => t.status === 'COMPLETED').length;
      const missed = taskList.filter(t => t.status === 'MISSED').length;
      const pending = taskList.filter(t => t.status === 'PENDING').length;
      const total = taskList.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({ completed, missed, pending, percentage });

      // Determine upcoming tasks (PENDING, starting after now, or simply PENDING)
      const nowStr = new Date().toTimeString().slice(0, 5); // "HH:MM"
      const upcoming = taskList
        .filter(t => t.status === 'PENDING' && t.schedule.startTime >= nowStr)
        .slice(0, 3);
      
      setUpcomingTasks(upcoming);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayTasks();
    // Poll every 30 seconds to refresh tasks/auto-misses automatically
    const poll = setInterval(fetchTodayTasks, 30000);
    return () => clearInterval(poll);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      {/* Header and Time widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Welcome back, <span className="bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            "Discipline is choosing between what you want now and what you want most."
          </p>
        </div>
        
        {/* Live Clock Card */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-indigo-300">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Accountability Clock</span>
            </div>
            <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black font-mono tracking-widest text-emerald-400">
              {formatTime(time)}
            </h2>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              {formatDate(time)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Statistics Card Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Streak card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="w-8 h-8 fill-amber-500" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-semibold">Active Streak</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{user?.currentStreak} Days</h3>
            <p className="text-xs text-slate-500 mt-0.5">Best Streak: {user?.bestStreak} Days</p>
          </div>
        </div>

        {/* Completion Rate card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-semibold">Completion Rate</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stats.percentage}%</h3>
            <p className="text-xs text-slate-500 mt-0.5">{stats.completed} of {tasks.length} tasks done</p>
          </div>
        </div>

        {/* Tasks Completed card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-semibold">Completed Today</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stats.completed}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Keep pushing forward</p>
          </div>
        </div>

        {/* Tasks Missed card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-semibold">Missed Today</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stats.missed}</h3>
            <p className="text-xs text-rose-500 font-medium mt-0.5">{stats.pending} remaining pending</p>
          </div>
        </div>
      </div>

      {/* Gamification progress bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-indigo-500" />
              Level Progression
            </h3>
            <p className="text-sm text-slate-500">Level {user?.level} (Beginner)</p>
          </div>
          <div className="text-sm text-slate-500 mt-1 sm:mt-0 font-medium">
            {user?.xp} XP Total • {500 - (user?.xp % 500)} XP to next Level
          </div>
        </div>
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 rounded-full transition-all duration-500 shadow-inner"
            style={{ width: `${((user?.xp % 500) / 500) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Columns: Upcoming Tasks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Upcoming Accountability Tasks</h3>
            <Link to="/tasks" className="text-sm text-emerald-500 hover:text-emerald-400 font-bold flex items-center transition-colors">
              Monitor All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading...</div>
          ) : upcomingTasks.length === 0 ? (
            <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-sm">No upcoming tasks for today.</p>
              <Link to="/schedules" className="text-xs text-indigo-500 hover:underline font-bold mt-1 inline-block">
                Schedule a new task
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{task.schedule.title}</h4>
                      <p className="text-xs text-slate-500">{task.schedule.category} • {task.schedule.startTime} - {task.schedule.endTime}</p>
                    </div>
                  </div>
                  <Link 
                    to="/tasks"
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
                  >
                    <PlayCircle className="w-5 h-5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Navigation</h3>
            <div className="space-y-3">
              <Link 
                to="/tasks" 
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold transition-all hover:translate-x-1"
              >
                <span>Task Lock Monitor</span>
                <CheckSquare2 className="w-5 h-5" />
              </Link>
              <Link 
                to="/journal" 
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl text-indigo-700 dark:text-indigo-400 font-bold transition-all hover:translate-x-1"
              >
                <span>Write Today's Journal</span>
                <BookOpen className="w-5 h-5" />
              </Link>
              <Link 
                to="/habits" 
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-500/10 to-pink-600/10 border border-pink-500/20 hover:border-pink-500/40 rounded-xl text-pink-700 dark:text-pink-400 font-bold transition-all hover:translate-x-1"
              >
                <span>Habit Streaks</span>
                <Award className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs text-slate-500">
            <span className="font-bold flex items-center text-slate-700 dark:text-slate-300 mb-1">
              <Lock className="w-3.5 h-3.5 mr-1" /> Locking Reminder:
            </span>
            Tasks automatically mark as <span className="text-rose-500 font-bold">MISSED</span> and lock once their schedule end time expires. Complete tasks on time to protect your streak!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
