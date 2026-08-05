import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import TimerCard from './components/Timer/TimerCard';
import TaskList from './components/Tasks/TaskList';
import TaskModal from './components/Tasks/TaskModal';
import AmbientSoundPlayer from './components/AmbientSound/AmbientSoundPlayer';
import AnalyticsModal from './components/Analytics/AnalyticsModal';
import SettingsModal from './components/Settings/SettingsModal';
import ZenOverlay from './components/ZenMode/ZenOverlay';

import { useTimer } from './hooks/useTimer';
import {
  getStoredSettings,
  saveSettings,
  getStoredTasks,
  saveTasks,
  getStoredHistory
} from './utils/storage';
import { formatTime } from './utils/helpers';

export default function App() {
  // State management
  const [settings, setSettings] = useState(getStoredSettings);
  const [tasks, setTasks] = useState(getStoredTasks);
  const [activeTaskId, setActiveTaskId] = useState(() => (tasks.length > 0 ? tasks[0].id : null));
  const [history, setHistory] = useState(getStoredHistory);

  // Modals & Overlays
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isZenMode, setIsZenMode] = useState(false);

  // Apply theme to html data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'sage');
  }, [settings.theme]);

  // Find active task object
  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  // Handle task pomodoro completion
  const handleTaskPomodoroComplete = useCallback((taskId) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === taskId) {
          const completedCount = (t.completedPomodoros || 0) + 1;
          const isDone = completedCount >= t.estPomodoros;
          return {
            ...t,
            completedPomodoros: completedCount,
            completed: isDone || t.completed
          };
        }
        return t;
      });
      saveTasks(updated);
      return updated;
    });
  }, []);

  // Timer hook
  const {
    mode,
    timeLeft,
    totalDuration,
    isRunning,
    completedSessionsCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    extendTimer,
    switchMode
  } = useTimer({
    settings,
    activeTask,
    onTaskPomodoroComplete: handleTaskPomodoroComplete
  });

  // Dynamic Browser Tab Title update
  useEffect(() => {
    const formatted = formatTime(timeLeft);
    const modeLabel = mode === 'focus' ? 'Focus' : 'Break';
    document.title = `${formatted} — ${modeLabel} | Serene Space`;
  }, [timeLeft, mode]);

  // Task Operations
  const handleSaveTask = (taskData) => {
    setTasks((prev) => {
      let updated;
      const exists = prev.some((t) => t.id === taskData.id);
      if (exists) {
        updated = prev.map((t) => (t.id === taskData.id ? taskData : t));
      } else {
        updated = [taskData, ...prev];
      }
      saveTasks(updated);

      // If no active task selected, set this new task as active
      if (!activeTaskId) setActiveTaskId(taskData.id);
      return updated;
    });
  };

  const handleToggleTaskComplete = (taskId) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      saveTasks(updated);
      return updated;
    });
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      saveTasks(updated);
      if (activeTaskId === taskId) {
        setActiveTaskId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="app-container">
      {/* Background Animated Breathing Aura */}
      <div className={`ambient-aura mode-${mode}`} />

      {/* Top Header Navbar */}
      <Navbar
        onOpenAnalytics={() => {
          setHistory(getStoredHistory());
          setIsAnalyticsOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleZen={() => setIsZenMode(true)}
        currentTheme={settings.theme}
      />

      {/* Main Focus Workspace Layout */}
      <main>
        <TimerCard
          mode={mode}
          timeLeft={timeLeft}
          totalDuration={totalDuration}
          isRunning={isRunning}
          completedSessionsCount={completedSessionsCount}
          activeTask={activeTask}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          onSkip={skipTimer}
          onExtend={extendTimer}
          onSwitchMode={switchMode}
        />

        <div className="workspace-grid">
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onSelectActiveTask={(id) => setActiveTaskId(id)}
            onToggleComplete={handleToggleTaskComplete}
            onDeleteTask={handleDeleteTask}
            onOpenAddTask={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
          />

          <AmbientSoundPlayer
            ambientSound={settings.ambientSound || 'none'}
            ambientVolume={settings.ambientVolume || 0.5}
            onChangeSound={(sound) => handleSaveSettings({ ...settings, ambientSound: sound })}
            onChangeVolume={(vol) => handleSaveSettings({ ...settings, ambientVolume: vol })}
          />
        </div>
      </main>

      {/* Modals & Zen Overlay */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        history={history}
        dailyGoalMinutes={settings.dailyGoalMinutes || 125}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <ZenOverlay
        isOpen={isZenMode}
        onCloseZen={() => setIsZenMode(false)}
        mode={mode}
        timeLeft={timeLeft}
        totalDuration={totalDuration}
        isRunning={isRunning}
        activeTask={activeTask}
        onStart={startTimer}
        onPause={pauseTimer}
        onReset={resetTimer}
        onSkip={skipTimer}
      />
    </div>
  );
}
