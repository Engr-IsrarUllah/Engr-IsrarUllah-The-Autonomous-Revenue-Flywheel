import React, { useState } from 'react';
import { TrendingUp, Clock, Zap, DollarSign, Users, Award, BarChart3, ArrowUpRight } from 'lucide-react';
import { CohortMetrics } from '../types';

interface AnalyticsViewProps {
  metrics: CohortMetrics;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ metrics }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const resolvedCount = metrics.automated || 20;
  const pipelineValue = resolvedCount * 3540;

  const dataPoints = [
    { day: 'Launch', value: 0, label: '$0', milestone: 'Campaign Dispatched (20 accounts)' },
    { day: 'Day 1', value: 12400, label: '$12,400', milestone: 'Gear 1: Stakeholders Discovered & Enrolled' },
    { day: 'Day 2', value: 29800, label: '$29,800', milestone: 'Gear 2: Sequence Step Live-Mutated' },
    { day: 'Day 3', value: 52100, label: '$52,100', milestone: 'Inbound Buying Signals Classified' },
    { day: 'Day 4 (Today)', value: pipelineValue, label: `$${pipelineValue.toLocaleString()}`, milestone: 'Gear 3: CPQ Quotes & Stripe E-Signs Delivered' },
  ];

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

      {/* NEW: Stripe-Style Revenue Acceleration SVG Curve */}
      <div className="chart-panel curve-panel">
        <div className="curve-header-row">
          <div>
            <div className="curve-badge">
              <TrendingUp size={13} />
              <span>PIPELINE ACCELERATION TRAJECTORY</span>
            </div>
            <h3 className="curve-title">Cumulative Deal Value Over Cohort Lifecycle</h3>
          </div>

          <div className="curve-legend">
            <div className="legend-item">
              <span className="legend-line line-ai" />
              <span>Graph8 Autopilot (${pipelineValue.toLocaleString()})</span>
            </div>
            <div className="legend-item">
              <span className="legend-line line-human" />
              <span>Manual SDR Baseline ($14,160)</span>
            </div>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="svg-chart-wrapper">
          <svg viewBox="0 0 740 220" className="revenue-svg" preserveAspectRatio="none">
            <defs>
              {/* Gradient for AI curve fill */}
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            <line x1="60" y1="20" x2="720" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
            <text x="15" y="24" className="axis-text">$75k</text>

            <line x1="60" y1="75" x2="720" y2="75" stroke="#f1f5f9" strokeDasharray="3 3" />
            <text x="15" y="79" className="axis-text">$50k</text>

            <line x1="60" y1="130" x2="720" y2="130" stroke="#f1f5f9" strokeDasharray="3 3" />
            <text x="15" y="134" className="axis-text">$25k</text>

            <line x1="60" y1="185" x2="720" y2="185" stroke="#e2e8f0" />
            <text x="25" y="189" className="axis-text">$0</text>

            {/* Manual Human Baseline (Dashed Red Line) */}
            <path
              d="M 80 185 C 220 180, 450 165, 700 152"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity="0.7"
            />

            {/* AI Gradient Fill Area */}
            <path
              d="M 80 185 C 220 160, 360 120, 520 65 S 640 35, 700 28 L 700 185 Z"
              fill="url(#curveGradient)"
            />

            {/* AI Smooth Primary Line */}
            <path
              d="M 80 185 C 220 160, 360 120, 520 65 S 640 35, 700 28"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Data Points */}
            <circle cx="80" cy="185" r="4.5" className="chart-dot dot-idle" />
            <circle cx="230" cy="158" r="5" className="chart-dot dot-active" />
            <circle cx="390" cy="116" r="5" className="chart-dot dot-active" />
            <circle cx="540" cy="62" r="5" className="chart-dot dot-active" />
            <circle cx="700" cy="28" r="6.5" className="chart-dot dot-peak" />
          </svg>

          {/* Bottom Milestone Labels */}
          <div className="timeline-labels-row">
            {dataPoints.map((dp, i) => (
              <div
                key={i}
                className={`timeline-col ${hoveredPoint === i ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <div className="point-amt">{dp.label}</div>
                <div className="point-day">{dp.day}</div>
                <div className="point-milestone">{dp.milestone}</div>
              </div>
            ))}
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
