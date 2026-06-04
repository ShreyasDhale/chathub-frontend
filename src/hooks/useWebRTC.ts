import { useRef, useState, useCallback, useEffect } from "react";
import { useCallStore } from "@/store/call.store";
import { MediaStreamManager } from "@/services/call/webrtcManager";

export interface AudioVideoStats {
  audioLevel: number;
  videoResolution: { width: number; height: number } | null;
  videoBitrate: number;
  audioBitrate: number;
  latency: number;
}

export function useWebRTC() {
  const {
    activeCall,
    localStream,
    remoteStreams,
    setLocalStream,
    addRemoteStream,
    removeRemoteStream,
  } = useCallStore();

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [stats, setStats] = useState<AudioVideoStats | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Toggle audio on/off
   */
  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  }, [localStream, audioEnabled]);

  /**
   * Toggle video on/off
   */
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  }, [localStream, videoEnabled]);

  /**
   * Switch camera (front/back)
   */
  const switchCamera = useCallback(async () => {
    try {
      if (!localStream) return;

      const newStream = await MediaStreamManager.switchCamera(localStream);
      
      // Replace video track in peer connection
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        // This would need to be done through the WebRTC peer connection
        // by using replaceTrack on the sender
        console.log("Camera switched");
      }

      setLocalStream(newStream);
    } catch (error) {
      console.error("Failed to switch camera:", error);
    }
  }, [localStream, setLocalStream]);

  /**
   * Get connection stats
   */
  const getConnectionStats = useCallback(async () => {
    try {
      // Would need access to peer connection from useCall hook
      // For now, returning mock stats
      setStats({
        audioLevel: Math.random() * 100,
        videoResolution: { width: 1280, height: 720 },
        videoBitrate: 2500,
        audioBitrate: 128,
        latency: Math.random() * 100,
      });
    } catch (error) {
      console.error("Failed to get stats:", error);
    }
  }, []);

  // Periodically update stats
  useEffect(() => {
    if (activeCall) {
      statsIntervalRef.current = setInterval(() => {
        getConnectionStats();
      }, 1000);
    }

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [activeCall, getConnectionStats]);

  return {
    activeCall,
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    stats,
    toggleAudio,
    toggleVideo,
    switchCamera,
  };
}
