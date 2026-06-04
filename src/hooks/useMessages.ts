import { useEffect, useRef, useState, useCallback } from "react";
import { getByConversation } from "@/services/api/messages.api";
import { markAsRead } from "@/services/api/messages.api";
import { markMessagesReadSignalR } from "@/services/socket/chat.actions";
import { useChatStore } from "@/store/chat.store";
import { MessagePayload, MessageRow } from "@/types/chat.types";

function rowToPayload(row: MessageRow): MessagePayload {
  return {
    messageId: row.messageid,
    conversationId: row.conversationid,
    senderId: row.senderuserid,
    senderName: row.username,
    message: row.messagecontent,
    clientMessageId: row.clientmessageid,
    sentAt: row.creationdate,
    isEdited: (row.isedited ?? 0) > 0,
    isDeleted: (row.isdeleted ?? 0) > 0,
  };
}

const PAGE_SIZE = 50;

export function useMessages(conversationId: number | null) {
  const setMessages = useChatStore((s) => s.setMessages);
  const prependMessages = useChatStore((s) => s.prependMessages);
  const markRead = useChatStore((s) => s.markConversationRead);
  const messages = useChatStore(
    (s) => (conversationId ? s.messagesByConversation[conversationId] ?? [] : [])
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
        const rows: MessageRow[] = res?.Model ?? [];
        const payloads = rows.map(rowToPayload);
        setMessages(convId, payloads);
        if (rows.length < PAGE_SIZE) setHasMore(false);

        // Mark as read after load
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
    // Only reload if switching to a different conversation
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
      const rows: MessageRow[] = res?.Model ?? [];
      if (rows.length === 0) {
        setHasMore(false);
        return;
      }
      prependMessages(conversationId, rows.map(rowToPayload));
      if (rows.length < PAGE_SIZE) setHasMore(false);
    } catch {
      // silently fail
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, loadingOlder, hasMore, messages, prependMessages]);

  return { messages, loading, loadingOlder, hasMore, loadOlder };
}
