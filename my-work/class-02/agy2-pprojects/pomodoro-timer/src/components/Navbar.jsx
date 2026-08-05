import React from 'react';
import { Compass, BarChart3, Settings, Maximize2, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenAnalytics, onOpenSettings, onToggleZen, currentTheme }) {
  return (
    <header className="navbar glass-card">
      <div className="brand-logo">
        <Compass className="w-6 h-6" />
        <span>Serene Space</span>
      </div>

      <div className="nav-actions">
        <button 
          className="nav-btn" 
          onClick={onToggleZen} 
          title="Enter Zen Mode (Distraction Free)"
        >
          <Maximize2 size={16} />
          <span>Zen</span>
        </button>

        <button 
          className="nav-btn" 
          onClick={onOpenAnalytics}
          title="View Productivity Insights"
        >
          <BarChart3 size={16} />
          <span>Stats</span>
        </button>

        <button 
          className="nav-btn" 
          onClick={onOpenSettings}
          title="Settings & Themes"
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
