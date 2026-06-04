"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

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
  const hasVideo = stream?.getVideoTracks().length ?? 0 > 0;
  const hasAudio = stream?.getAudioTracks().length ?? 0 > 0;

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
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted || isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
          <div className="text-center">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-white text-sm">{userName || "User"}</p>
            <p className="text-gray-400 text-xs mt-1">Camera off</p>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {isLocal && (
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between">
          <div className="p-3">
            <div className="text-white text-xs font-semibold">You</div>
          </div>

          <div className="flex justify-center gap-2 p-3">
            {hasAudio && (
              <button
                onClick={onToggleAudio}
                className={`p-2 rounded-full transition-colors ${
                  audioEnabled
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {audioEnabled ? (
                  <Mic className="w-4 h-4 text-white" />
                ) : (
                  <MicOff className="w-4 h-4 text-white" />
                )}
              </button>
            )}

            {hasVideo && (
              <button
                onClick={onToggleVideo}
                className={`p-2 rounded-full transition-colors ${
                  videoEnabled
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {videoEnabled ? (
                  <Video className="w-4 h-4 text-white" />
                ) : (
                  <VideoOff className="w-4 h-4 text-white" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* User info badge */}
      {!isLocal && (
        <div className="absolute top-3 left-3 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-xs font-medium">
          {userName || "Remote User"}
        </div>
      )}

      {/* Audio indicator (when video is off) */}
      {!hasVideo && hasAudio && !isLocal && (
        <div className="absolute bottom-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}
