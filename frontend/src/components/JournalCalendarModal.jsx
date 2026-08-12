import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Download, X, BookOpen, Lock, Sparkles, CheckCircle2, FileText
} from 'lucide-react';
import { downloadJournalPDF } from '../utils/pdfGenerator';

const formatLocalDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayVal = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayVal}`;
};

const JournalCalendarModal = ({ isOpen, onClose, userName = 'User' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState(null);

  // Fetch all user journals
  const fetchAllJournals = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/journals/all');
      setJournals(response.data || []);
    } catch (err) {
      console.error('Failed to load journal history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllJournals();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // Map entries by date string (YYYY-MM-DD)
  const journalMap = {};
  journals.forEach((j) => {
    if (j.date) {
      // Check if entry has actual content
      const hasContent = Boolean(
        j.contentWhatIDid || j.contentWhatILearned || 
        j.contentWins || j.contentMistakes || j.contentTomorrowGoals
      );
      if (hasContent) {
        journalMap[j.date] = j;
      }
    }
  });

  const handleDateClick = (dateStr) => {
    setSelectedDateStr(dateStr);
    const existing = journalMap[dateStr];
    if (existing) {
      setSelectedEntry(existing);
    } else {
      // Fetch specifically or set blank preview for locked past date / today
      const todayStr = formatLocalDate(new Date());
      setSelectedEntry({
        date: dateStr,
        contentWhatIDid: '',
        contentWhatILearned: '',
        contentWins: '',
        contentMistakes: '',
        contentTomorrowGoals: '',
        locked: dateStr < todayStr
      });
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Journal History & Calendar</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">View past daily reflections and download PDFs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading journal calendar history...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Calendar Grid */}
              <div className="md:col-span-7 bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    {monthNames[month]} {year}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevMonth}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {daysOfWeek.map((day) => (
                    <span key={day} className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty offset cells */}
                  {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="h-10" />
                  ))}

                  {/* Days of Month */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateObj = new Date(year, month, dayNum);
                    const dateStr = formatLocalDate(dateObj);
                    const hasEntry = Boolean(journalMap[dateStr]);
                    const isSelected = selectedDateStr === dateStr;
                    const todayStr = formatLocalDate(new Date());
                    const isToday = dateStr === todayStr;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateClick(dateStr)}
                        className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-bold ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md scale-105 z-10'
                            : isToday
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                            : hasEntry
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{dayNum}</span>
                        {hasEntry && (
                          <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-5 text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Saved Entry</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                    <span>Selected Date</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Journal Entry View */}
              <div className="md:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                {selectedEntry ? (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Journal Date</span>
                        <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          {selectedEntry.date}
                          {selectedEntry.locked ? (
                            <Lock className="w-4 h-4 text-slate-400" title="Locked Entry" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" title="Unlocked" />
                          )}
                        </h4>
                      </div>

                      <button
                        onClick={() => downloadJournalPDF(selectedEntry, userName)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </button>
                    </div>

                    {/* Entry Reflection Sections */}
                    <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                      {[
                        { title: 'What I Did Today', val: selectedEntry.contentWhatIDid },
                        { title: 'What I Learned', val: selectedEntry.contentWhatILearned },
                        { title: 'Wins & Achievements', val: selectedEntry.contentWins },
                        { title: 'Mistakes & Slip-ups', val: selectedEntry.contentMistakes },
                        { title: 'Tomorrow\'s Goals', val: selectedEntry.contentTomorrowGoals },
                      ].map((sec, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">{sec.title}</h5>
                          <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                            {sec.val && sec.val.trim() ? sec.val : <span className="italic text-slate-400">No entry logged.</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <FileText className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Select any marked date on the calendar to view full reflection details and download PDF.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalCalendarModal;
