import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calendar, Clock, AlertCircle, Info } from 'lucide-react';

const Categories = ['HEALTH', 'CODING', 'CAREER', 'FAMILY', 'STUDY', 'PERSONAL', 'OTHER'];
const RepeatTypes = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

const formatLocalDate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayVal = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayVal}`;
};

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PERSONAL');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [repeatType, setRepeatType] = useState('DAILY');
  const [date, setDate] = useState(formatLocalDate());
  const [day, setDay] = useState(''); // day of week or day of month

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules');
      setSchedules(response.data);
    } catch (err) {
      console.error("Failed to load schedules", err);
      setError("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (startTime >= endTime) {
      setError('Start time must be before end time.');
      return;
    }

    try {
      // Build request body
      const payload = {
        title,
        description,
        category,
        startTime: startTime + ":00", // append seconds for LocalTime mapping
        endTime: endTime + ":00",
        repeatType,
      };

      const targetDateObj = new Date(date + 'T00:00:00');
      const jsDay = targetDateObj.getDay();
      const isoDay = jsDay === 0 ? 7 : jsDay;

      if (repeatType === 'NONE') {
        payload.date = date;
      } else if (repeatType === 'WEEKLY') {
        payload.day = day ? parseInt(day) : isoDay;
      } else if (repeatType === 'MONTHLY') {
        payload.day = day ? parseInt(day) : targetDateObj.getDate();
      } else if (repeatType === 'YEARLY') {
        payload.day = targetDateObj.getDate();
        payload.month = targetDateObj.getMonth() + 1;
      }

      await axios.post('/api/schedules', payload);
      setSuccess('Schedule created successfully!');
      
      // Clear form
      setTitle('');
      setDescription('');
      
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data || 'Failed to create schedule.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule? Tasks that have already been logged for this schedule will remain, but no future tasks will be generated.")) {
      return;
    }
    try {
      await axios.delete(`/api/schedules/${id}`);
      setSchedules(schedules.filter(s => s.id !== id));
      setSuccess('Schedule deleted.');
    } catch (err) {
      setError('Failed to delete schedule.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Schedule Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Design your routine and commit to specific time windows.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm mb-6">
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Schedule Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-1.5">
            <Plus className="w-5 h-5 text-emerald-500" />
            Create Routine Task
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g. Wake Up"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
              <textarea
                rows="2"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="What does this entail?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {Categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Repeat Type</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value)}
                >
                  {RepeatTypes.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Start Time</label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Date selector based on repeat type */}
            {repeatType === 'NONE' && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            )}

            {repeatType === 'WEEKLY' && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Day of Week</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  <option value="">Default (from date picker)</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                  <option value="7">Sunday</option>
                </select>
              </div>
            )}

            {repeatType === 'MONTHLY' && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Day of Month (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                  placeholder="e.g. 17"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all"
            >
              Add Schedule
            </button>
          </form>
        </div>

        {/* Schedules list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-indigo-500" />
            Routine Lists ({schedules.length})
          </h2>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-sm">No schedules created yet.</p>
              <p className="text-xs text-slate-500 mt-0.5">Use the left form to schedule your daily habits.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {schedules.map((schedule) => (
                <div 
                  key={schedule.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 rounded-xl hover:shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{schedule.title}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200/55 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {schedule.category}
                      </span>
                    </div>
                    {schedule.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{schedule.description}</p>
                    )}
                    <div className="flex items-center text-xs text-slate-400 font-semibold gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Repeat: {schedule.repeatType}
                        {schedule.repeatType === 'WEEKLY' && ` (Day ${schedule.day})`}
                        {schedule.repeatType === 'MONTHLY' && ` (Day ${schedule.day})`}
                        {schedule.repeatType === 'NONE' && ` (${schedule.date})`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
                    title="Delete Schedule"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedules;
