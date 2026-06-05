"use client";

import { useEffect, useRef, useMemo } from "react";
import { MessagePayload } from "@/types/chat.types";
import { useChatStore } from "@/store/chat.store";
import { useConversationStore } from "@/store/conversation.store";
import ChatIcon from "@/components/ui/ChatIcon";

// Stable empties — Zustand selectors must not return fresh references when a
// key is missing or React 19 will trigger an infinite update loop.
const EMPTY_RECEIPTS: Record<number, number> = {};
const EMPTY_TYPING: Set<number> = new Set();
type ChatMember = {
  userid: number;
  username: string;
  displayname?: string;
  avatarurl?: string;
  isonline?: number;
};
const EMPTY_MEMBERS: ChatMember[] = [];

type Props = {
  conversationId: number;
  messages: MessagePayload[];
  currentUserId: number;
  loading?: boolean;
  loadingOlder?: boolean;
  hasMore?: boolean;
  onLoadOlder?: () => void;
};

function formatTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isSame = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSame(d, today)) return "Today";
  if (isSame(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Renders the active conversation history with day separators, sender grouping,
 * pending/sent/read indicators, typing line at the bottom, and infinite scroll.
 */
export default function ChatBody({
  conversationId,
  messages,
  currentUserId,
  loading,
  loadingOlder,
  hasMore,
  onLoadOlder,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastConvIdRef = useRef<number | null>(null);
  const lastMsgCountRef = useRef(0);

  // Read receipts of OTHER users (max lastReadMessageId for non-self users)
  const readReceiptsForConv = useChatStore(
    (s) => s.readReceiptsByConversation[conversationId] ?? EMPTY_RECEIPTS
  );
  const maxOtherRead = useMemo(() => {
    let max = 0;
    for (const [uid, last] of Object.entries(readReceiptsForConv)) {
      if (Number(uid) !== currentUserId && (last as number) > max) {
        max = last as number;
      }
    }
    return max;
  }, [readReceiptsForConv, currentUserId]);

  // Typing indicator (excluding current user)
  const typingSet = useChatStore(
    (s) => s.typingByConversation[conversationId] ?? EMPTY_TYPING
  );
  const typingUserIds = useMemo(
    () => Array.from(typingSet).filter((u) => u !== currentUserId),
    [typingSet, currentUserId]
  );

  // Map memberId -> name for typing label
  const memberMap = useConversationStore(
    (s) => s.members[conversationId] ?? EMPTY_MEMBERS
  );
  const memberNameById = useMemo(() => {
    const map: Record<number, string> = {};
    for (const m of memberMap) {
      map[m.userid] = m.displayname || m.username;
    }
    return map;
  }, [memberMap]);

  // Auto-scroll to bottom on new conversation OR new message at end.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const switchedConv = lastConvIdRef.current !== conversationId;
    const newCount = messages.length;
    const grew = newCount > lastMsgCountRef.current;

    if (switchedConv) {
      el.scrollTop = el.scrollHeight;
    } else if (grew) {
      // Only auto-scroll if user is already near the bottom.
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distanceFromBottom < 160) {
        el.scrollTop = el.scrollHeight;
      }
    }

    lastConvIdRef.current = conversationId;
    lastMsgCountRef.current = newCount;
  }, [conversationId, messages.length]);

  // Infinite scroll: when scrolled near top, request older page.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onLoadOlder) return;
    function onScroll() {
      const target = el!;
      if (target.scrollTop < 80 && hasMore && !loadingOlder) {
        const beforeHeight = target.scrollHeight;
        onLoadOlder?.();
        // After load completes, restore scroll offset roughly.
        requestAnimationFrame(() => {
          if (!target) return;
          const afterHeight = target.scrollHeight;
          target.scrollTop += afterHeight - beforeHeight;
        });
      }
    }
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [onLoadOlder, hasMore, loadingOlder]);

  if (loading && messages.length === 0) {
    return (
      <div className="chat-body chat-body-empty">
        <div className="chat-body-loader">
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
        </div>
        <p className="chat-body-empty-text">Loading messages…</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="chat-body chat-body-empty">
        <div className="chat-body-empty-icon">
          <ChatIcon name="newChat" size={32} />
        </div>
        <p className="chat-body-empty-text">No messages yet</p>
        <p className="chat-body-empty-hint">Send a message to start chatting</p>
      </div>
    );
  }

  let lastDayKey = "";
  let lastSenderId: number | null = null;

  return (
    <div className="chat-body" ref={containerRef}>
      {hasMore && (
        <div className="chat-body-loadmore">
          {loadingOlder ? (
            <span className="loader-dots">
              <span /> <span /> <span />
            </span>
          ) : (
            <button
              type="button"
              className="chat-loadmore-btn"
              onClick={onLoadOlder}
            >
              Load earlier messages
            </button>
          )}
        </div>
      )}

      {messages.map((m, index) => {
        const dayKey = new Date(m.sentAt).toDateString();
        const showDay = dayKey !== lastDayKey;
        lastDayKey = dayKey;
        const isMine = m.senderId === currentUserId;
        const isContinued = lastSenderId === m.senderId && !showDay;
        lastSenderId = m.senderId;

        const status = isMine
          ? m.isOptimistic
            ? "pending"
            : maxOtherRead >= m.messageId
              ? "read"
              : "sent"
          : null;

        return (
          <div key={`${m.messageId}-${index}`}>
            {showDay && (
              <div className="chat-day-divider">
                <span>{formatDay(m.sentAt)}</span>
              </div>
            )}

            <div
              className={`message-row ${isMine ? "mine" : "theirs"} ${
                isContinued ? "continued" : ""
              }`}
            >
              {!isMine && !isContinued && m.senderName && (
                <span className="message-sender">{m.senderName}</span>
              )}
              <div
                className={`message-bubble ${isMine ? "mine" : "theirs"} ${
                  isContinued ? "continued" : ""
                } ${m.isDeleted ? "deleted" : ""}`}
              >
                {m.isDeleted ? (
                  <span className="message-deleted">Message deleted</span>
                ) : (
                  <span className="message-text">{m.message}</span>
                )}
                <span className="message-meta">
                  <span className="message-time">{formatTime(m.sentAt)}</span>
                  {m.isEdited && !m.isDeleted && (
                    <span className="message-edited">edited</span>
                  )}
                  {status && (
                    <span className={`message-status status-${status}`}>
                      {status === "pending" && (
                        <ChatIcon name="check" size={11} />
                      )}
                      {status === "sent" && (
                        <ChatIcon name="check" size={11} />
                      )}
                      {status === "read" && (
                        <span className="status-double">
                          <ChatIcon name="check" size={11} />
                          <ChatIcon name="check" size={11} />
                        </span>
                      )}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {typingUserIds.length > 0 && (
        <div className="typing-row">
          <div className="typing-bubble">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
          <span className="typing-label">
            {typingUserIds.length === 1
              ? `${memberNameById[typingUserIds[0]] || "Someone"} is typing…`
              : "Several people are typing…"}
          </span>
        </div>
      )}
    </div>
  );
}
