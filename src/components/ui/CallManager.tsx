"use client";

import { useEffect, useState } from "react";
import { useCallStore } from "@/store/call.store";
import { useCall } from "@/hooks/useCall";
import { getUserId } from "@/utils/auth.storage";
import { IncomingCallModal } from "@/components/ui/IncomingCallModal";
import { ActiveCallScreen } from "@/components/ui/ActiveCallScreen";

/**
 * Single call lifecycle host. Owns the unique useCall hook instance for the
 * dashboard (and any peer connection it manages) and renders the global
 * incoming-ring + active-call UI.
 */
export default function CallManager() {
  const { incomingCall, activeCall } = useCallStore();
  const userId = Number(getUserId() ?? 0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The hook needs a conversation id; for accept/reject/hangup the value isn't
  // semantically used (those work off the call store), so we pick whichever id
  // is currently relevant.
  const conversationId =
    activeCall?.conversationId ?? incomingCall?.conversationId ?? 0;
  const { acceptCall, rejectCall, hangUpCall } = useCall(conversationId, userId);

  if (!mounted) return null;

  return (
    <>
      <IncomingCallModal onAccept={acceptCall} onReject={rejectCall} />
      <ActiveCallScreen onHangUp={hangUpCall} />
    </>
  );
}
