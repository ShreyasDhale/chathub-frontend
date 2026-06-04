"use client";

import toast from "react-hot-toast";
import { getSignalRConnection } from "@/services/socket/signalrClient";
import { useCallStore } from "@/store/call.store";
import { Call, WebRtcSignal } from "@/types/call.types";

/**
 * Register all call-related event listeners
 * Call this from chat.socket.ts after registerChatEvents()
 */
export function registerCallEvents() {
  const connection = getSignalRConnection();
  if (!connection) return;

  // ── Incoming call ──────────────────────────────────────────────────────
  connection.on(
    "IncomingCall",
    (data: {
      callId: string;
      conversationId: number;
      callType: "audio" | "video";
      fromUserId: number;
      fromUserName?: string;
    }) => {
      console.log("📞 Incoming call:", data);

      const incomingCall: Call = {
        callId: data.callId,
        conversationId: data.conversationId,
        direction: "incoming",
        callType: data.callType,
        status: "ringing",
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        startedAt: new Date().toISOString(),
      };

      useCallStore.getState().setIncomingCall(incomingCall);
      useCallStore.getState().setIncomingCallRinging(true);

      // Show notification
      toast.success(
        `${data.fromUserName || "User"} is calling (${data.callType})...`,
        { duration: 30000 }
      );
    }
  );

  // ── Call accepted ──────────────────────────────────────────────────────
  connection.on("CallAccepted", (data: { callId: string }) => {
    console.log("✅ Call accepted:", data.callId);
    const activeCall = useCallStore.getState().activeCall;
    if (activeCall?.callId === data.callId) {
      useCallStore.getState().updateCallStatus("connected");
      toast.success("Call connected");
    }
  });

  // ── Call rejected ──────────────────────────────────────────────────────
  connection.on("CallRejected", (data: { callId: string }) => {
    console.log("❌ Call rejected:", data.callId);
    const activeCall = useCallStore.getState().activeCall;
    if (activeCall?.callId === data.callId) {
      useCallStore.getState().updateCallStatus("rejected");
      useCallStore.getState().endCall();
      toast.error("Call was rejected");
    }
  });

  // ── Call ended ─────────────────────────────────────────────────────────
  connection.on("CallEnded", (data: { callId: string }) => {
    console.log("🔚 Call ended:", data.callId);
    const activeCall = useCallStore.getState().activeCall;
    if (activeCall?.callId === data.callId) {
      useCallStore.getState().updateCallStatus("ended");
      useCallStore.getState().endCall();
      toast("Call ended");
    }
  });

  // ── Call signal (WebRTC ICE/SDP) ───────────────────────────────────────
  connection.on(
    "CallSignal",
    (data: { callId: string; signal: WebRtcSignal; fromUserId: number }) => {
      console.log("📡 Call signal received:", data.callId, data.signal.type);

      const activeCall = useCallStore.getState().activeCall;
      if (activeCall?.callId === data.callId) {
        // This event will be handled by useCall hook's handleIncomingSignal
        // Dispatch custom event so useCall can access it
        const event = new CustomEvent("webrtc-signal", {
          detail: {
            signal: data.signal,
            fromUserId: data.fromUserId,
          },
        });
        window.dispatchEvent(event);
      }
    }
  );
}

/**
 * Unregister call events
 */
export function unregisterCallEvents() {
  const connection = getSignalRConnection();
  if (!connection) return;

  connection.off("IncomingCall");
  connection.off("CallAccepted");
  connection.off("CallRejected");
  connection.off("CallEnded");
  connection.off("CallSignal");
}
