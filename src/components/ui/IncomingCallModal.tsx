"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCallStore } from "@/store/call.store";
import ChatIcon from "@/components/ui/ChatIcon";

type Props = {
  onAccept?: () => void;
  onReject?: () => void;
};

/**
 * Self-rendering ringing modal. Reads incoming call info from the store and
 * delegates accept/reject to the parent's call handlers.
 */
export function IncomingCallModal({ onAccept, onReject }: Props) {
  const { incomingCall, incomingCallRinging } = useCallStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!incomingCall || !incomingCallRinging || !mounted) return null;

  const isVideo = incomingCall.callType === "video";
  const callerName = incomingCall.fromUserName ?? "Unknown caller";
  const initials = callerName.charAt(0).toUpperCase();

  const modal = (
    <div className="call-overlay">
      <div className="call-card">
        <div className="call-card-glow" aria-hidden="true">
          <div className="call-pulse" />
          <div className="call-pulse delay-1" />
          <div className="call-pulse delay-2" />
        </div>

        <div className="call-card-avatar">{initials}</div>
        <h2 className="call-card-name">{callerName}</h2>
        <p className="call-card-type">
          <ChatIcon name={isVideo ? "video" : "call"} size={16} />
          {isVideo ? "Incoming video call" : "Incoming voice call"}
        </p>

        <div className="call-card-actions">
          <button
            type="button"
            className="call-button call-button--reject"
            onClick={() => onReject?.()}
            aria-label="Decline call"
            title="Decline"
          >
            <ChatIcon name="phone-down" size={26} />
          </button>
          <button
            type="button"
            className="call-button call-button--accept"
            onClick={() => onAccept?.()}
            aria-label="Accept call"
            title="Accept"
          >
            <ChatIcon name="phone-up" size={26} />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
