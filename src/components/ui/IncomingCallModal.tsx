"use client";

// No external icon library needed - using emojis
import { useCallStore } from "@/store/call.store";
import { useCall } from "@/hooks/useCall";

interface IncomingCallModalProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export function IncomingCallModal({ onAccept, onReject }: IncomingCallModalProps) {
  const { incomingCall, incomingCallRinging } = useCallStore();

  if (!incomingCall || !incomingCallRinging) {
    return null;
  }

  const callTypeIcon = incomingCall.callType === "video" ? "📹" : "☎️";
  const callTypeLabel =
    incomingCall.callType === "video" ? "Video call" : "Voice call";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{callTypeIcon}</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {incomingCall.fromUserName || "Unknown"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {callTypeLabel}
          </p>
        </div>

        {/* Ringing animation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => onReject?.()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-xl"
            title="Decline call"
          >
            ☎️ Decline
          </button>
          <button
            onClick={() => onAccept?.()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-xl"
            title="Accept call"
          >
            ✅ Accept
          </button>
        </div>
      </div>
    </div>
  );
}
