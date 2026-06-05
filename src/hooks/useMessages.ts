import { useEffect, useRef, useState, useCallback } from "react";
import { getByConversation, markAsRead } from "@/services/api/messages.api";
import { markMessagesReadSignalR } from "@/services/socket/chat.actions";
import { useChatStore } from "@/store/chat.store";
import { MessagePayload, MessageRow } from "@/types/chat.types";

// Stable reference for "no messages" — returning `[]` from a selector creates
// a fresh array every render and causes infinite re-renders in Zustand v5.
const EMPTY_MESSAGES: MessagePayload[] = [];

function rowToPayload(row: MessageRow): MessagePayload {
  return {
    messageId: Number(row.messageid),
    conversationId: Number(row.conversationid),
    senderId: Number(row.senderuserid),
    senderName: row.username,
    message: row.messagecontent ?? "",
    clientMessageId: row.clientmessageid != null ? Number(row.clientmessageid) : undefined,
    sentAt: row.creationdate ?? new Date().toISOString(),
    isEdited: (row.isedited ?? 0) > 0,
    isDeleted: (row.isdeleted ?? 0) > 0,
  };
}

/** The backend wraps DataTable rows; older builds returned `{ Rows: [...] }`. */
function extractRows(model: unknown): MessageRow[] {
  if (Array.isArray(model)) return model as MessageRow[];
  if (model && typeof model === "object") {
    const obj = model as { Rows?: MessageRow[]; rows?: MessageRow[] };
    if (Array.isArray(obj.Rows)) return obj.Rows;
    if (Array.isArray(obj.rows)) return obj.rows;
  }
  return [];
}

const PAGE_SIZE = 50;

export function useMessages(conversationId: number | null) {
  const setMessages = useChatStore((s) => s.setMessages);
  const prependMessages = useChatStore((s) => s.prependMessages);
  const markRead = useChatStore((s) => s.markConversationRead);
  const messages = useChatStore((s) =>
    conversationId
      ? s.messagesByConversation[conversationId] ?? EMPTY_MESSAGES
      : EMPTY_MESSAGES
  );

  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadedConvId = useRef<number | null>(null);

  const loadInitial = useCallback(
    async (convId: number) => {
      setLoading(true);
      setHasMore(true);
      try {
        const res = await getByConversation({ conversationId: convId, pageSize: PAGE_SIZE });
        const rows = extractRows(res?.Model);
        // Backend returns DESC by messageid; render needs ascending so the
        // newest message is at the bottom.
        const ordered = [...rows].reverse();
        const payloads = ordered.map(rowToPayload);
        setMessages(convId, payloads);
        if (rows.length < PAGE_SIZE) setHasMore(false);

        if (payloads.length > 0) {
          const lastId = payloads[payloads.length - 1].messageId;
          markRead(convId);
          markAsRead(convId, lastId).catch(() => {});
          markMessagesReadSignalR(convId, lastId).catch(() => {});
        }
      } catch {
        // silently fail — connection may not be ready
      } finally {
        setLoading(false);
      }
    },
    [setMessages, markRead]
  );

  useEffect(() => {
    if (!conversationId) return;
    if (loadedConvId.current === conversationId) return;
    loadedConvId.current = conversationId;
    loadInitial(conversationId);
  }, [conversationId, loadInitial]);

  const loadOlder = useCallback(async () => {
    if (!conversationId || loadingOlder || !hasMore) return;
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingOlder(true);
    try {
      const res = await getByConversation({
        conversationId,
        beforeMessageId: oldest.messageId,
        pageSize: PAGE_SIZE,
      });
      const rows = extractRows(res?.Model);
      if (rows.length === 0) {
        setHasMore(false);
        return;
      }
      // Reverse so we prepend in chronological order.
      const ordered = [...rows].reverse();
      prependMessages(conversationId, ordered.map(rowToPayload));
      if (rows.length < PAGE_SIZE) setHasMore(false);
    } catch {
      // silently fail
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, loadingOlder, hasMore, messages, prependMessages]);

  return { messages, loading, loadingOlder, hasMore, loadOlder, reload: () => loadInitial(conversationId ?? 0) };
}
