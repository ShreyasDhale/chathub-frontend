import { create } from "zustand";
import { Call, CallStatus, RemoteStream } from "@/types/call.types";

type CallState = {
  // Active call
  activeCall: Call | null;
  callStatus: CallStatus;

  // Streams
  localStream: MediaStream | null;
  remoteStreams: RemoteStream[];

  // Incoming call (for ringing)
  incomingCall: Call | null;
  incomingCallRinging: boolean;

  // Actions
  setActiveCall: (call: Call) => void;
  updateCallStatus: (status: CallStatus) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (stream: RemoteStream) => void;
  removeRemoteStream: (userId: number) => void;

  // Incoming call
  setIncomingCall: (call: Call | null) => void;
  setIncomingCallRinging: (ringing: boolean) => void;

  // Cleanup
  endCall: () => void;
  reset: () => void;
};

export const useCallStore = create<CallState>((set) => ({
  activeCall: null,
  callStatus: "idle",
  localStream: null,
  remoteStreams: [],
  incomingCall: null,
  incomingCallRinging: false,

  setActiveCall: (call) =>
    set({
      activeCall: call,
      callStatus: "connecting",
    }),

  updateCallStatus: (status) =>
    set({
      callStatus: status,
    }),

  setLocalStream: (stream) =>
    set({
      localStream: stream,
    }),

  addRemoteStream: (stream) =>
    set((state) => {
      // Remove if already exists
      const filtered = state.remoteStreams.filter(
        (s) => s.userId !== stream.userId
      );
      return {
        remoteStreams: [...filtered, stream],
      };
    }),

  removeRemoteStream: (userId) =>
    set((state) => ({
      remoteStreams: state.remoteStreams.filter((s) => s.userId !== userId),
    })),

  setIncomingCall: (call) =>
    set({
      incomingCall: call,
    }),

  setIncomingCallRinging: (ringing) =>
    set({
      incomingCallRinging: ringing,
    }),

  endCall: () => {
    set((state) => {
      // Stop all media tracks
      if (state.localStream) {
        state.localStream.getTracks().forEach((track) => track.stop());
      }
      state.remoteStreams.forEach((stream) => {
        stream.stream.getTracks().forEach((track) => track.stop());
      });

      return {
        activeCall: null,
        callStatus: "idle",
        localStream: null,
        remoteStreams: [],
        incomingCall: null,
        incomingCallRinging: false,
      };
    });
  },

  reset: () =>
    set({
      activeCall: null,
      callStatus: "idle",
      localStream: null,
      remoteStreams: [],
      incomingCall: null,
      incomingCallRinging: false,
    }),
}));
