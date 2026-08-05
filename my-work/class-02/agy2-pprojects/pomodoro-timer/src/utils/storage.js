const SETTINGS_KEY = 'serene_pomodoro_settings';
const TASKS_KEY = 'serene_pomodoro_tasks';
const HISTORY_KEY = 'serene_pomodoro_history';

export const DEFAULT_SETTINGS = {
  focusDuration: 25, // in minutes
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  theme: 'sage', // sage, dusk, sand, midnight
  volume: 0.7,
  chimeSound: 'singing-bowl', // singing-bowl, gentle-chime, warm-gong
  tickingSound: false,
  tickVolume: 0.3,
  ambientSound: 'none', // none, rain, ocean, noise, zen
  ambientVolume: 0.5,
  dailyGoalMinutes: 125 // default 5 pomodoros (125m)
};

export const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Design Serene Focus layout',
    estPomodoros: 2,
    completedPomodoros: 1,
    completed: false,
    tag: 'Design',
    createdAt: Date.now() - 3600000,
    notes: 'Create glassmorphism theme tokens and timer visual'
  },
  {
    id: 'task-2',
    title: 'Deep Work Session: Feature Implementation',
    estPomodoros: 4,
    completedPomodoros: 0,
    completed: false,
    tag: 'Coding',
    createdAt: Date.now(),
    notes: 'Focus on clean state updates and procedural audio'
  }
];

export function getStoredSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Error loading settings', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function getStoredTasks() {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : DEFAULT_TASKS;
  } catch (e) {
    console.error('Error loading tasks', e);
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks', e);
  }
}

export function getStoredHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading history', e);
    return [];
  }
}

export function saveHistorySession(session) {
  try {
    const history = getStoredHistory();
    const updated = [session, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving history session', e);
    return [];
  }
}
