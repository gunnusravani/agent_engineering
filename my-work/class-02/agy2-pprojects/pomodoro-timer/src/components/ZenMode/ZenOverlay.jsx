import React from 'react';
import { Minimize2, Play, Pause, SkipForward, RotateCcw, Target } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

export default function ZenOverlay({
  isOpen,
  onCloseZen,
  mode,
  timeLeft,
  totalDuration,
  isRunning,
  activeTask,
  onStart,
  onPause,
  onReset,
  onSkip
}) {
  if (!isOpen) return null;

  const modeLabels = {
    focus: 'Deep Focus',
    shortBreak: 'Resting',
    longBreak: 'Resting & Recharging'
  };

  return (
    <div className="zen-overlay">
      <button className="nav-btn zen-exit-btn" onClick={onCloseZen}>
        <Minimize2 size={16} />
        <span>Exit Zen Mode</span>
      </button>

      {activeTask && (
        <div className="active-task-pill" style={{ marginBottom: '2rem' }}>
          <Target size={14} />
          <span>{activeTask.title}</span>
        </div>
      )}

      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '7.5rem',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'var(--text-primary)',
            textShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          {formatTime(timeLeft)}
        </div>
        <div
          style={{
            marginTop: '1rem',
            fontSize: '1.1rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)'
          }}
        >
          {modeLabels[mode]}
        </div>
      </div>

      <div className="timer-controls" style={{ marginTop: '2rem' }}>
        <button className="btn-secondary-ctrl" onClick={onReset} title="Reset">
          <RotateCcw size={18} />
        </button>

        <button
          className="btn-primary-play"
          style={{ width: '80px', height: '80px' }}
          onClick={isRunning ? onPause : onStart}
        >
          {isRunning ? <Pause size={34} /> : <Play size={34} style={{ marginLeft: '4px' }} />}
        </button>

        <button className="btn-secondary-ctrl" onClick={onSkip} title="Skip">
          <SkipForward size={18} />
        </button>
      </div>
    </div>
  );
}
