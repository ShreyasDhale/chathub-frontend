import { getUserId } from "../../utils/auth.storage";

type Message = {
  messageId: number;
  conversationId: number;
  senderId: number;
  message: string;
};

type Props = {
  messages: Message[];
  activeChatId: number;
};

export default function ChatBody({ messages, activeChatId }: Props) {
  const currentUserId = getUserId();

  const filtered = messages.filter(
    m => m.conversationId === activeChatId
  );

  return (
    <div className="chat-body">
      {filtered.map((m, index) => {
        const isMine = m.senderId.toString() === currentUserId;
        const prev = filtered[index - 1];
        const isContinued =
          prev && prev.senderId === m.senderId;

        return (
          <div
            key={m.messageId}
            className={`message-row ${isMine ? "mine" : "theirs"} ${
              isContinued ? "continued" : ""
            }`}
          >
            <div
              className={`message-bubble ${isMine ? "mine" : "theirs"} ${
                isContinued ? "continued" : ""
              }`}
            >
              {m.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
