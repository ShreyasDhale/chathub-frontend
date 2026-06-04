/**
 * Call and WebRTC related types
 */

export type CallType = "audio" | "video";

export type CallStatus =
  | "idle"
  | "ringing"
  | "connecting"
  | "connected"
  | "ended"
  | "rejected"
  | "failed";

export type CallDirection = "incoming" | "outgoing";

export type Call = {
  callId: string;
  conversationId: number;
  direction: CallDirection;
  callType: CallType;
  status: CallStatus;
  fromUserId: number;
  fromUserName?: string;
  toUserId?: number;
  toUserName?: string;
  startedAt?: string; // ISO 8601
  endedAt?: string; // ISO 8601
  duration?: number; // seconds
};

export type IceCandidate = {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid?: string;
};

export type WebRtcSignal = {
  type: "offer" | "answer" | "ice-candidate";
  sdp?: string; // For offer/answer
  candidate?: IceCandidate; // For ice-candidate
};

export type WebRtcSignalPayload = {
  callId: string;
  fromUserId: number;
  signal: WebRtcSignal;
};

export type RemoteStream = {
  userId: number;
  userName?: string;
  stream: MediaStream;
};
