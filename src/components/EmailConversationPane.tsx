import React from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { CohortProspect } from '../types';

interface EmailConversationPaneProps {
  lead: CohortProspect | null;
  onRunAgent: (leadId: string) => void;
  isRunningAgent: boolean;
}

export const EmailConversationPane: React.FC<EmailConversationPaneProps> = ({
  lead,
  onRunAgent,
  isRunningAgent,
}) => {
  if (!lead) {
    return (
      <div className="panel-card conversation-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Select a prospect from the list to view conversation</p>
      </div>
    );
  }

  let statusBadgeText = lead.status.toUpperCase();
  let statusBadgeClass = `badge-${lead.status}`;
  if (lead.status === 'draft') {
    statusBadgeText = 'READY';
    statusBadgeClass = 'badge-draft';
  } else if (lead.status === 'replied') {
    statusBadgeText = 'REPLIED';
    statusBadgeClass = 'badge-replied';
  } else if (lead.status === 'automated') {
    statusBadgeText = 'RESOLVED';
    statusBadgeClass = 'badge-automated';
  } else if (lead.status === 'delivered') {
    statusBadgeText = 'DELIVERED';
    statusBadgeClass = 'badge-delivered';
  }

  let intentText = 'INBOUND RESPONSE';
  if (lead.replyCategory === 'WRONG_PERSON') intentText = 'REFERRAL / ALTERNATE STAKEHOLDER';
  else if (lead.replyCategory === 'PRICE_OBJECTION') intentText = 'COMPETITOR & BUDGET OBJECTION';
  else if (lead.replyCategory === 'THIRD_PERSON_QUOTE') intentText = 'PURCHASE REQUEST / QUOTE';

  const res = lead.agentResolution;
  const gen = res?.generatedEmail;

  let proofText = 'Action completed successfully via Graph8 REST API.';
  if (res?.gear === 1) {
    proofText = `Contact (${gen?.toName || 'Stakeholder'}) discovered in 300M+ directory, provisioned in Graph8 CRM, and scheduled for warm referral cadence.`;
  } else if (res?.gear === 2) {
    proofText = `Sequence Step #32fe95ad live-mutated in Graph8 with 300% ROI guarantee and competitor consolidation pitch.`;
  } else if (res?.gear === 3) {
    proofText = `Graph8 CPQ Quote created with verified Stripe e-sign checkout URL and sent to ${gen?.toName || lead.name}.`;
  }

  const hasEmailSent = Boolean(lead.outboundSentAt || lead.outboundBody);

  return (
    <div className="panel-card conversation-card">
      {/* Header */}
      <div className="convo-header">
        <div className="convo-user-meta">
          <div className="convo-avatar">{lead.avatar || 'AR'}</div>
          <div>
            <h3>{lead.name}</h3>
            <div className="convo-user-sub">
              {lead.title} · {lead.company} &lt;{lead.email}&gt;
            </div>
          </div>
        </div>

        <div className="convo-status-actions">
          <span className={`status-badge-lg ${statusBadgeClass}`}>{statusBadgeText}</span>

          {lead.status === 'replied' && !res && (
            <button
              className="btn-run-agent"
              onClick={() => onRunAgent(lead.id)}
              disabled={isRunningAgent}
            >
              <CheckCircle2 size={13} />
              <span>{isRunningAgent ? 'Processing...' : 'Process Reply'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Step Email Thread View */}
      <div className="convo-thread-scroll">
        {!hasEmailSent ? (
          <div className="convo-empty-state">
            <div className="empty-icon-circle">
              <Mail size={26} />
            </div>
            <h4>No Email Activity Yet</h4>
            <p>
              This prospect is queued in your audience. Click <strong>Send</strong> in the navigation bar to dispatch the outbound campaign sequence.
            </p>
          </div>
        ) : (
          <>
            {/* STEP 1: OUTBOUND EMAIL */}
            <div className="thread-bubble sent-bubble">
              <div className="bubble-header">
                <div className="bubble-type-tag tag-sent">
                  <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Step 1: Outbound Sequence Email
                </div>
                <div className="bubble-time">{lead.outboundSentAt || 'Just now'}</div>
              </div>
              <div className="bubble-meta">
                <div>
                  <strong>From:</strong> Israr Khan &lt;israr@graph8.io&gt;
                </div>
                <div>
                  <strong>To:</strong> {lead.name} &lt;{lead.email}&gt;
                </div>
                <div>
                  <strong>Subject:</strong> {lead.outboundSubject}
                </div>
              </div>
              <div className="bubble-body">{lead.outboundBody}</div>
            </div>

            {/* STEP 2: INBOUND REPLY */}
            {lead.replyText && (
              <div className="thread-bubble reply-bubble">
                <div className="bubble-header">
                  <div className="bubble-type-tag tag-reply">Step 2: Customer Reply Received</div>
                  <div className="bubble-time">{lead.replyReceivedAt || 'Today'}</div>
                </div>
                <div className="bubble-meta">
                  <div>
                    <strong>From:</strong> {lead.name} &lt;{lead.email}&gt;
                  </div>
                  <div className="intent-row">
                    <strong>Classification:</strong>
                    <span className="intent-badge">{intentText}</span>
                  </div>
                </div>
                <div className="bubble-body reply-quote">"{lead.replyText}"</div>
              </div>
            )}

            {/* Waiting for reply */}
            {!lead.replyText && (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Outbound email delivered. Awaiting customer reply...
              </div>
            )}

            {/* STEP 3: AUTOMATED RESOLUTION & CRM ACTION */}
            {res && gen && (
              <div className="thread-bubble agent-bubble">
                <div className="bubble-header">
                  <div className="bubble-type-tag tag-agent">
                    <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Step 3: Autonomous Resolution & CRM Action
                  </div>
                  <div className="bubble-time">{gen.sentAt || 'Today'}</div>
                </div>

                {/* Strategy and Audit Metadata */}
                <div className="agent-brain-panel">
                  <div className="brain-item">
                    <span className="b-label">GRAPH8 ACTION:</span>
                    <span className="b-val mono">{res.mcpTool}</span>
                  </div>
                  <div className="brain-item">
                    <span className="b-label">RESOLUTION TYPE:</span>
                    <span className="b-val">{res.gearName}</span>
                  </div>
                  <div className="brain-item full-width">
                    <span className="b-label">REASONING & CONTEXT:</span>
                    <span className="b-desc">{res.reasoning}</span>
                  </div>
                </div>

                {/* Formulated Email */}
                <div className="agent-email-box">
                  <div className="agent-email-meta">
                    <div>
                      <strong>TO:</strong> {gen.to} ({gen.toName})
                    </div>
                    <div>
                      <strong>SUBJECT:</strong> {gen.subject}
                    </div>
                    <div>
                      <strong>TEMPLATE TYPE:</strong>{' '}
                      <span className="agent-type-pill">{gen.emailType}</span>
                    </div>
                  </div>
                  <div className="agent-email-body">{gen.body}</div>
                </div>

                {/* CRM Execution Audit */}
                <div className="agent-proof-box">
                  <div className="proof-label">CRM AUDIT:</div>
                  <div className="proof-text">{proofText}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
