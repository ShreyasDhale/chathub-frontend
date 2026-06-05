"use client";

import { useEffect, useRef, useState } from "react";
import { Attachment } from "@/types/chat.types";
import { downloadAttachment } from "@/services/api/attachments.api";
import ChatIcon from "@/components/ui/ChatIcon";

interface VoiceNotePlayerProps {
  attachment: Attachment;
  isOwn?: boolean;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VoiceNotePlayer({
  attachment,
  isOwn = false,
}: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isAudio = attachment.mimeType.startsWith("audio/");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setError("Failed to play audio");

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        setError("Failed to play audio");
        console.error(err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = () => {
    downloadAttachment(attachment.attachmentId, attachment.fileName);
  };

  if (!isAudio) return null;

  if (error) {
    return <div className="voice-note-error">{error}</div>;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`voice-note ${isOwn ? "is-own" : ""}`}>
      <audio ref={audioRef} src={attachment.url} crossOrigin="anonymous" />

      <button
        type="button"
        className="voice-note-play"
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <ChatIcon name="check" size={14} />
        ) : (
          <ChatIcon name="phone-up" size={14} />
        )}
      </button>

      <div className="voice-note-track">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="voice-note-range"
          style={{ ["--vn-progress" as string]: `${progress}%` }}
          aria-label="Seek voice note"
        />
        <span className="voice-note-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <button
        type="button"
        className="voice-note-download"
        onClick={handleDownload}
        title="Download"
        aria-label="Download voice note"
      >
        <ChatIcon name="attach" size={14} />
      </button>
    </div>
  );
}
