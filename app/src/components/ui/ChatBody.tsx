// components/ChatBody.tsx
type Props = {
  messages: any[];
  activeChatId: number;
};

export default function ChatBody({ messages, activeChatId }: Props) {
  return (
    <div className="chat-body">
      {messages
        .filter(m => m.conversationId === activeChatId)
        .map(m => (
          <div key={m.messageId} className="message">
            <b>{m.senderId}</b>: {m.message}
          </div>
        ))}
    </div>
  );
}
