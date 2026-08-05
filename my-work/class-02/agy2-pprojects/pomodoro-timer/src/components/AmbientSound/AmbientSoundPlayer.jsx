import React from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Wind, Sparkles } from 'lucide-react';
import { setAmbientSound, updateAmbientVolume } from '../../utils/soundEngine';

export default function AmbientSoundPlayer({ ambientSound, ambientVolume, onChangeSound, onChangeVolume }) {
  const soundTypes = [
    { id: 'none', label: 'Off', icon: VolumeX },
    { id: 'rain', label: 'Soft Rain', icon: CloudRain },
    { id: 'ocean', label: 'Ocean Waves', icon: Waves },
    { id: 'noise', label: 'Pink Noise', icon: Wind },
    { id: 'zen', label: 'Zen Drone', icon: Sparkles }
  ];

  const handleSelectSound = (id) => {
    onChangeSound(id);
    setAmbientSound(id, ambientVolume);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    onChangeVolume(newVol);
    updateAmbientVolume(newVol);
  };

  return (
    <div className="ambient-card glass-card">
      <div className="section-title" style={{ fontSize: '1.05rem' }}>
        <Volume2 size={18} />
        <span>Ambient Soundscape</span>
      </div>

      <div className="sound-options-grid">
        {soundTypes.map((item) => {
          const Icon = item.icon;
          const isActive = ambientSound === item.id;
          return (
            <button
              key={item.id}
              className={`sound-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectSound(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {ambientSound !== 'none' && (
        <div className="volume-slider-group">
          <Volume2 size={16} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            className="slider-input"
            value={ambientVolume}
            onChange={handleVolumeChange}
          />
          <span style={{ fontSize: '0.75rem', width: '30px' }}>
            {Math.round(ambientVolume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
