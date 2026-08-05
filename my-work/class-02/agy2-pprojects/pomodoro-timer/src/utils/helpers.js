export function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDate(timestamp);
}

/**
 * Compute daily & weekly productivity stats from history log
 */
export function calculateStats(history = [], dailyGoalMinutes = 125) {
  const now = new Date();
  const todayStr = now.toDateString();

  // Filter history for focus mode sessions
  const focusSessions = history.filter(s => s.mode === 'focus');

  let todayMinutes = 0;
  let totalMinutes = 0;

  // Track dates where focus sessions occurred to calculate streak
  const activeDates = new Set();

  focusSessions.forEach(session => {
    const sessionDate = new Date(session.timestamp);
    const sessionMins = session.durationMinutes || Math.round((session.duration || 1500) / 60);
    totalMinutes += sessionMins;

    activeDates.add(sessionDate.toDateString());

    if (sessionDate.toDateString() === todayStr) {
      todayMinutes += sessionMins;
    }
  });

  // Calculate Streak
  let streak = 0;
  let checkDate = new Date(now);

  while (true) {
    const str = checkDate.toDateString();
    if (activeDates.has(str)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today has no sessions yet, check if yesterday had sessions to maintain current streak
      if (streak === 0 && checkDate.toDateString() === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (!activeDates.has(checkDate.toDateString())) {
          break;
        }
      } else {
        break;
      }
    }
  }

  // Calculate Last 7 Days chart data
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayLabel = days[d.getDay()];

    const minsOnDay = focusSessions
      .filter(s => new Date(s.timestamp).toDateString() === dateStr)
      .reduce((sum, s) => sum + (s.durationMinutes || Math.round((s.duration || 1500) / 60)), 0);

    weekData.push({
      day: dayLabel,
      dateStr: `${d.getMonth() + 1}/${d.getDate()}`,
      minutes: minsOnDay,
      isToday: dateStr === todayStr
    });
  }

  const goalPercentage = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  return {
    todayMinutes,
    totalMinutes,
    totalSessions: focusSessions.length,
    streak,
    goalPercentage,
    weekData
  };
}
