import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar as CalIcon, ChevronLeft, ChevronRight, CheckCircle2, 
  XCircle, Award, BookOpen, AlertCircle, Info, Lock
} from 'lucide-react';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  
  // Daily data fetched for selected date
  const [dailyTasks, setDailyTasks] = useState([]);
  const [dailyJournal, setDailyJournal] = useState(null);
  const [completionStats, setCompletionStats] = useState({
    completedCount: 0,
    missedCount: 0,
    totalCount: 0,
    percentage: 0
  });

  // Fetch daily details when selected date changes
  const fetchDailyDetails = async (dateObj) => {
    setLoading(true);
    const dateStr = dateObj.toISOString().split('T')[0];
    try {
      // Fetch tasks for chosen date
      const tasksRes = await axios.get(`/api/tasks?date=${dateStr}`);
      setDailyTasks(tasksRes.data);

      const completed = tasksRes.data.filter(t => t.status === 'COMPLETED').length;
      const missed = tasksRes.data.filter(t => t.status === 'MISSED').length;
      const total = tasksRes.data.length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      setCompletionStats({
        completedCount: completed,
        missedCount: missed,
        totalCount: total,
        percentage: pct
      });

      // Fetch journal for chosen date
      const journalRes = await axios.get(`/api/journals?date=${dateStr}`);
      setDailyJournal(journalRes.data.id ? journalRes.data : null);

    } catch (err) {
      console.error("Failed to load details for " + dateStr, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyDetails(selectedDate);
  }, [selectedDate]);

  // Calendar logic helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday, 6 = Saturday

  // Adjust Sunday offset to make Monday first if desired, but standard US Sunday-first grid is easy.
  const daysGrid = [];
  // Fill empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    daysGrid.push(null);
  }
  // Fill days
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(new Date(year, month, d));
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isToday = (dateObj) => isSameDay(dateObj, new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-8">
        <CalIcon className="w-8 h-8 text-indigo-500" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Discipline Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit your accountability history and browse past journal reflections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Grid Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth} 
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth} 
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {daysGrid.map((dayObj, index) => {
              if (!dayObj) {
                return <div key={`empty-${index}`} className="aspect-square bg-slate-50/50 dark:bg-slate-950/10 rounded-xl"></div>;
              }

              const isSelected = isSameDay(dayObj, selectedDate);
              const isCurrent = isToday(dayObj);

              return (
                <button
                  key={`day-${dayObj.getDate()}`}
                  onClick={() => setSelectedDate(dayObj)}
                  className={`aspect-square relative flex flex-col items-center justify-center rounded-xl font-bold transition-all border ${
                    isSelected 
                      ? 'bg-indigo-600 text-white border-transparent scale-105 shadow-md shadow-indigo-600/15'
                      : isCurrent
                        ? 'bg-slate-100 dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 border-indigo-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">{dayObj.getDate()}</span>
                  
                  {/* Subtle dot underneath */}
                  {isCurrent && !isSelected && (
                    <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date details details column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
              <span>Audit details</span>
              <span className="text-xs text-indigo-500 font-extrabold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </h3>

            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading audit history...</div>
            ) : (
              <div className="space-y-6">
                {/* Stats summary banner */}
                {dailyTasks.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completion Rate</p>
                      <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">{completionStats.percentage}%</h4>
                    </div>
                    <div className="flex gap-4 text-xs font-bold">
                      <div className="text-emerald-500">
                        <p>Completed</p>
                        <p className="text-lg font-black">{completionStats.completedCount}</p>
                      </div>
                      <div className="text-rose-500">
                        <p>Missed</p>
                        <p className="text-lg font-black">{completionStats.missedCount}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tasks List */}
                <div>
                  <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">Tasks execution</h4>
                  {dailyTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No tasks logged for this date.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                      {dailyTasks.map(task => (
                        <div 
                          key={task.id}
                          className="flex items-center justify-between text-sm p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 rounded-xl"
                        >
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200">{task.schedule.title}</p>
                            <p className="text-[10px] text-slate-400">{task.schedule.startTime.slice(0, 5)} - {task.schedule.endTime.slice(0, 5)}</p>
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                            task.status === 'COMPLETED' 
                              ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
                              : 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Journal block */}
                <div className="border-t border-slate-150 dark:border-slate-800 pt-4">
                  <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Daily Journal
                    {dailyJournal && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </h4>

                  {!dailyJournal ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 rounded-xl text-center text-xs text-slate-400">
                      No journal entry written for this date.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                      {dailyJournal.contentWins && (
                        <div>
                          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Wins</h5>
                          <p className="text-xs text-slate-500 mt-0.5 pl-2 border-l border-emerald-500/50 whitespace-pre-wrap">{dailyJournal.contentWins}</p>
                        </div>
                      )}
                      {dailyJournal.contentWhatILearned && (
                        <div>
                          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">What I Learned</h5>
                          <p className="text-xs text-slate-500 mt-0.5 pl-2 border-l border-indigo-500/50 whitespace-pre-wrap">{dailyJournal.contentWhatILearned}</p>
                        </div>
                      )}
                      {dailyJournal.contentTomorrowGoals && (
                        <div>
                          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Goals</h5>
                          <p className="text-xs text-slate-500 mt-0.5 pl-2 border-l border-amber-500/50 whitespace-pre-wrap">{dailyJournal.contentTomorrowGoals}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
