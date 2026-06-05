"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useCallStore } from "@/store/call.store";
import { VideoStream } from "./VideoStream";
import ChatIcon from "@/components/ui/ChatIcon";

type Props = {
  onHangUp?: () => void;
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function ActiveCallScreen({ onHangUp }: Props) {
  const {
    activeCall,
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
  } = useWebRTC();
  const { callStatus } = useCallStore();
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (callStatus !== "connected") return;
    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    if (!activeCall) {
      setDuration(0);
      setIsFullscreen(false);
    }
  }, [activeCall]);

  if (!activeCall || !mounted) return null;

  const remoteStream = remoteStreams[0];
  const isVideo = activeCall.callType === "video";
  const remoteName =
    remoteStream?.userName ?? activeCall.fromUserName ?? "Connected";
  const initials = remoteName.charAt(0).toUpperCase();

  const overlay = (
    <div
      className={`call-screen ${isFullscreen ? "is-fullscreen" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="call-screen-header">
        <div className="call-screen-info">
          <div className="call-screen-avatar-sm">{initials}</div>
          <div>
            <p className="call-screen-name">{remoteName}</p>
            <p className="call-screen-status">
              {callStatus === "connecting"
                ? "Connecting..."
                : formatDuration(duration)}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="call-screen-iconbtn"
          onClick={() => setIsFullscreen((v) => !v)}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          aria-label="Toggle fullscreen"
        >
          <ChatIcon name={isFullscreen ? "compress" : "expand"} size={18} />
        </button>
      </div>

      <div className="call-screen-stage">
        {isVideo && remoteStream ? (
          <div className="call-screen-remote">
            <VideoStream
              stream={remoteStream.stream}
              userName={remoteName}
              isLocal={false}
              muted={false}
            />
          </div>
        ) : (
          <div className="call-screen-portrait">
            <div className="call-screen-portrait-avatar">{initials}</div>
            <p className="call-screen-portrait-name">{remoteName}</p>
            <p className="call-screen-portrait-hint">
              {callStatus === "connecting"
                ? "Connecting..."
                : isVideo
                  ? "Waiting for video..."
                  : "Voice call in progress"}
            </p>
          </div>
        )}

        {isVideo && localStream && (
          <div className="call-screen-local">
            <VideoStream
              stream={localStream}
              userName="You"
              isLocal
              audioEnabled={audioEnabled}
              videoEnabled={videoEnabled}
              muted
            />
          </div>
        )}
      </div>

      <div className="call-screen-controls">
        <button
          type="button"
          className={`call-control ${audioEnabled ? "" : "is-off"}`}
          onClick={toggleAudio}
          title={audioEnabled ? "Mute mic" : "Unmute mic"}
          aria-label={audioEnabled ? "Mute" : "Unmute"}
        >
          <ChatIcon name={audioEnabled ? "voice" : "mic-off"} size={22} />
        </button>

        {isVideo && (
          <button
            type="button"
            className={`call-control ${videoEnabled ? "" : "is-off"}`}
            onClick={toggleVideo}
            title={videoEnabled ? "Stop video" : "Start video"}
            aria-label={videoEnabled ? "Stop video" : "Start video"}
          >
            <ChatIcon name={videoEnabled ? "video" : "video-off"} size={22} />
          </button>
        )}

        <button
          type="button"
          className="call-control call-control--hangup"
          onClick={() => onHangUp?.()}
          title="End call"
          aria-label="End call"
        >
          <ChatIcon name="phone-down" size={22} />
        </button>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
