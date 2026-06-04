import { WebRtcSignal, IceCandidate } from "@/types/call.types";

/**
 * WebRTC configuration with STUN/TURN servers
 */
const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
    // Add TURN servers if needed for production
    // {
    //   urls: ["turn:your-turn-server.com"],
    //   username: "user",
    //   credential: "password",
    // },
  ],
};

/**
 * WebRTC Peer Connection Manager
 * Handles creation, signaling, and lifecycle of peer connections
 */
export class WebRtcPeerConnection {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;

  private onSignal: ((signal: WebRtcSignal) => void) | null = null;
  private onRemoteStream: ((stream: MediaStream) => void) | null = null;
  private onIceCandidate: ((candidate: IceCandidate) => void) | null = null;
  private onConnectionStateChange:
    | ((state: RTCPeerConnectionState) => void)
    | null = null;
  private onError: ((error: Error) => void) | null = null;

  constructor() {}

  /**
   * Initialize peer connection with event handlers
   */
  async initialize(
    localStream: MediaStream,
    callbacks: {
      onSignal?: (signal: WebRtcSignal) => void;
      onRemoteStream?: (stream: MediaStream) => void;
      onIceCandidate?: (candidate: IceCandidate) => void;
      onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> {
    try {
      this.localStream = localStream;
      this.onSignal = callbacks.onSignal || null;
      this.onRemoteStream = callbacks.onRemoteStream || null;
      this.onIceCandidate = callbacks.onIceCandidate || null;
      this.onConnectionStateChange =
        callbacks.onConnectionStateChange || null;
      this.onError = callbacks.onError || null;

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(rtcConfig);

      // Add local stream tracks
      localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, localStream);
      });

      // Setup ice candidate handler
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate: IceCandidate = {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
          };
          this.onIceCandidate?.(candidate);
        }
      };

      // Setup remote stream handler
      this.peerConnection.ontrack = (event) => {
        console.log("📹 Remote track received:", event.track.kind);
        this.onRemoteStream?.(event.streams[0]);
      };

      // Setup connection state change
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState;
        console.log("📡 Connection state:", state);
        this.onConnectionStateChange?.(state || "new");
      };

      // Setup data channel
      this.setupDataChannel();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
      throw err;
    }
  }

  /**
   * Create and send offer
   */
  async createOffer(): Promise<void> {
    try {
      if (!this.peerConnection) throw new Error("Peer connection not initialized");

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peerConnection.setLocalDescription(offer);

      this.onSignal?.({
        type: "offer",
        sdp: offer.sdp,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
      throw err;
    }
  }

  /**
   * Handle and respond to offer
   */
  async handleOffer(sdp: string): Promise<void> {
    try {
      if (!this.peerConnection) throw new Error("Peer connection not initialized");

      const offer = new RTCSessionDescription({ type: "offer", sdp });
      await this.peerConnection.setRemoteDescription(offer);

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.onSignal?.({
        type: "answer",
        sdp: answer.sdp,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
      throw err;
    }
  }

  /**
   * Handle answer to our offer
   */
  async handleAnswer(sdp: string): Promise<void> {
    try {
      if (!this.peerConnection) throw new Error("Peer connection not initialized");

      const answer = new RTCSessionDescription({ type: "answer", sdp });
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
      throw err;
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: IceCandidate): Promise<void> {
    try {
      if (!this.peerConnection) throw new Error("Peer connection not initialized");

      const iceCandidate = new RTCIceCandidate(candidate);
      await this.peerConnection.addIceCandidate(iceCandidate);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
      throw err;
    }
  }

  /**
   * Setup data channel for additional communication
   */
  private setupDataChannel(): void {
    if (!this.peerConnection) return;

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannelHandlers();
    };
  }

  /**
   * Setup data channel handlers
   */
  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log("📨 Data channel opened");
    };

    this.dataChannel.onclose = () => {
      console.log("📨 Data channel closed");
    };

    this.dataChannel.onerror = (error) => {
      console.error("📨 Data channel error:", error);
    };

    this.dataChannel.onmessage = (event) => {
      console.log("📨 Data channel message:", event.data);
    };
  }

  /**
   * Send data through data channel
   */
  sendData(message: string): void {
    if (
      this.dataChannel &&
      this.dataChannel.readyState === "open"
    ) {
      this.dataChannel.send(message);
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): RTCPeerConnectionState {
    return this.peerConnection?.connectionState || "new";
  }

  /**
   * Get peer connection stats
   */
  async getStats(): Promise<RTCStatsReport> {
    if (!this.peerConnection) throw new Error("Peer connection not initialized");
    return this.peerConnection.getStats();
  }

  /**
   * Close connection and cleanup
   */
  close(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.peerConnection = null;
    this.localStream = null;
  }
}

/**
 * Media Stream Manager
 * Handles audio/video stream capture
 */
export class MediaStreamManager {
  static async getMediaStream(
    constraints: MediaStreamConstraints = {
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }
  ): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Failed to get media stream:", err);
      throw err;
    }
  }

  static async getAudioOnlyStream(): Promise<MediaStream> {
    return this.getMediaStream({ audio: true, video: false });
  }

  static async getVideoStream(): Promise<MediaStream> {
    return this.getMediaStream({
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
  }

  static stopMediaStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  static async switchCamera(stream: MediaStream): Promise<MediaStream> {
    try {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) throw new Error("No video track found");

      // Get all devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      if (videoDevices.length <= 1) {
        throw new Error("No alternative camera found");
      }

      // Stop current track
      videoTrack.stop();

      // Get new stream from different device
      const newStream = await this.getVideoStream();
      return newStream;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Failed to switch camera:", err);
      throw err;
    }
  }
}
