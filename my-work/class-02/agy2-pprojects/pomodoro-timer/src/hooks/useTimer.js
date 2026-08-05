import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { playChime, playTick } from '../utils/soundEngine';
import { saveHistorySession } from '../utils/storage';

export function useTimer({ settings, activeTask, onTaskPomodoroComplete }) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Calculate target duration in seconds for current mode
  const getDurationForMode = useCallback(
    (targetMode) => {
      if (targetMode === 'focus') return (settings.focusDuration || 25) * 60;
      if (targetMode === 'shortBreak') return (settings.shortBreakDuration || 5) * 60;
      if (targetMode === 'longBreak') return (settings.longBreakDuration || 15) * 60;
      return 25 * 60;
    },
    [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration]
  );

  const [timeLeft, setTimeLeft] = useState(() => getDurationForMode('focus'));
  const totalDuration = getDurationForMode(mode);

  // Refs for tracking accurately with setInterval/requestAnimationFrame
  const intervalRef = useRef(null);
  const modeRef = useRef(mode);
  const settingsRef = useRef(settings);
  const activeTaskRef = useRef(activeTask);

  useEffect(() => {
    modeRef.current = mode;
    settingsRef.current = settings;
    activeTaskRef.current = activeTask;
  });

  // Whenever duration settings change and timer is NOT running, reset time left
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDurationForMode(mode));
    }
  }, [mode, getDurationForMode, isRunning]);

  const triggerCompletionCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#84a98c', '#52796f', '#354f52', '#cad2c5', '#e9d8a6']
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSessionComplete = useCallback(() => {
    const currentMode = modeRef.current;
    const currentSettings = settingsRef.current;
    const currentTask = activeTaskRef.current;

    // Play chime sound
    playChime(currentSettings.chimeSound || 'singing-bowl', currentSettings.volume || 0.7);

    // Record session history
    const sessionRecord = {
      id: 'session-' + Date.now(),
      mode: currentMode,
      durationMinutes: Math.round(getDurationForMode(currentMode) / 60),
      timestamp: Date.now(),
      taskId: currentTask ? currentTask.id : null,
      taskTitle: currentTask ? currentTask.title : null
    };
    saveHistorySession(sessionRecord);

    let nextMode = 'focus';

    if (currentMode === 'focus') {
      triggerCompletionCelebration();
      setCompletedSessionsCount((prev) => {
        const newCount = prev + 1;
        // Determine break type based on longBreakInterval
        if (newCount % (currentSettings.longBreakInterval || 4) === 0) {
          nextMode = 'longBreak';
        } else {
          nextMode = 'shortBreak';
        }
        return newCount;
      });

      if (currentTask && onTaskPomodoroComplete) {
        onTaskPomodoroComplete(currentTask.id);
      }
    } else {
      nextMode = 'focus';
    }

    setMode(nextMode);
    setTimeLeft(getDurationForMode(nextMode));

    // Check auto-start settings
    if (currentMode === 'focus' && currentSettings.autoStartBreaks) {
      setIsRunning(true);
    } else if (currentMode !== 'focus' && currentSettings.autoStartFocus) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [getDurationForMode, onTaskPomodoroComplete, triggerCompletionCelebration]);

  // Main countdown effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            handleSessionComplete();
            return 0;
          }

          if (settingsRef.current.tickingSound) {
            playTick(settingsRef.current.tickVolume || 0.3);
          }

          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleSessionComplete]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  };

  const skipTimer = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const extendTimer = (seconds = 300) => {
    setTimeLeft((prev) => prev + seconds);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
  };

  return {
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
  };
}
