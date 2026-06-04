"use client";

import { useState, useCallback } from "react";
import { CHAT_INPUT_ACTIONS } from "@/constants/chatActions";
import { AttachmentPicker } from "@/components/ui/AttachmentPicker";
import { VoiceNoteRecorder } from "@/components/ui/VoiceNoteRecorder";
import ChatToolbar from "@/components/ui/ChatToolbar";

type Props = {
  conversationId?: number;
  onSend: (message: string, attachmentId?: number) => void;
  disabled?: boolean;
};

/**
 * Message composer with attachment/emoji/voice shortcuts and send button.
 * Send uses the existing SignalR SendMessage hub method.
 */
export default function ChatInput({ conversationId = 0, onSend, disabled = false }: Props) {
  const [message, setMessage] = useState("");
  const [attachmentId, setAttachmentId] = useState<number | undefined>();

  function submit() {
    if (!message.trim() || disabled) return;
    onSend(message, attachmentId);
    setMessage("");
    setAttachmentId(undefined);
  }

  const handleAttachmentSelected = useCallback((attachment: any) => {
    if (attachment?.attachmentId) {
      setAttachmentId(attachment.attachmentId);
    }
  }, []);

  const handleVoiceNoteSent = useCallback(() => {
    // Voice note was sent successfully, reset state
    setMessage("");
    setAttachmentId(undefined);
  }, []);

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
        <ChatToolbar actions={CHAT_INPUT_ACTIONS} compact />
      </div>

      <input
        type="text"
        className="chat-textbox"
        placeholder="Type a message"
        value={message}
        disabled={disabled}
        onChange={(e) => setMessage(e.target.value)}
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
      >
        Send
      </button>
    </div>
  );
}
