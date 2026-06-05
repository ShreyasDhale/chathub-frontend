"use client";

import { useEffect, useRef } from "react";
import ChatIcon from "@/components/ui/ChatIcon";

interface VideoStreamProps {
  stream: MediaStream | null;
  userName?: string;
  isLocal?: boolean;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  muted?: boolean;
}

export function VideoStream({
  stream,
  userName,
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true,
  onToggleAudio,
  onToggleVideo,
  muted = false,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = (stream?.getVideoTracks().length ?? 0) > 0 && videoEnabled;
  const hasAudio = (stream?.getAudioTracks().length ?? 0) > 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.play().catch((error) => {
      console.error("Failed to play video stream:", error);
    });

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className="video-stream">
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted || isLocal}
          className="video-stream-video"
        />
      ) : (
        <div className="video-stream-placeholder">
          <div className="video-stream-avatar">
            <ChatIcon name="user" size={28} />
          </div>
          <p className="video-stream-name">{userName || "User"}</p>
          <p className="video-stream-hint">Camera off</p>
        </div>
      )}

      {isLocal && (
        <div className="video-stream-controls">
          {hasAudio && onToggleAudio && (
            <button
              type="button"
              className={`call-control ${audioEnabled ? "" : "is-off"}`}
              onClick={onToggleAudio}
              aria-label={audioEnabled ? "Mute" : "Unmute"}
            >
              <ChatIcon name={audioEnabled ? "voice" : "mic-off"} size={16} />
            </button>
          )}
          {(stream?.getVideoTracks().length ?? 0) > 0 && onToggleVideo && (
            <button
              type="button"
              className={`call-control ${videoEnabled ? "" : "is-off"}`}
              onClick={onToggleVideo}
              aria-label={videoEnabled ? "Stop video" : "Start video"}
            >
              <ChatIcon name={videoEnabled ? "video" : "video-off"} size={16} />
            </button>
          )}
        </div>
      )}

      {!isLocal && userName && (
        <div className="video-stream-tag">{userName}</div>
      )}

      {!hasVideo && hasAudio && !isLocal && (
        <div className="video-stream-audio-dot" />
      )}
    </div>
  );
}
