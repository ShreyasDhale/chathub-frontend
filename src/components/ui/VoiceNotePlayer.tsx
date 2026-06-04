"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Download } from "lucide-react";
import { Attachment } from "@/types/chat.types";
import { downloadAttachment } from "@/services/api/attachments.api";

interface VoiceNotePlayerProps {
  attachment: Attachment;
  isOwn?: boolean;
}

function formatTime(seconds: number): string {
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
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          setError("Failed to play audio");
          console.error(err);
        });
      }
      setIsPlaying(!isPlaying);
    }
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

  if (!isAudio) {
    return null;
  }

  if (error) {
    return (
      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded ${
      isOwn ? "bg-blue-100 dark:bg-blue-900" : ""
    }`}>
      <audio
        ref={audioRef}
        src={attachment.url}
        crossOrigin="anonymous"
      />

      <button
        onClick={handlePlayPause}
        className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        ) : (
          <Play className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Progress bar */}
      <div className="flex-1 flex items-center gap-1 min-w-0">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded cursor-pointer appearance-none"
          style={{
            background: `linear-gradient(to right, currentColor 0%, currentColor ${
              duration > 0 ? (currentTime / duration) * 100 : 0
            }%, #d1d5db ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #d1d5db 100%)`,
          }}
        />
        <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <button
        onClick={handleDownload}
        title="Download"
        className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
      >
        <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
}
