import { useCallback, useEffect, useRef } from "react";
import {
  getSignalRConnection,
} from "@/services/socket/signalrClient";
import { useCallStore } from "@/store/call.store";
import { Call, CallType, WebRtcSignal } from "@/types/call.types";
import { WebRtcPeerConnection, MediaStreamManager } from "@/services/call/webrtcManager";
import toast from "react-hot-toast";

export function useCall(conversationId: number, userId: number) {
  const peerConnectionRef = useRef<WebRtcPeerConnection | null>(null);
  const {
    activeCall,
    callStatus,
    setActiveCall,
    updateCallStatus,
    setLocalStream,
    addRemoteStream,
    incomingCall,
    setIncomingCall,
    setIncomingCallRinging,
    endCall,
  } = useCallStore();

  /**
   * Start outgoing call
   */
  const startCall = useCallback(
    async (callType: CallType) => {
      try {
        const connection = getSignalRConnection();
        if (!connection) throw new Error("SignalR not connected");

        updateCallStatus("connecting");

        // Get media stream
        const stream =
          callType === "audio"
            ? await MediaStreamManager.getAudioOnlyStream()
            : await MediaStreamManager.getVideoStream();

        setLocalStream(stream);

        // Initialize peer connection
        peerConnectionRef.current = new WebRtcPeerConnection();
        await peerConnectionRef.current.initialize(stream, {
          onSignal: (signal) => handleSignal(signal),
          onRemoteStream: (remoteStream) =>
            addRemoteStream({
              userId: 0, // Will be updated when we know remote user
              stream: remoteStream,
            }),
          onConnectionStateChange: (state) => {
            if (state === "connected") {
              updateCallStatus("connected");
            } else if (state === "failed" || state === "disconnected") {
              updateCallStatus("failed");
            }
          },
          onError: (error) => {
            console.error("WebRTC error:", error);
            toast.error("Call error: " + error.message);
            updateCallStatus("failed");
          },
        });

        // Create call object
        const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const newCall: Call = {
          callId,
          conversationId,
          direction: "outgoing",
          callType,
          status: "ringing",
          fromUserId: userId,
          startedAt: new Date().toISOString(),
        };

        setActiveCall(newCall);

        // Invoke StartCall via SignalR
        await connection.invoke("StartCall", conversationId, callType);

        // Create offer
        await peerConnectionRef.current.createOffer();

        toast.success("Call started");
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        toast.error("Failed to start call: " + err.message);
        updateCallStatus("failed");
        endCall();
      }
    },
    [conversationId, userId, updateCallStatus, setLocalStream, setActiveCall, addRemoteStream, endCall]
  );

  /**
   * Accept incoming call
   */
  const acceptCall = useCallback(async () => {
    try {
      if (!incomingCall) throw new Error("No incoming call");

      const connection = getSignalRConnection();
      if (!connection) throw new Error("SignalR not connected");

      // Get media stream
      const stream =
        incomingCall.callType === "audio"
          ? await MediaStreamManager.getAudioOnlyStream()
          : await MediaStreamManager.getVideoStream();

      setLocalStream(stream);

      // Initialize peer connection
      peerConnectionRef.current = new WebRtcPeerConnection();
      await peerConnectionRef.current.initialize(stream, {
        onSignal: (signal) => handleSignal(signal),
        onRemoteStream: (remoteStream) =>
          addRemoteStream({
            userId: incomingCall.fromUserId,
            userName: incomingCall.fromUserName,
            stream: remoteStream,
          }),
        onConnectionStateChange: (state) => {
          if (state === "connected") {
            updateCallStatus("connected");
          }
        },
        onError: (error) => {
          console.error("WebRTC error:", error);
          toast.error("Call error: " + error.message);
        },
      });

      setActiveCall(incomingCall);
      setIncomingCall(null);
      setIncomingCallRinging(false);
      updateCallStatus("connecting");

      // Invoke AcceptCall via SignalR
      await connection.invoke("AcceptCall", incomingCall.callId);

      toast.success("Call accepted");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast.error("Failed to accept call: " + err.message);
      updateCallStatus("failed");
    }
  }, [incomingCall, setLocalStream, addRemoteStream, setActiveCall, setIncomingCall, setIncomingCallRinging, updateCallStatus]);

  /**
   * Reject incoming call
   */
  const rejectCall = useCallback(async () => {
    try {
      if (!incomingCall) throw new Error("No incoming call");

      const connection = getSignalRConnection();
      if (!connection) throw new Error("SignalR not connected");

      await connection.invoke("RejectCall", incomingCall.callId);
      setIncomingCall(null);
      setIncomingCallRinging(false);
      toast.info("Call rejected");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast.error("Failed to reject call: " + err.message);
    }
  }, [incomingCall, setIncomingCall, setIncomingCallRinging]);

  /**
   * End active call
   */
  const hangUpCall = useCallback(async () => {
    try {
      if (!activeCall) return;

      const connection = getSignalRConnection();
      if (connection) {
        await connection.invoke("EndCall", activeCall.callId);
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      endCall();
      toast.success("Call ended");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Failed to end call:", err);
      endCall();
    }
  }, [activeCall, endCall]);

  /**
   * Handle WebRTC signals
   */
  const handleSignal = useCallback(
    async (signal: WebRtcSignal) => {
      try {
        if (!activeCall) throw new Error("No active call");

        const connection = getSignalRConnection();
        if (!connection) throw new Error("SignalR not connected");

        await connection.invoke("SendCallSignal", activeCall.callId, signal);
      } catch (error) {
        console.error("Failed to send signal:", error);
      }
    },
    [activeCall]
  );

  /**
   * Handle incoming WebRTC signal
   */
  const handleIncomingSignal = useCallback(
    async (signal: WebRtcSignal, fromUserId: number) => {
      try {
        if (!peerConnectionRef.current) return;

        switch (signal.type) {
          case "offer":
            if (signal.sdp) {
              await peerConnectionRef.current.handleOffer(signal.sdp);
            }
            break;
          case "answer":
            if (signal.sdp) {
              await peerConnectionRef.current.handleAnswer(signal.sdp);
            }
            break;
          case "ice-candidate":
            if (signal.candidate) {
              await peerConnectionRef.current.addIceCandidate(signal.candidate);
            }
            break;
        }
      } catch (error) {
        console.error("Failed to handle signal:", error);
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, []);

  return {
    activeCall,
    callStatus,
    incomingCall,
    startCall,
    acceptCall,
    rejectCall,
    hangUpCall,
    handleIncomingSignal,
  };
}
