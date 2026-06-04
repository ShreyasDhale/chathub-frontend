"use client";

import { useEffect, useState } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useCallStore } from "@/store/call.store";
import { VideoStream } from "./VideoStream";

interface ActiveCallScreenProps {
  onHangUp?: () => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function ActiveCallScreen({ onHangUp }: ActiveCallScreenProps) {
  const { activeCall, localStream, remoteStreams, audioEnabled, videoEnabled, toggleAudio, toggleVideo } =
    useWebRTC();
  const { callStatus } = useCallStore();
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track call duration
  useEffect(() => {
    if (callStatus !== "connected") return;

    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  if (!activeCall) {
    return null;
  }

  const remoteStream = remoteStreams[0];
  const callTypeIcon = activeCall.callType === "video" ? "📹" : "☎️";

  return (
    <div
      className={`fixed z-40 bg-black text-white ${
        isFullscreen ? "inset-0" : "bottom-4 right-4 w-96 h-96 rounded-lg shadow-2xl"
      }`}
    >
      {/* Status bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 bg-black bg-opacity-60 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{callTypeIcon}</span>
          <div>
            <p className="font-semibold">
              {remoteStream?.userName || "User"}
            </p>
            <p className="text-xs text-gray-300">{formatDuration(duration)}</p>
          </div>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-lg"
          title="Toggle fullscreen"
        >
          🔲
        </button>
      </div>

      {/* Video grid */}
      <div className="absolute inset-x-0 top-14 bottom-20 flex gap-2 p-2">
        {/* Remote stream (main) */}
        {remoteStream && activeCall.callType === "video" ? (
          <div className="flex-1 rounded-lg overflow-hidden">
            <VideoStream
              stream={remoteStream.stream}
              userName={remoteStream.userName}
              isLocal={false}
              muted={false}
            />
          </div>
        ) : (
          <div className="flex-1 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-lg font-semibold">
                {remoteStream?.userName || "User"}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {callStatus === "connecting"
                  ? "Connecting..."
                  : "Call in progress"}
              </p>
            </div>
          </div>
        )}

        {/* Local stream (picture-in-picture) */}
        {activeCall.callType === "video" && localStream && (
          <div className="w-32 rounded-lg overflow-hidden shadow-lg">
            <VideoStream
              stream={localStream}
              userName="You"
              isLocal={true}
              audioEnabled={audioEnabled}
              videoEnabled={videoEnabled}
              muted={true}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 px-4 py-4 bg-black bg-opacity-60">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors text-xl ${
            audioEnabled
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
          title={audioEnabled ? "Mute" : "Unmute"}
        >
          {audioEnabled ? "🔊" : "🔇"}
        </button>

        {activeCall.callType === "video" && (
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors text-xl ${
              videoEnabled
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            title={videoEnabled ? "Stop video" : "Start video"}
          >
            {videoEnabled ? "📹" : "📵"}
          </button>
        )}

        <button
          onClick={onHangUp}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors ml-2 text-xl"
          title="End call"
        >
          ☎️
        </button>
      </div>
    </div>
  );
}
