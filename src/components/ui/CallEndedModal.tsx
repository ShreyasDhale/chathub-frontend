"use client";

import { Phone, Clock, Calendar } from "lucide-react";

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

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function CallEndedModal({
  userName,
  duration,
  callType,
  reason = "completed",
  onClose,
}: CallEndedModalProps) {
  const now = new Date();
  const callTypeLabel = callType === "video" ? "Video call" : "Voice call";
  const callTypeIcon = callType === "video" ? "📹" : "☎️";

  let statusText = "Call ended";
  let statusColor = "text-gray-600";

  switch (reason) {
    case "rejected":
      statusText = "Call was rejected";
      statusColor = "text-red-600";
      break;
    case "missed":
      statusText = "Missed call";
      statusColor = "text-yellow-600";
      break;
    case "failed":
      statusText = "Call failed";
      statusColor = "text-red-600";
      break;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{callTypeIcon}</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {userName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {callTypeLabel}
          </p>
          <p className={`text-sm mt-2 font-medium ${statusColor}`}>
            {statusText}
          </p>
        </div>

        {/* Call details */}
        <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {reason !== "missed" && reason !== "rejected" && reason !== "failed" && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">
                Duration: <span className="font-semibold">{formatDuration(duration)}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">
              <span className="font-semibold">{formatDate(now)}</span> at{" "}
              <span className="font-semibold">{formatTime(now)}</span>
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          <Phone className="w-5 h-5 inline mr-2" />
          Done
        </button>
      </div>
    </div>
  );
}
