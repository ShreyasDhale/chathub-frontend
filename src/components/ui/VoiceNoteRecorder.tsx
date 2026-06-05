"use client";

import { useState } from "react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { uploadVoiceNote } from "@/services/api/attachments.api";
import ChatIcon from "@/components/ui/ChatIcon";
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
      toast.success("Voice note sent");
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
        type="button"
        className="chat-icon-button"
        onClick={() => setIsOpen(true)}
        title="Record voice note"
        aria-label="Record voice note"
      >
        <ChatIcon name="voice" size={18} />
      </button>
    );
  }

  return (
    <div className="voice-recorder">
      <div className="voice-recorder-header">
        <span className="voice-recorder-title">
          <ChatIcon name="voice" size={16} />
          Voice note
        </span>
        <button
          type="button"
          className="chat-icon-button"
          onClick={() => {
            setIsOpen(false);
            cancelRecording();
          }}
          aria-label="Close"
        >
          <ChatIcon name="close" size={16} />
        </button>
      </div>

      <div className="voice-recorder-status">
        {isRecording && (
          <div className="voice-recorder-rec">
            <span className="rec-dot" />
            <span className="rec-time">{formatDuration(duration)}</span>
            {isPaused && <span className="rec-paused">Paused</span>}
          </div>
        )}
        {audioBlob && !isRecording && (
          <span className="voice-recorder-ready">
            <ChatIcon name="check" size={14} /> Ready · {formatDuration(duration)}
          </span>
        )}
        {error && <span className="voice-recorder-error">{error}</span>}
        {!isRecording && !audioBlob && !error && (
          <span className="voice-recorder-hint">Tap start to record</span>
        )}
      </div>

      <div className="voice-recorder-controls">
        {!isRecording && !audioBlob && (
          <button
            type="button"
            className="btn-primary"
            onClick={startRecording}
          >
            Start
          </button>
        )}

        {isRecording && (
          <>
            {!isPaused ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={pauseRecording}
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={resumeRecording}
              >
                Resume
              </button>
            )}
            <button
              type="button"
              className="btn-primary"
              onClick={stopRecording}
            >
              Stop
            </button>
          </>
        )}

        {audioBlob && !isRecording && (
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => cancelRecording()}
            >
              Discard
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSend}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
