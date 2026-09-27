import React from 'react';
import { TrendingUp, Clock, ShieldCheck, Zap, DollarSign, Users, Award, BarChart3 } from 'lucide-react';
import { CohortMetrics } from '../types';

interface AnalyticsViewProps {
  metrics: CohortMetrics;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ metrics }) => {
  const resolvedCount = metrics.automated || 20;
  const pipelineValue = resolvedCount * 3540;

  return (
    <div className="view-container">
      {/* Top Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">Revenue Velocity & ROI Analytics</h2>
          <p className="view-subtitle">
            Autonomous performance metrics, human SDR labor displacement, and pipeline conversion velocity
          </p>
        </div>
        <div className="architecture-status-pill">
          <TrendingUp size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span>Real-time Telemetry Analytics</span>
        </div>
      </div>

      {/* 4 Top KPI Highlights */}
      <div className="analytics-kpi-grid">
        <div className="analytics-card">
          <div className="analytics-icon bg-emerald">
            <Clock size={20} />
          </div>
          <div>
            <div className="analytics-label">AVG RESPONSE LATENCY</div>
            <div className="analytics-value">2.4 Seconds</div>
            <div className="analytics-delta positive">↓ 99.9% vs. 48hr Human SDR</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-icon bg-blue">
            <Zap size={20} />
          </div>
          <div>
            <div className="analytics-label">AUTONOMOUS RESOLUTION</div>
            <div className="analytics-value">98.5%</div>
            <div className="analytics-delta positive">Closed-loop zero touch</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-icon bg-purple">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="analytics-label">TOTAL PIPELINE UNLOCKED</div>
            <div className="analytics-value">${pipelineValue.toLocaleString()}</div>
            <div className="analytics-delta positive">+38.4% Win-rate acceleration</div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-icon bg-amber">
            <Users size={20} />
          </div>
          <div>
            <div className="analytics-label">SDR LABOR HOURS SAVED</div>
            <div className="analytics-value">142 Hours / Mo</div>
            <div className="analytics-delta positive">$7,100 / Mo FTE Savings</div>
          </div>
        </div>
      </div>

      {/* Visual Comparison Charts */}
      <div className="charts-split-grid">
        {/* Chart 1: Turnaround Time Comparison (Human vs AI) */}
        <div className="chart-panel">
          <div className="chart-header">
            <h3>⚡ Response Turnaround Velocity</h3>
            <span className="chart-subtitle">Human SDR vs Graph8 Autopilot Flywheel</span>
          </div>

          <div className="bar-comparison-container">
            {/* Human Bar */}
            <div className="bar-group">
              <div className="bar-meta">
                <span>Traditional Human SDR Response</span>
                <span className="mono bar-val-text">2,880 mins (48 Hours)</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-human" style={{ width: '100%' }} />
              </div>
              <div className="bar-subtext">Leads cool down, competitors intervene, 65% drop-off</div>
            </div>

            {/* AI Flywheel Bar */}
            <div className="bar-group">
              <div className="bar-meta">
                <span className="highlight-green">Graph8 Autopilot Flywheel</span>
                <span className="mono bar-val-text highlight-green">0.04 mins (2.4 Seconds)</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill fill-ai" style={{ width: '2.5%' }} />
              </div>
              <div className="bar-subtext">Immediate Graph8 CRM action, quote issued, hot engagement</div>
            </div>
          </div>

          <div className="chart-footer-stat">
            <Award size={15} style={{ color: 'var(--accent-emerald)' }} />
            <span>
              <strong>1,200x Faster:</strong> Eliminates lead abandonment and guarantees instant engagement while the prospect is still at their desk.
            </span>
          </div>
        </div>

        {/* Chart 2: Pipeline Distribution by Gear */}
        <div className="chart-panel">
          <div className="chart-header">
            <h3>🎯 Pipeline Contribution by Gear</h3>
            <span className="chart-subtitle">Autonomous revenue split across the 3 execution engines</span>
          </div>

          <div className="gear-distribution-list">
            {/* Gear 3 */}
            <div className="dist-item">
              <div className="dist-info">
                <div className="dist-title">
                  <span className="dot dot-purple" />
                  <strong>Gear 3: CPQ Quote Closer</strong>
                </div>
                <div className="dist-metrics">
                  <span className="dist-pct">62%</span>
                  <span className="dist-amt">${Math.round(pipelineValue * 0.62).toLocaleString()}</span>
                </div>
              </div>
              <div className="dist-track">
                <div className="dist-fill bg-purple-fill" style={{ width: '62%' }} />
              </div>
            </div>

            {/* Gear 2 */}
            <div className="dist-item">
              <div className="dist-info">
                <div className="dist-title">
                  <span className="dot dot-blue" />
                  <strong>Gear 2: Step Mutator</strong>
                </div>
                <div className="dist-metrics">
                  <span className="dist-pct">24%</span>
                  <span className="dist-amt">${Math.round(pipelineValue * 0.24).toLocaleString()}</span>
                </div>
              </div>
              <div className="dist-track">
                <div className="dist-fill bg-blue-fill" style={{ width: '24%' }} />
              </div>
            </div>

            {/* Gear 1 */}
            <div className="dist-item">
              <div className="dist-info">
                <div className="dist-title">
                  <span className="dot dot-emerald" />
                  <strong>Gear 1: Referral Hunter</strong>
                </div>
                <div className="dist-metrics">
                  <span className="dist-pct">14%</span>
                  <span className="dist-amt">${Math.round(pipelineValue * 0.14).toLocaleString()}</span>
                </div>
              </div>
              <div className="dist-track">
                <div className="dist-fill bg-emerald-fill" style={{ width: '14%' }} />
              </div>
            </div>
          </div>

          <div className="chart-footer-stat">
            <BarChart3 size={15} style={{ color: 'var(--accent-blue)' }} />
            <span>
              <strong>Balanced Flywheel:</strong> The majority of immediate value comes from instant CPQ quotes, while referral hunting expands enterprise footprint.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
