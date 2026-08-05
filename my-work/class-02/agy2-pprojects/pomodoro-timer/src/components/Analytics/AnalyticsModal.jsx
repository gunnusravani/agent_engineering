import React from 'react';
import { X, Flame, Clock, CheckCircle, Trophy, Calendar } from 'lucide-react';
import { calculateStats, formatTimeAgo, formatDate } from '../../utils/helpers';

export default function AnalyticsModal({ isOpen, onClose, history, dailyGoalMinutes }) {
  if (!isOpen) return null;

  const stats = calculateStats(history, dailyGoalMinutes);
  const maxMins = Math.max(...stats.weekData.map((d) => d.minutes), 60);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Trophy className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
            <h2 className="modal-title">Productivity Insights</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-value">{stats.todayMinutes}m</div>
            <div className="stat-label">Focused Today</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
              <Flame size={18} fill="currentColor" /> {stats.streak}
            </div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{stats.totalSessions}</div>
            <div className="stat-label">Completed Sessions</div>
          </div>
        </div>

        {/* Daily Goal Bar */}
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '0.9rem', marginBottom: '1.5rem', border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Daily Target ({dailyGoalMinutes} min)</span>
            <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{stats.goalPercentage}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${stats.goalPercentage}%`,
                background: 'var(--accent-color)',
                borderRadius: '4px',
                transition: 'width 0.6s ease'
              }}
            />
          </div>
        </div>

        {/* Weekly Bar Chart */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Focus Breakdown (Last 7 Days)
          </h3>

          <div className="chart-bar-container">
            {stats.weekData.map((d, idx) => {
              const heightPercent = (d.minutes / maxMins) * 100;
              return (
                <div key={idx} className={`chart-bar-col ${d.isToday ? 'today' : ''}`}>
                  <div
                    className="chart-bar-fill"
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    title={`${d.day}: ${d.minutes} mins`}
                  />
                  <div className="chart-bar-label">{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Session History */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} />
            <span>Recent Session Log</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {history.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                No completed sessions logged yet. Complete a focus session to build your history!
              </div>
            ) : (
              history.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.85rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '0.6rem',
                    border: '1px solid var(--card-border)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {session.taskTitle ? session.taskTitle : 'Focus Session'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                      ({session.durationMinutes || 25} min)
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatTimeAgo(session.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
