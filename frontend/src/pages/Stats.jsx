import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  BarChart2, Flame, CheckCircle, AlertTriangle, ShieldCheck, 
  TrendingUp, Calendar, Info
} from 'lucide-react';

const Stats = () => {
  const [range, setRange] = useState('weekly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/stats?range=${range}`);
      setData(response.data);
    } catch (err) {
      console.error("Failed to load statistics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [range]);

  // Color mappings for dark mode/light mode compatibility
  const tooltipContentStyle = {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    border: 'none',
    color: '#f8fafc'
  };

  const formatLocalDate = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayVal = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayVal}`;
  };

  // Habit Heatmap Generator helper
  const renderHeatmap = () => {
    if (!data || !data.habitHeatmap) return null;
    
    // Create list of dates matching chosen range
    const today = new Date();
    const dates = [];
    const daysToShow = range === 'weekly' ? 7 : range === 'monthly' ? 30 : 90; // limit yearly to 90 days for clean UI grid display

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatLocalDate(date);
      dates.push({
        dateStr,
        label: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        count: data.habitHeatmap[dateStr] || 0
      });
    }

    return (
      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2">
        {dates.map((d, idx) => {
          // Determine color density
          let color = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
          if (d.count > 0 && d.count <= 1) color = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
          else if (d.count > 1 && d.count <= 3) color = 'bg-emerald-500/40 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30';
          else if (d.count > 3) color = 'bg-emerald-500 text-white shadow-sm';

          return (
            <div 
              key={idx} 
              className={`aspect-square rounded-lg flex flex-col items-center justify-center font-bold text-[10px] cursor-help p-1 transition-all hover:scale-105 ${color}`}
              title={`${d.count} habits completed on ${d.dateStr}`}
            >
              <span>{d.count}</span>
              <span className="text-[7px] font-normal opacity-85">{d.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-8 h-8 text-indigo-500" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Discipline Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Analyze your streaks, task completions, and routine metrics.</p>
          </div>
        </div>

        {/* Range selectors */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center">
          {['weekly', 'monthly', 'yearly'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                range === r 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Aggregating stats charts...</div>
      ) : !data ? (
        <div className="text-center py-12 text-slate-400">Failed to load statistics.</div>
      ) : (
        <div className="space-y-8">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400 font-semibold">Completion Rate</span>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{Math.round(data.completionRate)}%</h3>
              <p className="text-xs text-slate-500 mt-1">{data.totalCompleted} completed of {data.totalTasks} total tasks</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400 font-semibold">Missed Rate</span>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{Math.round(data.missedRate)}%</h3>
              <p className="text-xs text-slate-500 mt-1">{data.totalMissed} locked/missed logs</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400 font-semibold">Current Streak</span>
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{data.currentStreak} Days</h3>
              <p className="text-xs text-slate-500 mt-1">Protected by perfect execution</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400 font-semibold">Best Streak</span>
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{data.bestStreak} Days</h3>
              <p className="text-xs text-slate-500 mt-1">Your personal best record</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Task History Line Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-6">Execution Trend</h3>
              <div className="h-80 w-full text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.taskHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={tooltipContentStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} name="Completed Tasks" />
                    <Line type="monotone" dataKey="missed" stroke="#ef4444" strokeWidth={2} name="Missed Tasks" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Completions Bar Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-6">Completions by Category</h3>
              {data.categoryBreakdown.length === 0 ? (
                <div className="h-80 flex flex-col justify-center items-center text-slate-400 italic">
                  No categorical tasks logged yet.
                </div>
              ) : (
                <div className="h-80 w-full text-xs font-semibold">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                      <XAxis dataKey="category" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={tooltipContentStyle} />
                      <Legend />
                      <Bar dataKey="completed" fill="#6366f1" name="Completed" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="total" fill="#e2e8f0" name="Total Scheduled" radius={[6, 6, 0, 0]} className="dark:fill-slate-800" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Habit Heatmap Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Habit Completion Heatmap
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Shows habit checks density for the past {range === 'weekly' ? '7' : range === 'monthly' ? '30' : '90'} days. Hover over grid nodes to audit count records.
            </p>
            {renderHeatmap()}
            
            {/* Heatmap Legend */}
            <div className="flex items-center gap-4 mt-6 text-xs text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800"></div>
                <div className="w-4 h-4 rounded bg-emerald-500/20"></div>
                <div className="w-4 h-4 rounded bg-emerald-500/40"></div>
                <div className="w-4 h-4 rounded bg-emerald-500"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
