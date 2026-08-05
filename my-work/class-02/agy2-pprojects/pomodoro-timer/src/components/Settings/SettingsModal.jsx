import React from 'react';
import { X, Palette, Bell, Volume2, Check } from 'lucide-react';
import { playChime } from '../../utils/soundEngine';

export default function SettingsModal({ isOpen, onClose, settings, onSaveSettings }) {
  if (!isOpen) return null;

  const handleChange = (key, value) => {
    onSaveSettings({
      ...settings,
      [key]: value
    });
  };

  const themes = [
    { id: 'sage', name: 'Sage Sanctuary', color: '#84a98c' },
    { id: 'dusk', name: 'Misty Dusk', color: '#9d8ed9' },
    { id: 'sand', name: 'Warm Sand', color: '#e09f7b' },
    { id: 'midnight', name: 'Midnight Zen', color: '#4ecdca' }
  ];

  const chimes = [
    { id: 'singing-bowl', name: 'Singing Bowl' },
    { id: 'gentle-chime', name: 'Gentle Chime' },
    { id: 'warm-gong', name: 'Warm Gong' }
  ];

  const testChime = (chimeId) => {
    playChime(chimeId, settings.volume || 0.7);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Settings & Themes</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Theme Picker */}
        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Palette size={16} />
            <span>Aesthetic Theme</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            {themes.map((th) => (
              <button
                key={th.id}
                type="button"
                className={`sound-btn ${settings.theme === th.id ? 'active' : ''}`}
                onClick={() => handleChange('theme', th.id)}
                style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
              >
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: th.color,
                    display: 'inline-block'
                  }}
                />
                <span style={{ fontSize: '0.85rem' }}>{th.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timer Durations */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ marginBottom: '0.75rem' }}>
            Timer Durations (minutes)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Focus</span>
              <input
                type="number"
                min="1"
                max="120"
                className="form-input"
                value={settings.focusDuration}
                onChange={(e) => handleChange('focusDuration', Number(e.target.value))}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Short Break</span>
              <input
                type="number"
                min="1"
                max="60"
                className="form-input"
                value={settings.shortBreakDuration}
                onChange={(e) => handleChange('shortBreakDuration', Number(e.target.value))}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Long Break</span>
              <input
                type="number"
                min="1"
                max="60"
                className="form-input"
                value={settings.longBreakDuration}
                onChange={(e) => handleChange('longBreakDuration', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Chime & Audio Sound */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bell size={16} />
            <span>Completion Chime</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '0.75rem' }}>
            {chimes.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`sound-btn ${settings.chimeSound === c.id ? 'active' : ''}`}
                onClick={() => {
                  handleChange('chimeSound', c.id);
                  testChime(c.id);
                }}
                style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem' }}
              >
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          <div className="volume-slider-group">
            <Volume2 size={16} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              className="slider-input"
              value={settings.volume}
              onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
            />
            <span style={{ fontSize: '0.75rem', width: '30px' }}>
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
        </div>

        {/* Ticking sound option */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label className="form-label" style={{ marginBottom: 0 }}>Soft Ticking Sound</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gentle tick on every second</span>
          </div>
          <input
            type="checkbox"
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            checked={settings.tickingSound}
            onChange={(e) => handleChange('tickingSound', e.target.checked)}
          />
        </div>

        {/* Auto start options */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label className="form-label" style={{ marginBottom: 0 }}>Auto-start Breaks</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automatically start break timer when focus completes</span>
          </div>
          <input
            type="checkbox"
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            checked={settings.autoStartBreaks}
            onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label className="form-label" style={{ marginBottom: 0 }}>Auto-start Focus</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automatically start focus session when break completes</span>
          </div>
          <input
            type="checkbox"
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            checked={settings.autoStartFocus}
            onChange={(e) => handleChange('autoStartFocus', e.target.checked)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="nav-btn active" onClick={onClose}>
            <Check size={16} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
