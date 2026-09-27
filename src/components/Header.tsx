import React from 'react';
import { Send, CheckCircle2, RotateCcw, Edit3, Zap, GitBranch, BarChart3 } from 'lucide-react';

export type DashboardTab = 'cockpit' | 'analytics';

interface HeaderProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  selectedCount: number;
  isSending: boolean;
  isResolving: boolean;
  onOpenCompose: () => void;
  onSendCampaign: () => void;
  onResolveAll: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedCount,
  isSending,
  isResolving,
  onOpenCompose,
  onSendCampaign,
  onResolveAll,
  onReset,
}) => {
  return (
    <header className="app-header">
      {/* Left: Brand Logo & Title */}
      <div className="header-brand">
        <div className="brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
        <div>
          <div className="brand-title">
            Graph8 <span className="brand-tag">AUTOPILOT</span>
          </div>
          <div className="brand-desc">
            Autonomous Revenue Flywheel
          </div>
        </div>
      </div>

      {/* Center: View Navigation Tabs */}
      <div className="header-nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'cockpit' ? 'active' : ''}`}
          onClick={() => onTabChange('cockpit')}
        >
          <Zap size={13} />
          <span>Live Cockpit</span>
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
        >
          <BarChart3 size={13} />
          <span>ROI & Analytics</span>
        </button>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="header-actions">
        <div className="system-status-indicator">
          <span className="status-indicator-dot online" />
          <span className="status-indicator-label">Graph8 Connected</span>
        </div>

        <div className="header-btn-group">
          <button className="btn-secondary" onClick={onOpenCompose} title="Compose custom email">
            <Edit3 size={13} />
            <span>Template</span>
          </button>

          <button
            className="btn-primary"
            onClick={onSendCampaign}
            disabled={isSending || selectedCount === 0}
          >
            <Send size={13} />
            <span>{isSending ? 'Sending...' : `Send (${selectedCount})`}</span>
          </button>

          <button
            className="btn-resolve"
            onClick={onResolveAll}
            disabled={isResolving}
          >
            <CheckCircle2 size={13} />
            <span>{isResolving ? 'Resolving...' : 'Process Inbound'}</span>
          </button>

          <button className="btn-secondary" onClick={onReset} title="Reset cohort to default">
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </header>
  );
};
