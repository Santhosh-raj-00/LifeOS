// LifeOS Notification & Schedule Reminder Manager

export const REGISTER_SW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('[LifeOS] Service Worker registered with scope:', reg.scope);
      return reg;
    } catch (err) {
      console.error('[LifeOS] Service Worker registration failed:', err);
    }
  }
  return null;
};

export const getNotificationPermission = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
};

// Play pleasant chime alert using Web Audio API
export const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2 (harmony)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.log('Audio playback prevented or unsupported:', err);
  }
};

export const sendLocalNotification = async (title, body, url = '/') => {
  playNotificationSound();

  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        reg.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: { url },
          vibrate: [200, 100, 200]
        });
        return;
      }
    }
    // Fallback to standard Notification API
    new Notification(title, { body, icon: '/favicon.ico', data: { url } });
  }
};

// Check lead time setting (default 10 minutes)
export const getLeadTimeMinutes = () => {
  const saved = localStorage.getItem('lifeos_reminder_lead_time');
  return saved ? parseInt(saved, 10) : 10;
};

export const setLeadTimeMinutes = (mins) => {
  localStorage.setItem('lifeos_reminder_lead_time', mins.toString());
};

// Helper: parse HH:mm or HH:mm:ss to total minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
};

// Main task scheduler checker
export const checkScheduleReminders = (tasks = [], onNewNotification) => {
  if (!Array.isArray(tasks) || tasks.length === 0) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayStr = now.toISOString().split('T')[0];
  const leadTime = getLeadTimeMinutes();

  const storageKey = `lifeos_fired_alerts_${todayStr}`;
  let firedAlerts = {};
  try {
    firedAlerts = JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch (e) {
    firedAlerts = {};
  }

  tasks.forEach((taskLog) => {
    if (!taskLog || !taskLog.schedule || taskLog.status !== 'PENDING' || taskLog.locked) {
      return;
    }

    const schedule = taskLog.schedule;
    const endTimeMinutes = parseTimeToMinutes(schedule.endTime);
    const diffMinutes = endTimeMinutes - currentMinutes;

    // Trigger if remaining time is between 0 and lead time (e.g. <= 10 mins)
    if (diffMinutes > 0 && diffMinutes <= leadTime) {
      const alertId = `task_${taskLog.id}_remind_${diffMinutes}`;
      if (!firedAlerts[taskLog.id]) {
        firedAlerts[taskLog.id] = true;
        localStorage.setItem(storageKey, JSON.stringify(firedAlerts));

        const title = `⏰ Upcoming Lock Warning: ${schedule.title}`;
        const body = `Only ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} left to complete '${schedule.title}' before it locks as MISSED!`;
        
        sendLocalNotification(title, body, '/tasks');

        if (onNewNotification) {
          onNewNotification({
            id: Date.now(),
            type: 'warning',
            title,
            body,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            taskId: taskLog.id
          });
        }
      }
    }
  });
};
