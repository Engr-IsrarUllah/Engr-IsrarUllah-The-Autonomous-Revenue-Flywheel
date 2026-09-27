import React, { useEffect, useRef } from 'react';
import { FlywheelEvent } from '../types';

interface TelemetryLogProps {
  logs: FlywheelEvent[];
  onClear: () => void;
  sequenceId?: string;
  stepId?: string;
}

export const TelemetryLog: React.FC<TelemetryLogProps> = ({
  logs,
  onClear,
  sequenceId = '81257cc3',
  stepId = '32fe95ad',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <footer className="telemetry-bar">
      <div className="telemetry-header">
        <div className="telemetry-left">
          <span className="live-pulse" />
          <span className="telemetry-title">AGENT AUDIT LOG</span>
        </div>
        <div className="telemetry-right">
          <span className="seq-badge">Seq: {sequenceId.slice(0, 8)}</span>
          <span className="seq-badge">Step: {stepId.slice(0, 8)}</span>
          <button className="btn-clear-log" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>
      <div className="telemetry-logs" ref={scrollRef}>
        {logs.map((log) => {
          const time = new Date(log.timestamp).toLocaleTimeString();
          return (
            <div key={log.id} className="log-item">
              <span className="log-time">{time}</span>
              <span className="log-stage">[{log.stage}]</span>
              <span className="log-text">
                {log.title}: {log.description}
              </span>
            </div>
          );
        })}
      </div>
    </footer>
  );
};
