"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CHAT_INPUT_ACTIONS } from "@/constants/chatActions";
import { AttachmentPicker } from "@/components/ui/AttachmentPicker";
import { VoiceNoteRecorder } from "@/components/ui/VoiceNoteRecorder";
import ChatToolbar from "@/components/ui/ChatToolbar";
import ChatIcon from "@/components/ui/ChatIcon";

type Props = {
  conversationId?: number;
  onSend: (message: string, attachmentId?: number) => void;
  disabled?: boolean;
  onTypingChange?: (typing: boolean) => void;
};

const EMOJI_QUICK = [
  "😀", "😂", "🥰", "😎", "🤔", "🥳",
  "👍", "🙏", "🔥", "❤️", "🎉", "🤝",
  "✨", "💯", "👏", "😅", "🙌", "🚀",
];

/**
 * Message composer with attachment / voice / emoji shortcuts and send button.
 * Submission delegates to props.onSend (SignalR or REST upstream).
 */
export default function ChatInput({
  conversationId = 0,
  onSend,
  disabled = false,
  onTypingChange,
}: Props) {
  const [message, setMessage] = useState("");
  const [attachmentId, setAttachmentId] = useState<number | undefined>();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef(false);

  function emitTyping(next: boolean) {
    if (typingRef.current === next) return;
    typingRef.current = next;
    onTypingChange?.(next);
  }

  useEffect(() => {
    return () => emitTyping(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit() {
    if (!message.trim() || disabled) return;
    onSend(message, attachmentId);
    setMessage("");
    setAttachmentId(undefined);
    emitTyping(false);
  }

  const handleAttachmentSelected = useCallback((attachment: { attachmentId?: number }) => {
    if (attachment?.attachmentId) {
      setAttachmentId(attachment.attachmentId);
    }
  }, []);

  const handleVoiceNoteSent = useCallback(() => {
    setMessage("");
    setAttachmentId(undefined);
  }, []);

  function handleAction(id: string) {
    if (id === "emoji-picker") {
      setEmojiOpen((v) => !v);
    }
  }

  function insertEmoji(emoji: string) {
    setMessage((m) => m + emoji);
    setEmojiOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className="chat-input">
      <div className="chat-input-actions">
        <AttachmentPicker
          conversationId={conversationId}
          onAttachmentSelected={handleAttachmentSelected}
          disabled={disabled}
        />
        <VoiceNoteRecorder
          conversationId={conversationId}
          onVoiceNoteSent={handleVoiceNoteSent}
        />
        <div className="emoji-wrap">
          <ChatToolbar
            actions={CHAT_INPUT_ACTIONS}
            compact
            onAction={(id) => handleAction(id)}
            activeMap={{ "emoji-picker": emojiOpen }}
          />
          {emojiOpen && (
            <div className="emoji-popover" role="dialog">
              {EMOJI_QUICK.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="emoji-cell"
                  onClick={() => insertEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="text"
        className="chat-textbox"
        placeholder={disabled ? "Connecting..." : "Type a message"}
        value={message}
        disabled={disabled}
        onChange={(e) => {
          setMessage(e.target.value);
          emitTyping(e.target.value.length > 0);
        }}
        onBlur={() => emitTyping(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />

      <button
        type="button"
        className="send-button"
        disabled={disabled || !message.trim()}
        onClick={submit}
        aria-label="Send message"
        title="Send"
      >
        <ChatIcon name="send" size={18} />
        <span className="send-button-label">Send</span>
      </button>
    </div>
  );
}
