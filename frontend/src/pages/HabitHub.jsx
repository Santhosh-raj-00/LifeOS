import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Award, Flame, Check, X, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

const HabitHub = () => {
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHabitsAndLogs = async () => {
    try {
      // Fetch habits list
      const habitsRes = await axios.get('/api/habits');
      setHabits(habitsRes.data);

      // Fetch today's logs (triggers lazy generation of pending logs)
      const logsRes = await axios.get('/api/habits/logs');
      setHabitLogs(logsRes.data);
    } catch (err) {
      setError('Failed to fetch habit data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitsAndLogs();
  }, []);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    setError('');
    setSuccess('');
    try {
      await axios.post('/api/habits', { name: newHabitName });
      setNewHabitName('');
      setSuccess('New habit tracking initialized.');
      fetchHabitsAndLogs();
    } catch (err) {
      setError(err.response?.data || 'Failed to create habit.');
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm("Are you sure you want to delete this habit and all its logs?")) {
      return;
    }
    setError('');
    try {
      await axios.delete(`/api/habits/${id}`);
      fetchHabitsAndLogs();
    } catch (err) {
      setError('Failed to delete habit.');
    }
  };

  const handleLogToggle = async (habitId, currentStatus) => {
    setError('');
    // Alternate status: if COMPLETED -> PENDING, if PENDING/MISSED -> COMPLETED
    const targetStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    
    try {
      await axios.post(`/api/habits/${habitId}/log?status=${targetStatus}`);
      fetchHabitsAndLogs();
    } catch (err) {
      setError('Failed to log habit status.');
    }
  };

  const getLogForHabit = (habitId) => {
    return habitLogs.find(log => log.habit.id === habitId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Habit Hub
            <Award className="w-7 h-7 text-indigo-500" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Maintain daily checks to build powerful, long-term discipline streaks.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm mb-6">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm mb-6">
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Form: create habit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Initialize Habit
          </h2>

          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Habit Name</label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Exercise, Read Books"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Start Tracking
            </button>
          </form>
        </div>

        {/* Right Content: habit check list */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Today's Habits</h2>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-sm">No habits configured yet.</p>
              <p className="text-xs text-slate-500 mt-0.5">Configure your core habits to build discipline.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                const log = getLogForHabit(habit.id);
                const status = log ? log.status : 'PENDING';
                const isCompleted = status === 'COMPLETED';

                return (
                  <div 
                    key={habit.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-xl hover:shadow-sm transition-all"
                  >
                    <div className="space-y-1 mb-3 sm:mb-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">{habit.name}</h4>
                      <div className="flex items-center text-xs font-bold text-slate-400 gap-3">
                        <span className="flex items-center text-amber-500">
                          <Flame className="w-3.5 h-3.5 mr-0.5 fill-amber-500" />
                          Streak: {habit.currentStreak}d
                        </span>
                        <span>• Best: {habit.bestStreak}d</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Check/Toggle Checkbox */}
                      <button
                        onClick={() => handleLogToggle(habit.id, status)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm transition-all active:scale-[0.98] ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-750'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        {isCompleted ? 'Completed' : 'Pending'}
                      </button>

                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitHub;
