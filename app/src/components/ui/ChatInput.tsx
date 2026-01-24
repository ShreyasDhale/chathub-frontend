// components/ChatInput.tsx
import { useState } from "react";

type Props = {
  onSend: (message: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  const [message, setMessage] = useState("");

  return (
    <div className="chat-input">
      <input
        type="text"
        className="chat-textbox"
        placeholder="Type a message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            onSend(message);
            setMessage("");
          }
        }}
      />
      <button
        className="send-button"
        onClick={() => {
          onSend(message);
          setMessage("");
        }}
      >
        Send
      </button>
    </div>
  );
}
