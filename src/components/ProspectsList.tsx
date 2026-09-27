import React from 'react';
import { UserCheck, ShieldAlert, FileText } from 'lucide-react';
import { CohortProspect } from '../types';

interface ProspectsListProps {
  cohort: CohortProspect[];
  selectedLeadId: string;
  activeFilter: 'all' | 'replied' | 'delivered' | 'automated';
  onFilterChange: (filter: 'all' | 'replied' | 'delivered' | 'automated') => void;
  onSelectLead: (id: string) => void;
  onToggleCheckbox: (id: string, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean) => void;
}

export const ProspectsList: React.FC<ProspectsListProps> = ({
  cohort,
  selectedLeadId,
  activeFilter,
  onFilterChange,
  onSelectLead,
  onToggleCheckbox,
  onToggleSelectAll,
}) => {
  const allCount = cohort.length;
  const repliedCount = cohort.filter((p) => p.status === 'replied').length;
  const deliveredCount = cohort.filter((p) => p.status === 'delivered').length;
  const automatedCount = cohort.filter((p) => p.status === 'automated').length;
  const selectedCount = cohort.filter((p) => p.selected).length;
  const isAllChecked = selectedCount === allCount && allCount > 0;

  const filteredCohort = cohort.filter((lead) => {
    if (activeFilter === 'all') return true;
    return lead.status === activeFilter;
  });

  return (
    <div className="panel-card users-card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="header-left">
          <h4>Prospects</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="selection-pill" id="selectionCountBadge">
            {selectedCount} Selected
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="users-toolbar">
        <label className="select-all-box">
          <input
            type="checkbox"
            checked={isAllChecked}
            onChange={(e) => onToggleSelectAll(e.target.checked)}
          />
          <span>Select All</span>
        </label>

        <div className="filter-pills">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All ({allCount})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'replied' ? 'active' : ''}`}
            onClick={() => onFilterChange('replied')}
          >
            Replied ({repliedCount})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => onFilterChange('delivered')}
          >
            Delivered ({deliveredCount})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'automated' ? 'active' : ''}`}
            onClick={() => onFilterChange('automated')}
          >
            Resolved ({automatedCount})
          </button>
        </div>
      </div>

      {/* Scrollable Users List */}
      <div className="users-list-scroll">
        {filteredCohort.map((lead) => {
          const isSelected = lead.id === selectedLeadId;

          let avatarClass = 'avatar-cyan';
          if (lead.status === 'draft') avatarClass = 'avatar-blue';
          else if (lead.replyCategory === 'PRICE_OBJECTION') avatarClass = 'avatar-amber';
          else if (lead.replyCategory === 'THIRD_PERSON_QUOTE') avatarClass = 'avatar-emerald';
          else if (lead.replyCategory === 'NO_REPLY') avatarClass = 'avatar-purple';

          let statusClass = `tag-${lead.status}`;
          let statusText = lead.status.toUpperCase();
          if (lead.status === 'draft') statusText = 'READY';
          else if (lead.status === 'replied') statusText = 'REPLIED';
          else if (lead.status === 'automated') statusText = 'RESOLVED';
          else if (lead.status === 'delivered') statusText = 'DELIVERED';

          let intentBadge = null;
          if (lead.replyText) {
            if (lead.replyCategory === 'WRONG_PERSON') {
              intentBadge = (
                <span className="tag-intent-mini mini-referral">
                  <UserCheck size={11} style={{ marginRight: '3px' }} /> Referral
                </span>
              );
            } else if (lead.replyCategory === 'PRICE_OBJECTION') {
              intentBadge = (
                <span className="tag-intent-mini mini-objection">
                  <ShieldAlert size={11} style={{ marginRight: '3px' }} /> Objection
                </span>
              );
            } else if (lead.replyCategory === 'THIRD_PERSON_QUOTE') {
              intentBadge = (
                <span className="tag-intent-mini mini-quote">
                  <FileText size={11} style={{ marginRight: '3px' }} /> Quote
                </span>
              );
            }
          }

          return (
            <div
              key={lead.id}
              className={`user-row ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectLead(lead.id)}
            >
              <div className="user-row-left">
                <input
                  type="checkbox"
                  className="user-checkbox"
                  checked={lead.selected}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onToggleCheckbox(lead.id, e.target.checked)}
                />
                <div className={`user-avatar-circle ${avatarClass}`}>
                  {lead.avatar || 'B2B'}
                </div>
                <div className="user-text-info">
                  <div className="user-name-line">
                    <span className="user-name">{lead.name}</span>
                    {intentBadge}
                  </div>
                  <div className="user-meta-sub">
                    {lead.title} · {lead.company}
                  </div>
                </div>
              </div>
              <div className="user-row-right">
                <span className={`user-status-tag ${statusClass}`}>
                  {statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
