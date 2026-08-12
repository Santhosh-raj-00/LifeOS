import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Bell, BellOff, CheckCircle2, AlertTriangle, ShieldAlert, 
  Settings, Volume2, Sparkles, X, Clock, Send
} from 'lucide-react';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendLocalNotification,
  getLeadTimeMinutes,
  setLeadTimeMinutes,
  checkScheduleReminders
} from '../utils/notificationService';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState(getNotificationPermission());
  const [leadTime, setLeadTime] = useState(getLeadTimeMinutes());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll today's tasks every 30 seconds to evaluate schedule reminders
  const fetchTasksAndCheckReminders = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const response = await axios.get(`/api/tasks?date=${todayStr}`);
      const tasks = response.data || [];

      // Check upcoming reminders
      checkScheduleReminders(tasks, (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      // Build active list of tasks ending soon (within 30 mins)
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      const activeUpcoming = tasks
        .filter((t) => t.status === 'PENDING' && !t.locked && t.schedule)
        .map((t) => {
          const parts = t.schedule.endTime.split(':');
          const endMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
          const remaining = endMins - currentMins;
          return { ...t, remainingMins: remaining };
        })
        .filter((t) => t.remainingMins > 0 && t.remainingMins <= 30);

      // Create notifications list from active upcoming tasks
      const reminderItems = activeUpcoming.map((t) => ({
        id: `remind_${t.id}`,
        type: t.remainingMins <= leadTime ? 'urgent' : 'upcoming',
        title: `⏰ Task Ending Soon: ${t.schedule.title}`,
        body: `${t.remainingMins} minute${t.remainingMins > 1 ? 's' : ''} left before lock at ${t.schedule.endTime}.`,
        time: t.schedule.endTime,
        taskId: t.id
      }));

      setNotifications((prev) => {
        // Merge system notifications and upcoming reminders without duplicates
        const existingIds = new Set(prev.map((n) => n.id));
        const newItems = reminderItems.filter((item) => !existingIds.has(item.id));
        return [...newItems, ...prev];
      });
    } catch (err) {
      console.log('Error fetching tasks for reminders:', err);
    }
  };

  useEffect(() => {
    fetchTasksAndCheckReminders();
    const interval = setInterval(fetchTasksAndCheckReminders, 30000); // check every 30s
    return () => clearInterval(interval);
  }, [leadTime]);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    if (perm === 'granted') {
      sendLocalNotification(
        '🎉 Notifications Enabled!',
        'LifeOS will now alert you before your schedules end so you never miss a task lock.',
        '/dashboard'
      );
    }
  };

  const handleLeadTimeChange = (mins) => {
    setLeadTime(mins);
    setLeadTimeMinutes(mins);
  };

  const handleSendTestNotification = () => {
    sendLocalNotification(
      '🔔 LifeOS Schedule Alert (Test)',
      `This is how you will be notified ${leadTime} minutes before your tasks lock as MISSED!`,
      '/tasks'
    );
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none"
        title="Schedule Notifications & Reminders"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Schedule Notifications</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              LifeOS Reminders
            </span>
          </div>

          <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Permission Request Banner */}
            {permission !== 'granted' && (
              <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Enable Push & Audio Alerts</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Allow browser notifications to receive timely alerts before your tasks lock.
                    </p>
                    <button
                      onClick={handleRequestPermission}
                      className="mt-2.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Grant Permission
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lead Time & Test Notification Settings */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Alert Lead Time
                </span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{leadTime} mins before end</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleLeadTimeChange(mins)}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      leadTime === mins
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>

              <button
                onClick={handleSendTestNotification}
                className="w-full py-2 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                Test Notification Sound & Alert
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Upcoming Task Reminders
              </h4>

              {notifications.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-xs">
                  No active task reminders right now. Your schedule alerts will appear here.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-2xl border text-xs flex items-start space-x-2.5 transition-all ${
                        n.type === 'urgent'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-900 dark:text-indigo-200'
                      }`}
                    >
                      <Clock className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 opacity-90">{n.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
