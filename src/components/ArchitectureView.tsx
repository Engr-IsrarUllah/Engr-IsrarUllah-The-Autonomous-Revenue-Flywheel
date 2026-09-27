import React from 'react';
import { Users, RefreshCw, DollarSign, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="view-container">
      {/* Clean Header */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">The 3-Gear Autonomous Revenue Engine</h2>
          <p className="view-subtitle">
            How Graph8 Autopilot turns common customer objections into closed pipeline in under 3 seconds
          </p>
        </div>
        <div className="architecture-status-pill">
          <Sparkles size={14} style={{ color: 'var(--indigo)' }} />
          <span>Autonomous AI Orchestration</span>
        </div>
      </div>

      {/* 3 Executive Cards Side-by-Side */}
      <div className="gear-showcase-grid">
        {/* CARD 1: GEAR 1 */}
        <div className="gear-showcase-card">
          <div className="gear-card-header">
            <div className="gear-avatar icon-blue">
              <Users size={22} />
            </div>
            <div>
              <span className="gear-pill pill-blue">GEAR 1</span>
              <h3 className="gear-card-title">Referral Hunter</h3>
            </div>
          </div>

          <div className="gear-section">
            <span className="gear-section-label">CUSTOMER REPLY:</span>
            <div className="gear-quote quote-blue">
              "I'm not the right person for this, please reach out to our VP Sarah Miller."
            </div>
          </div>

          <div className="gear-section">
            <span className="gear-section-label">WHAT THE AI DOES:</span>
            <p className="gear-text">
              Extracts Sarah Miller's name and role, searches Graph8's <strong>300M+ contact directory</strong>, adds her to the CRM, and sends a warm email: <em>"Alex suggested I reach out..."</em>
            </p>
          </div>

          <div className="gear-footer">
            <div className="gear-metric">
              <span className="metric-label">BUSINESS VALUE:</span>
              <span className="metric-value">Recovers 100% of lost referral leads</span>
            </div>
            <div className="gear-tag-row">
              <span className="tech-tag">Graph8 Contact Search</span>
              <span className="tech-tag">CRM Auto-Provision</span>
            </div>
          </div>
        </div>

        {/* CARD 2: GEAR 2 */}
        <div className="gear-showcase-card highlight-card">
          <div className="gear-card-header">
            <div className="gear-avatar icon-purple">
              <RefreshCw size={22} />
            </div>
            <div>
              <span className="gear-pill pill-purple">GEAR 2</span>
              <h3 className="gear-card-title">Step Mutator</h3>
            </div>
          </div>

          <div className="gear-section">
            <span className="gear-section-label">CUSTOMER REPLY:</span>
            <div className="gear-quote quote-purple">
              "We already use Apollo and your tool seems too expensive for our team."
            </div>
          </div>

          <div className="gear-section">
            <span className="gear-section-label">WHAT THE AI DOES:</span>
            <p className="gear-text">
              Detects Apollo and the price objection. Automatically <strong>rewrites the scheduled future emails</strong> in Graph8 to present a direct Apollo battlecard and 300% ROI guarantee.
            </p>
          </div>

          <div className="gear-footer">
            <div className="gear-metric">
              <span className="metric-label">BUSINESS VALUE:</span>
              <span className="metric-value">Automated competitor rebuttal on the fly</span>
            </div>
            <div className="gear-tag-row">
              <span className="tech-tag">Sequence Step Mutator</span>
              <span className="tech-tag">ROI Battlecard</span>
            </div>
          </div>
        </div>

        {/* CARD 3: GEAR 3 */}
        <div className="gear-showcase-card">
          <div className="gear-card-header">
            <div className="gear-avatar icon-emerald">
              <DollarSign size={22} />
            </div>
            <div>
              <span className="gear-pill pill-emerald">GEAR 3</span>
              <h3 className="gear-card-title">CPQ Quote Closer</h3>
            </div>
          </div>

          <div className="gear-section">
            <span className="gear-section-label">CUSTOMER REPLY:</span>
            <div className="gear-quote quote-emerald">
              "Looks great, send me a formal pricing quote for 25 seats so we can buy."
            </div>
          </div>

          <div className="gear-section">
            <span className="gear-section-label">WHAT THE AI DOES:</span>
            <p className="gear-text">
              Calculates the exact pricing, triggers Graph8's CPQ engine to generate a digital proposal with a <strong>live Stripe payment link</strong>, and delivers it to the customer in 3 seconds.
            </p>
          </div>

          <div className="gear-footer">
            <div className="gear-metric">
              <span className="metric-label">BUSINESS VALUE:</span>
              <span className="metric-value">Closes deals while buying intent is peak</span>
            </div>
            <div className="gear-tag-row">
              <span className="tech-tag">Graph8 CPQ Quotes</span>
              <span className="tech-tag">Stripe Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
