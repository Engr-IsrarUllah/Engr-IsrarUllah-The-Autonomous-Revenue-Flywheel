import React, { useState, useEffect, useRef } from 'react';
import { Mail, Check, RotateCcw, Eye, Sparkles } from 'lucide-react';

interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: { subject: string; body: string };
  onSave: (newTemplate: { subject: string; body: string }) => void;
}

const DEFAULT_TEMPLATE = {
  subject: 'Streamlining outbound pipeline infrastructure at {{Company}}',
  body: 'Hi {{First_Name}}, noticed {{Company}} is scaling engineering headcount. Teams typically struggle with siloed SDR tools and manual data lookups. Are you looking to streamline outbound revops this quarter?',
};

export const EmailComposeModal: React.FC<EmailComposeModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave,
}) => {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [showPreview, setShowPreview] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [isOpen, template]);

  if (!isOpen) return null;

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = body.substring(0, start) + variable + body.substring(end);
    setBody(newBody);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
    }, 0);
  };

  const handleRestoreDefault = () => {
    setSubject(DEFAULT_TEMPLATE.subject);
    setBody(DEFAULT_TEMPLATE.body);
  };

  const handleSave = () => {
    onSave({ subject: subject.trim(), body: body.trim() });
    onClose();
  };

  // Interpolated preview using sample contact
  const sampleLead = {
    name: 'Alex Rivera',
    firstName: 'Alex',
    title: 'Head of Operations',
    company: 'CloudScale Technologies',
  };

  const previewSubject = subject
    .replace(/\{\{Company\}\}/g, sampleLead.company)
    .replace(/\{\{First_Name\}\}/g, sampleLead.firstName)
    .replace(/\{\{Title\}\}/g, sampleLead.title);

  const previewBody = body
    .replace(/\{\{Company\}\}/g, sampleLead.company)
    .replace(/\{\{First_Name\}\}/g, sampleLead.firstName)
    .replace(/\{\{Title\}\}/g, sampleLead.title);

  return (
    <div
      className="modal-backdrop"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content compose-modal-pro" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="compose-modal-header">
          <div className="compose-title-group">
            <div className="compose-icon-wrap">
              <Mail size={16} />
            </div>
            <div>
              <h3>Outbound Sequence Template</h3>
              <p>Configure the initial message dispatched to prospects</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Modal Body / Composer Form */}
        <div className="compose-modal-body">
          {/* Sender & Audience Details */}
          <div className="compose-meta-grid">
            <div className="compose-meta-field">
              <span className="compose-meta-label">From:</span>
              <span className="compose-meta-val">
                Israr Khan &lt;engrisrar256@gmail.com&gt;
                <span className="verified-pill">Verified Mailbox</span>
              </span>
            </div>
            <div className="compose-meta-field">
              <span className="compose-meta-label">Target:</span>
              <span className="compose-meta-val">Selected Audience Cohort (20 prospects)</span>
            </div>
          </div>

          {/* Subject Field */}
          <div className="compose-field-row">
            <label className="compose-field-label" htmlFor="modalSubject">
              Subject
            </label>
            <input
              type="text"
              id="modalSubject"
              className="compose-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Streamlining outbound pipeline infrastructure at {{Company}}"
            />
          </div>

          {/* Personalization Variable Toolbar */}
          <div className="compose-token-toolbar">
            <span className="token-toolbar-label">
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Dynamic Tokens:
            </span>
            <div className="token-pills-list">
              <button
                type="button"
                className="token-pill-btn"
                onClick={() => insertVariable('{{First_Name}}')}
              >
                + First Name
              </button>
              <button
                type="button"
                className="token-pill-btn"
                onClick={() => insertVariable('{{Company}}')}
              >
                + Company
              </button>
              <button
                type="button"
                className="token-pill-btn"
                onClick={() => insertVariable('{{Title}}')}
              >
                + Job Title
              </button>
            </div>
            <button
              type="button"
              className="preview-toggle-btn"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye size={12} style={{ marginRight: '4px' }} />
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
          </div>

          {/* Message Body Editor */}
          <div className="compose-editor-box">
            <textarea
              id="modalBody"
              ref={textareaRef}
              className="compose-textarea"
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email pitch here. Use tokens above to personalize per prospect..."
            />
          </div>

          {/* Live Preview Panel */}
          {showPreview && (
            <div className="compose-live-preview">
              <div className="preview-top-bar">
                <span className="preview-tag">LIVE PREVIEW</span>
                <span className="preview-lead-info">
                  Recipient: <strong>{sampleLead.name}</strong> · {sampleLead.company}
                </span>
              </div>
              <div className="preview-subject">
                <strong>Subject:</strong> {previewSubject}
              </div>
              <div className="preview-body">{previewBody}</div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="compose-modal-footer">
          <button className="btn-restore-default" onClick={handleRestoreDefault}>
            <RotateCcw size={12} style={{ marginRight: '4px' }} />
            <span>Restore Default</span>
          </button>
          <div className="footer-right-buttons">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              <Check size={14} style={{ marginRight: '4px' }} />
              <span>Save & Apply Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
