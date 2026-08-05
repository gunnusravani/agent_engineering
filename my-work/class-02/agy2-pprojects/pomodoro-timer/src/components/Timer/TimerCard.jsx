import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus, CheckCircle2, Target } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

export default function TimerCard({
  mode,
  timeLeft,
  totalDuration,
  isRunning,
  completedSessionsCount,
  activeTask,
  onStart,
  onPause,
  onReset,
  onSkip,
  onExtend,
  onSwitchMode
}) {
  // SVG Progress calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const modeLabels = {
    focus: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };

  return (
    <div className="timer-container glass-card">
      {/* Mode Selection Tabs */}
      <div className="mode-tabs">
        <button
          className={`mode-tab ${mode === 'focus' ? 'active' : ''}`}
          onClick={() => onSwitchMode('focus')}
        >
          Focus
        </button>
        <button
          className={`mode-tab ${mode === 'shortBreak' ? 'active' : ''}`}
          onClick={() => onSwitchMode('shortBreak')}
        >
          Short Break
        </button>
        <button
          className={`mode-tab ${mode === 'longBreak' ? 'active' : ''}`}
          onClick={() => onSwitchMode('longBreak')}
        >
          Long Break
        </button>
      </div>

      {/* Active Task Pill if set */}
      {activeTask && (
        <div className="active-task-pill" title={`Working on: ${activeTask.title}`}>
          <Target size={14} />
          <span>{activeTask.title}</span>
          <span className="task-pomo-badge">
            (🍅 {activeTask.completedPomodoros}/{activeTask.estPomodoros})
          </span>
        </div>
      )}

      {/* SVG Circular Progress & Time Digits */}
      <div className="timer-circle-wrapper">
        <svg className="timer-svg" viewBox="0 0 280 280">
          <circle
            className="timer-bg-circle"
            cx="140"
            cy="140"
            r={radius}
          />
          <circle
            className="timer-progress-circle"
            cx="140"
            cy="140"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="timer-content">
          <div className="timer-digits">{formatTime(timeLeft)}</div>
          <div className="timer-label">{modeLabels[mode]}</div>
        </div>
      </div>

      {/* Primary & Secondary Timer Controls */}
      <div className="timer-controls">
        <button
          className="btn-secondary-ctrl"
          onClick={onReset}
          title="Reset Timer"
        >
          <RotateCcw size={18} />
        </button>

        <button
          className="btn-primary-play"
          onClick={isRunning ? onPause : onStart}
          title={isRunning ? 'Pause Session' : 'Start Session'}
        >
          {isRunning ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: '4px' }} />}
        </button>

        <button
          className="btn-secondary-ctrl"
          onClick={onSkip}
          title="Skip to next session"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Quick extension chips */}
      <div className="timer-quick-add">
        <button className="btn-chip" onClick={() => onExtend(60)}>
          +1 min
        </button>
        <button className="btn-chip" onClick={() => onExtend(300)}>
          +5 min
        </button>
      </div>
    </div>
  );
}
