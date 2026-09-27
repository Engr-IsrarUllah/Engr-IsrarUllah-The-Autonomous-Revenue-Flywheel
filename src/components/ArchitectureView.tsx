import React, { useState } from 'react';
import { Database, Zap, GitBranch, ArrowRight, ShieldCheck, Mail, CheckCircle2, DollarSign, RefreshCw, Cpu } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeGear, setActiveGear] = useState<1 | 2 | 3>(1);

  return (
    <div className="view-container">
      {/* Top Header Section */}
      <div className="view-header-row">
        <div>
          <h2 className="view-title">System Architecture & Event Topology</h2>
          <p className="view-subtitle">
            Closed-loop autonomous state machine connecting Graph8 REST APIs with Gemini 2.5 Flash reasoning
          </p>
        </div>
        <div className="architecture-status-pill">
          <span className="status-indicator-dot online" />
          <span>Graph8 Live REST API · 4 Endpoints Bound</span>
        </div>
      </div>

      {/* Interactive Topology Diagram */}
      <div className="topology-card">
        <div className="topology-pipeline">
          {/* Node 1: Inbound Webhook */}
          <div className="topology-node">
            <div className="node-icon bg-blue">
              <Mail size={18} />
            </div>
            <div className="node-title">Inbound Reply</div>
            <div className="node-meta">Graph8 Mailbox SSE</div>
            <div className="node-badge">Telemetry Stream</div>
          </div>

          <div className="topology-connector">
            <ArrowRight size={16} className="connector-arrow" />
          </div>

          {/* Node 2: Gemini AI Classifier */}
          <div className="topology-node highlight-ai">
            <div className="node-icon bg-violet">
              <Cpu size={18} />
            </div>
            <div className="node-title">Gemini 2.5 Flash</div>
            <div className="node-meta">LangGraph Classifier</div>
            <div className="node-badge ai-badge">~420ms Latency</div>
          </div>

          <div className="topology-connector">
            <ArrowRight size={16} className="connector-arrow" />
          </div>

          {/* Node 3: 3-Gear Multiplexer */}
          <div className="topology-node node-gears-cluster">
            <div className="gear-cluster-header">
              <GitBranch size={16} />
              <span>3-Gear Dynamic Router</span>
            </div>
            <div className="gear-buttons">
              <button
                className={`gear-btn ${activeGear === 1 ? 'active' : ''}`}
                onClick={() => setActiveGear(1)}
              >
                ⚙️ Gear 1: Referral
              </button>
              <button
                className={`gear-btn ${activeGear === 2 ? 'active' : ''}`}
                onClick={() => setActiveGear(2)}
              >
                ⚙️ Gear 2: Step Mutator
              </button>
              <button
                className={`gear-btn ${activeGear === 3 ? 'active' : ''}`}
                onClick={() => setActiveGear(3)}
              >
                ⚙️ Gear 3: CPQ Closer
              </button>
            </div>
          </div>

          <div className="topology-connector">
            <ArrowRight size={16} className="connector-arrow" />
          </div>

          {/* Node 4: Graph8 CRM Settlement */}
          <div className="topology-node">
            <div className="node-icon bg-emerald">
              <Database size={18} />
            </div>
            <div className="node-title">Graph8 Settlement</div>
            <div className="node-meta">Closed-Loop CRM</div>
            <div className="node-badge success-badge">200 OK Live</div>
          </div>
        </div>
      </div>

      {/* Detailed Gear Deep-Dive Inspector */}
      <div className="gear-inspector-grid">
        {/* Left: Gear Summary Card */}
        <div className="inspector-card">
          <div className="inspector-header">
            <span className="gear-tag">ACTIVE GEAR {activeGear} DEEP DIVE</span>
            <h3>
              {activeGear === 1 && 'Gear 1 — The Referral Hunter'}
              {activeGear === 2 && 'Gear 2 — The Sequence Step Mutator'}
              {activeGear === 3 && 'Gear 3 — The Autonomous CPQ Closer'}
            </h3>
          </div>

          <div className="inspector-body">
            <p className="gear-desc">
              {activeGear === 1 &&
                'Triggered when the prospect replies that they are not the appropriate stakeholder. The engine extracts the referred name, cross-references Graph8’s 300M+ global contact index, verifies their corporate email, and automatically inserts them into the CRM.'}
              {activeGear === 2 &&
                'Triggered when a lead presents a competitor objection (e.g. Apollo, ZoomInfo) or price pushback. Rather than sending static follow-up emails, the engine calls Graph8’s sequence mutation endpoint to live-rewrite upcoming campaign copy with ROI battlecards.'}
              {activeGear === 3 &&
                'Triggered when buying intent or quote requests are detected. The engine calculates seat tiers, terms, and discounts, invokes Graph8’s CPQ API to issue a digital proposal, and returns a verified Stripe checkout link in under 3 seconds.'}
            </p>

            <div className="specs-list">
              <div className="spec-row">
                <span className="spec-label">Graph8 API Tools:</span>
                <span className="spec-val mono">
                  {activeGear === 1 && 'POST /api/v1/search/contacts · POST /api/v1/contacts'}
                  {activeGear === 2 && 'PATCH /api/v1/sequences/:id/steps/:id'}
                  {activeGear === 3 && 'POST /api/v1/quotes · POST /api/v1/inbox/reply'}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Execution Latency:</span>
                <span className="spec-val highlight-green">
                  {activeGear === 1 && '1.84s (End-to-End)'}
                  {activeGear === 2 && '1.22s (Instant Mutation)'}
                  {activeGear === 3 && '2.10s (Quote & E-sign Generated)'}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Human SDR Time Saved:</span>
                <span className="spec-val">
                  {activeGear === 1 && '20 mins per referral lookup'}
                  {activeGear === 2 && '35 mins copy customization'}
                  {activeGear === 3 && '45 mins pricing approval & quote building'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Raw API Request & Payload Inspector */}
        <div className="inspector-card json-card">
          <div className="inspector-header">
            <span className="gear-tag">GRAPH8 API TELEMETRY PAYLOAD</span>
            <span className="json-status">Status: 200 OK</span>
          </div>
          <pre className="json-code">
            {activeGear === 1 &&
              JSON.stringify(
                {
                  action: 'g8_search_contacts_and_create',
                  query: {
                    name: 'Sarah Miller',
                    company: 'Stripe',
                    role: 'VP Marketing'
                  },
                  graph8_directory_result: {
                    status: 'found_in_300M_index',
                    verified_email: 'sarah.miller@stripe.com',
                    confidence_score: 0.98
                  },
                  crm_action: {
                    endpoint: 'POST /api/v1/contacts',
                    status: 'created',
                    sequence_enroll: '81257cc3-e7fb-4274-a1d5-786f48cd713e'
                  }
                },
                null,
                2
              )}

            {activeGear === 2 &&
              JSON.stringify(
                {
                  action: 'g8_gtm_update_campaign_step',
                  sequenceId: '81257cc3-e7fb-4274-a1d5-786f48cd713e',
                  stepId: '32fe95ad-a791-4fce-9d40-145d0f98bd40',
                  mutation_strategy: 'COMPETITOR_CONSOLIDATION_300_ROI',
                  patch_payload: {
                    subject: 'Quick question re: Apollo consolidation at {{Company}}',
                    body: 'Noticed your note regarding Apollo. Most engineering teams switch to Graph8 because it combines 300M+ data with autonomous closed-loop execution. We guarantee a 300% ROI in 60 days.',
                    updatedAt: new Date().toISOString()
                  },
                  audit_response: '200 OK - Step live-mutated across 20 cohort recipients'
                },
                null,
                2
              )}

            {activeGear === 3 &&
              JSON.stringify(
                {
                  action: 'g8_create_quote',
                  prospect: 'Emily Watson (Figma)',
                  parameters: {
                    seats: 25,
                    tier: 'Enterprise RevOps Platform',
                    annualDiscount: '15%',
                    totalAmountUSD: 2475
                  },
                  quote_engine_output: {
                    quoteId: 'g8_qt_9481b7a2',
                    status: 'issued',
                    checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_live_g8_revops_flywheel_demo',
                    eSignatureRequired: true
                  },
                  delivery: 'Automated email dispatched via Graph8 mailbox'
                },
                null,
                2
              )}
          </pre>
        </div>
      </div>
    </div>
  );
};
