import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle, Play, ShieldAlert, Lock, Clock, Calendar, 
  HelpCircle, Sparkles, RefreshCw
} from 'lucide-react';

const TaskMonitor = () => {
  const { user, updateUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());

  // Tick clock to update countdowns in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, []);

  const handleComplete = async (taskId) => {
    setError('');
    try {
      const response = await axios.put(`/api/tasks/${taskId}/complete`);
      
      // Update in state
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
      
      // Refresh user profile for XP updates
      const profileResponse = await axios.get('/api/profile');
      updateUser(profileResponse.data);
    } catch (err) {
      setError(err.response?.data || 'Could not complete task.');
      fetchTasks(); // refresh lists
    }
  };

  // Helper to parse time string "HH:MM:SS" or "HH:MM" into Date object for today
  const timeToDate = (timeStr) => {
    const [hrs, mins, secs] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hrs), parseInt(mins), secs ? parseInt(secs) : 0, 0);
    return date;
  };

  const getWindowStatus = (task) => {
    if (task.status === 'COMPLETED') return { label: 'Completed', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle };
    if (task.status === 'MISSED') return { label: 'Missed', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', icon: ShieldAlert };
    if (task.status === 'LOCKED') return { label: 'Locked', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', icon: Lock };

    // Otherwise, check pending windows relative to current ticking 'now'
    const start = timeToDate(task.schedule.startTime);
    const end = timeToDate(task.schedule.endTime);

    if (now < start) {
      return { 
        label: 'Pending', 
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', 
        icon: Clock,
        subtext: `Opens in ${formatRemainingTime(start - now)}` 
      };
    } else if (now >= start && now <= end) {
      return { 
        label: 'Active Window', 
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 animate-pulse', 
        icon: Play,
        subtext: `Locks in ${formatRemainingTime(end - now)}` 
      };
    } else {
      return { 
        label: 'Missed', 
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', 
        icon: ShieldAlert,
        subtext: 'Lock expired' 
      };
    }
  };

  const formatRemainingTime = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    let res = '';
    if (hrs > 0) res += `${hrs}h `;
    if (mins > 0 || hrs > 0) res += `${mins}m `;
    res += `${secs}s`;
    return res;
  };

  const isCompleteAllowed = (task) => {
    if (task.status !== 'PENDING' || task.locked) return false;
    const start = timeToDate(task.schedule.startTime);
    const end = timeToDate(task.schedule.endTime);
    return now >= start && now <= end;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Task Lock Monitor
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Complete tasks inside their time lock windows. Failing to do so permanently locks them as MISSED.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchTasks(); }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-200 transition-all active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          Sync Log
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm mb-6 animate-shake">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading accountability window...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">No tasks scheduled for today.</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Tasks are automatically generated based on your schedules. Create routine schedules to populate this workspace.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map((task) => {
            const wStatus = getWindowStatus(task);
            const StatusIcon = wStatus.icon;
            const canComplete = isCompleteAllowed(task);

            return (
              <div 
                key={task.id}
                className={`relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all duration-300 shadow-sm ${
                  task.status === 'COMPLETED' 
                    ? 'border-emerald-500/20 shadow-emerald-500/5' 
                    : task.status === 'MISSED' 
                      ? 'border-rose-500/20 shadow-rose-500/5' 
                      : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Visual Accent border left */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                  task.status === 'COMPLETED' 
                    ? 'bg-emerald-500' 
                    : task.status === 'MISSED' 
                      ? 'bg-rose-500' 
                      : canComplete 
                        ? 'bg-indigo-500' 
                        : 'bg-amber-500'
                }`}></div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pl-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{task.schedule.title}</h3>
                      
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${wStatus.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {wStatus.label}
                      </span>
                    </div>

                    {task.schedule.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{task.schedule.description}</p>
                    )}

                    <div className="flex items-center text-xs text-slate-400 font-bold gap-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Window: {task.schedule.startTime.slice(0, 5)} - {task.schedule.endTime.slice(0, 5)}
                      </span>
                      {wStatus.subtext && (
                        <span className="text-indigo-500 dark:text-indigo-400 flex items-center gap-1 font-semibold">
                          • {wStatus.subtext}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center">
                    {task.status === 'COMPLETED' ? (
                      <div className="flex flex-col items-end text-xs text-slate-400 font-semibold">
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Completed (+10 XP)
                        </span>
                        {task.completedAt && (
                          <span className="mt-1">At {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    ) : task.status === 'MISSED' || task.status === 'LOCKED' ? (
                      <div className="flex flex-col items-end text-xs text-slate-400 font-semibold">
                        <span className="text-rose-500 font-bold flex items-center gap-1">
                          <Lock className="w-4 h-4" /> Locked & Missed
                        </span>
                        <span className="mt-1">Lock expired at {task.schedule.endTime.slice(0, 5)}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleComplete(task.id)}
                        disabled={!canComplete}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 active:scale-[0.98] ${
                          canComplete
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/10'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {canComplete ? 'Complete Task' : 'Locked'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskMonitor;
