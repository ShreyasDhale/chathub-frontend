"use client";

import { useState } from "react";
import { Mic, Send, X, Pause, Play } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { uploadVoiceNote } from "@/services/api/attachments.api";
import toast from "react-hot-toast";

interface VoiceNoteRecorderProps {
  conversationId: number;
  onVoiceNoteSent?: () => void;
  onError?: (error: string) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VoiceNoteRecorder({
  conversationId,
  onVoiceNoteSent,
  onError,
}: VoiceNoteRecorderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const handleSend = async () => {
    if (!audioBlob) return;

    setIsSending(true);
    try {
      await uploadVoiceNote(audioBlob, conversationId);
      toast.success("Voice note sent!");
      onVoiceNoteSent?.();
      setIsOpen(false);
      cancelRecording();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to send voice note";
      onError?.(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Record voice note"
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Record Voice Note</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            cancelRecording();
          }}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Recording Display */}
      <div className="flex items-center justify-center gap-3 py-4">
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-mono text-red-500">
              {formatDuration(duration)}
            </span>
          </div>
        )}
        {audioBlob && !isRecording && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ✓ Ready to send • {formatDuration(duration)}
          </span>
        )}
        {error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            <Mic className="w-4 h-4 inline mr-2" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <>
            <button
              onClick={pauseRecording}
              disabled={isPaused}
              className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Pause className="w-4 h-4 inline mr-2" />
              Pause
            </button>
            <button
              onClick={resumeRecording}
              disabled={!isPaused}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Play className="w-4 h-4 inline mr-2" />
              Resume
            </button>
            <button
              onClick={stopRecording}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Stop
            </button>
          </>
        )}

        {audioBlob && !isRecording && (
          <>
            <button
              onClick={() => cancelRecording()}
              className="flex-1 px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
            >
              Clear
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              <Send className="w-4 h-4 inline mr-2" />
              Send
            </button>
          </>
        )}
      </div>
    </div>
  );
}
