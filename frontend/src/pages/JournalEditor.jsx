import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BookOpen, Save, Lock, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

const JournalEditor = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState({
    contentWhatIDid: '',
    contentWhatILearned: '',
    contentWins: '',
    contentMistakes: '',
    contentTomorrowGoals: ''
  });
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [error, setError] = useState('');

  const firstRender = useRef(true);

  // Fetch journal entry for chosen date
  const fetchJournal = async (targetDate) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/journals?date=${targetDate}`);
      const data = response.data;
      setContent({
        contentWhatIDid: data.contentWhatIDid || '',
        contentWhatILearned: data.contentWhatILearned || '',
        contentWins: data.contentWins || '',
        contentMistakes: data.contentMistakes || '',
        contentTomorrowGoals: data.contentTomorrowGoals || ''
      });
      setLocked(data.locked || false);
      setSaveStatus('saved');
    } catch (err) {
      setError('Failed to load journal entry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal(date);
    firstRender.current = true;
  }, [date]);

  // Debounced Autosave effect
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (locked) return;

    setSaveStatus('saving');

    const delayDebounceFn = setTimeout(async () => {
      try {
        await axios.post(`/api/journals?date=${date}`, content);
        setSaveStatus('saved');
      } catch (err) {
        console.error("Autosave failed", err);
        setSaveStatus('error');
        setError(err.response?.data || 'Autosave failed.');
      }
    }, 1200); // 1.2s delay for typing buffer

    return () => clearTimeout(delayDebounceFn);
  }, [content, date, locked]);

  const handleFieldChange = (field, value) => {
    if (locked) return;
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const forceSave = async () => {
    if (locked) return;
    setSaveStatus('saving');
    setError('');
    try {
      await axios.post(`/api/journals?date=${date}`, content);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setError('Failed to save journal.');
    }
  };

  const sections = [
    { key: 'contentWhatIDid', label: 'What I Did Today', placeholder: 'Summarize your activities, tasks, and routine execution...' },
    { key: 'contentWhatILearned', label: 'What I Learned', placeholder: 'Key insights, wisdom, and intellectual growth from today...' },
    { key: 'contentWins', label: 'Wins & Achievements', placeholder: 'Highlight your successes, positive habits kept, and XP achievements...' },
    { key: 'contentMistakes', label: 'Mistakes & Slip-ups', placeholder: 'Document times you lost discipline, procrastinated, or missed locks...' },
    { key: 'contentTomorrowGoals', label: 'Tomorrow\'s Goals', placeholder: 'Write down specific focus points and schedules for tomorrow...' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Accountability Journal
            <BookOpen className="w-6 h-6 text-indigo-500" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Reflect on your discipline. Journals are unlocked during the day and lock permanently at midnight.
          </p>
        </div>

        {/* Date Selector & Save indicator */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <input
            type="date"
            className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-sm mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Floating Save Status Bar */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          {locked ? (
            <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-400" />
              Locked (Past entry cannot be edited)
            </span>
          ) : (
            <span className="text-emerald-500 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '4s' }} />
              Autosave Enabled
            </span>
          )}
        </div>
        {!locked && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'Draft saved'}
              {saveStatus === 'error' && 'Error saving'}
            </span>
            <button
              onClick={forceSave}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
              title="Save Now"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading journal workspace...</div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div 
              key={section.key}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-3">{section.label}</h3>
              <textarea
                disabled={locked}
                rows="4"
                className="w-full p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-50 dark:disabled:bg-slate-950/10 disabled:cursor-not-allowed"
                placeholder={section.placeholder}
                value={content[section.key]}
                onChange={(e) => handleFieldChange(section.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalEditor;
