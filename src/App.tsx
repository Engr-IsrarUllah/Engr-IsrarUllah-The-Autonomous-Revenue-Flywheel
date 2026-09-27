import React, { useState, useEffect, useCallback } from 'react';
import { Header, DashboardTab } from './components/Header';
import { KpiSummary } from './components/KpiSummary';
import { ProspectsList } from './components/ProspectsList';
import { EmailConversationPane } from './components/EmailConversationPane';
import { EmailComposeModal } from './components/EmailComposeModal';
import { TelemetryLog } from './components/TelemetryLog';
import { ArchitectureView } from './components/ArchitectureView';
import { AnalyticsView } from './components/AnalyticsView';
import { CohortProspect, CohortMetrics, FlywheelEvent } from './types';
import './index.css';

const DEFAULT_TEMPLATE = {
  subject: 'Streamlining outbound pipeline infrastructure at {{Company}}',
  body: 'Hi {{First_Name}}, noticed {{Company}} is scaling engineering headcount. Teams typically struggle with siloed SDR tools and manual data lookups. Are you looking to streamline outbound revops this quarter?',
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('cockpit');
  const [cohort, setCohort] = useState<CohortProspect[]>([]);
  const [metrics, setMetrics] = useState<CohortMetrics>({
    total: 20,
    selected: 20,
    delivered: 0,
    replied: 0,
    automated: 0,
  });
  const [selectedLeadId, setSelectedLeadId] = useState<string>('lead-1');
  const [activeFilter, setActiveFilter] = useState<'all' | 'replied' | 'delivered' | 'automated'>('all');
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [logs, setLogs] = useState<FlywheelEvent[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [config, setConfig] = useState({ sequenceId: '81257cc3', stepId: '32fe95ad' });

  // 1. Fetch Cohort Data
  const fetchCohort = useCallback(async () => {
    try {
      const res = await fetch('/api/cohort');
      const data = await res.json();
      if (data.cohort) {
        setCohort(data.cohort);
        setMetrics({
          total: data.cohort.length,
          selected: data.cohort.filter((p: CohortProspect) => p.selected).length,
          delivered: data.cohort.filter((p: CohortProspect) => p.status === 'delivered').length,
          replied: data.cohort.filter((p: CohortProspect) => p.status === 'replied').length,
          automated: data.cohort.filter((p: CohortProspect) => p.status === 'automated').length,
        });
      }
      if (data.config) {
        setConfig({
          sequenceId: data.config.sequenceId || '81257cc3',
          stepId: data.config.stepId || '32fe95ad',
        });
      }
    } catch (err) {
      console.warn('Failed to fetch cohort:', err);
    }
  }, []);

  useEffect(() => {
    fetchCohort();
  }, [fetchCohort]);

  // 2. Real-Time SSE Stream Listener
  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload: FlywheelEvent = JSON.parse(event.data);
        setLogs((prev) => [...prev.slice(-100), payload]);

        // If event indicates state change, refresh cohort
        if (
          payload.stage === 'COMPLETED' ||
          payload.stage === 'MUTATED' ||
          payload.stage === 'CPQ_SENT' ||
          payload.stage === 'GEAR1_REFERRAL' ||
          payload.stage === 'CLASSIFIED'
        ) {
          fetchCohort();
        }
      } catch (e) {
        console.warn('SSE parse error:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [fetchCohort]);

  // 3. Selection Handlers
  const handleToggleCheckbox = async (id: string, checked: boolean) => {
    setCohort((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, selected: checked } : lead))
    );
    try {
      await fetch('/api/cohort/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, selected: checked }),
      });
      fetchCohort();
    } catch (err) {
      console.warn('Toggle selection error:', err);
    }
  };

  const handleToggleSelectAll = async (checked: boolean) => {
    setCohort((prev) => prev.map((lead) => ({ ...lead, selected: checked })));
    try {
      await fetch('/api/cohort/select-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: checked }),
      });
      fetchCohort();
    } catch (err) {
      console.warn('Toggle select all error:', err);
    }
  };

  // 4. Campaign Actions
  const handleSendCampaign = async () => {
    const selectedIds = cohort.filter((p) => p.selected).map((p) => p.id);
    if (selectedIds.length === 0) return;

    setIsSending(true);
    try {
      await fetch('/api/cohort/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          mode: 'live',
          customTemplate: template,
        }),
      });

      setTimeout(() => {
        fetchCohort();
        setIsSending(false);
      }, 1600);
    } catch (err) {
      console.error('Send campaign error:', err);
      setIsSending(false);
    }
  };

  const handleResolveAll = async () => {
    setIsResolving(true);
    try {
      await fetch('/api/cohort/resolve-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'live' }),
      });

      setTimeout(() => {
        fetchCohort();
        setIsResolving(false);
      }, 2400);
    } catch (err) {
      console.error('Resolve all error:', err);
      setIsResolving(false);
    }
  };

  const handleRunAgent = async (leadId: string) => {
    setRunningAgentId(leadId);
    try {
      await fetch('/api/cohort/resolve-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId: leadId, mode: 'live' }),
      });

      setTimeout(() => {
        fetchCohort();
        setRunningAgentId(null);
      }, 2000);
    } catch (err) {
      console.error('Run single agent error:', err);
      setRunningAgentId(null);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/cohort/reset', { method: 'POST' });
      fetchCohort();
    } catch (err) {
      console.warn('Reset error:', err);
    }
  };

  const handleSaveTemplate = (newTemplate: { subject: string; body: string }) => {
    setTemplate(newTemplate);
    setCohort((prev) =>
      prev.map((p) => {
        if (p.id === selectedLeadId) {
          const firstName = p.name.split(' ')[0];
          return {
            ...p,
            outboundSubject: newTemplate.subject
              .replace(/\{\{Company\}\}/g, p.company)
              .replace(/\{\{First_Name\}\}/g, firstName)
              .replace(/\{\{Title\}\}/g, p.title),
            outboundBody: newTemplate.body
              .replace(/\{\{Company\}\}/g, p.company)
              .replace(/\{\{First_Name\}\}/g, firstName)
              .replace(/\{\{Title\}\}/g, p.title),
          };
        }
        return p;
      })
    );
  };

  const selectedLead = cohort.find((p) => p.id === selectedLeadId) || cohort[0] || null;

  return (
    <div className="app-container">
      {/* Top Header with Tab Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedCount={metrics.selected}
        isSending={isSending}
        isResolving={isResolving}
        onOpenCompose={() => setIsComposeOpen(true)}
        onSendCampaign={handleSendCampaign}
        onResolveAll={handleResolveAll}
        onReset={handleReset}
      />

      {/* KPI Summary Bar (Always visible for real-time awareness) */}
      <KpiSummary metrics={metrics} />

      {/* Main Content: Cockpit vs Architecture vs Analytics */}
      {activeTab === 'cockpit' && (
        <main className="workspace-split">
          {/* Left Pane: Prospects List */}
          <section className="left-pane">
            <ProspectsList
              cohort={cohort}
              selectedLeadId={selectedLeadId}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onSelectLead={setSelectedLeadId}
              onToggleCheckbox={handleToggleCheckbox}
              onToggleSelectAll={handleToggleSelectAll}
            />
          </section>

          {/* Right Pane: Email Conversation Thread View */}
          <section className="right-pane">
            <EmailConversationPane
              lead={selectedLead}
              onRunAgent={handleRunAgent}
              isRunningAgent={runningAgentId === selectedLeadId}
            />
          </section>
        </main>
      )}

      {activeTab === 'architecture' && <ArchitectureView />}

      {activeTab === 'analytics' && <AnalyticsView cohort={cohort} metrics={metrics} />}

      {/* Real-time Telemetry Footer */}
      <TelemetryLog
        logs={logs}
        onClear={() => setLogs([])}
        sequenceId={config.sequenceId}
        stepId={config.stepId}
      />

      {/* Compose / Edit Outbound Email Modal */}
      <EmailComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        template={template}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

export default App;
