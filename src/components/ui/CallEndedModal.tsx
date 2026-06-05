"use client";

import { createPortal } from "react-dom";
import ChatIcon from "@/components/ui/ChatIcon";

interface CallEndedModalProps {
  userName: string;
  duration: number;
  callType: "audio" | "video";
  reason?: "completed" | "rejected" | "missed" | "failed";
  onClose?: () => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function formatStamp(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CallEndedModal({
  userName,
  duration,
  callType,
  reason = "completed",
  onClose,
}: CallEndedModalProps) {
  const isVideo = callType === "video";
  const callTypeLabel = isVideo ? "Video call" : "Voice call";

  const statusMap: Record<NonNullable<CallEndedModalProps["reason"]>, { label: string; tone: string }> = {
    completed: { label: "Call ended", tone: "neutral" },
    rejected: { label: "Call was declined", tone: "danger" },
    missed: { label: "Missed call", tone: "warning" },
    failed: { label: "Call failed", tone: "danger" },
  };
  const status = statusMap[reason];

  const modal = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="info-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h2>{callTypeLabel}</h2>
            <p className="modal-subtitle">{status.label}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <ChatIcon name="close" size={18} />
          </button>
        </div>

        <div className="info-hero">
          <div className="info-hero-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <h3 className="info-hero-name">{userName}</h3>
          <span className={`info-hero-type ${status.tone === "danger" ? "is-danger" : ""}`}>
            {status.label}
          </span>
        </div>

        <div className="info-list">
          {reason === "completed" && (
            <div className="info-row">
              <span className="info-row-label">Duration</span>
              <span className="info-row-value">{formatDuration(duration)}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-row-label">Time</span>
            <span className="info-row-value">{formatStamp(new Date())}</span>
          </div>
        </div>

        <div className="modal-footer">
          <span />
          <div className="modal-footer-actions">
            <button className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
