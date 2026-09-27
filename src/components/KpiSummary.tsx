import React from 'react';
import { Users, MailOpen, CheckCircle2, DollarSign } from 'lucide-react';
import { CohortMetrics } from '../types';

interface KpiSummaryProps {
  metrics: CohortMetrics;
  pipelineValue?: string;
}

export const KpiSummary: React.FC<KpiSummaryProps> = ({
  metrics,
  pipelineValue,
}) => {
  const displayPipelineValue =
    pipelineValue !== undefined
      ? pipelineValue
      : metrics.automated > 0
      ? `$${(metrics.automated * 3540).toLocaleString()}`
      : '$0';
  return (
    <section className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-icon icon-blue">
          <Users size={18} />
        </div>
        <div>
          <div className="kpi-label">PROSPECTS</div>
          <div className="kpi-value">{metrics.total}</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon icon-amber">
          <MailOpen size={18} />
        </div>
        <div>
          <div className="kpi-label">INBOUND REPLIES</div>
          <div className="kpi-value">{metrics.replied}</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon icon-emerald">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <div className="kpi-label">RESOLVED</div>
          <div className="kpi-value">{metrics.automated}</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon icon-purple">
          <DollarSign size={18} />
        </div>
        <div>
          <div className="kpi-label">PIPELINE VALUE</div>
          <div className="kpi-value">{displayPipelineValue}</div>
        </div>
      </div>
    </section>
  );
};
