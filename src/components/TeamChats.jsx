import { useState } from "react";
import "./TeamChat.css";

export default function TeamChat({
  activeWorkspace,
  teamMessages,
  setTeamMessages,
}) {
  const [message, setMessage] = useState("");

  const messages =
    teamMessages[activeWorkspace] || [];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      sender: "You",
       text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTeamMessages((prev) => ({
      ...prev,

      [activeWorkspace]: [
        ...(prev[activeWorkspace] || []),
        newMessage,
      ],
    }));

    setMessage("");
  };

  if (!activeWorkspace) {
    return (
        <div className="chat-empty">
        Open a workspace to start chatting.
      </div>
    );
  }

  return (
    <div className="team-chat-container">

      <div className="chat-header">
        <h2>{activeWorkspace} Chat</h2>
        <span>{messages.length} messages</span>
      </div>

      <div className="chat-messages">

        {messages.length === 0 ? (
          <div className="no-messages">
            No messages yet.
          </div>
        ) : (
            messages.map((msg, index) => (
            <div
              className="chat-message"
              key={index}
            >
              <div className="chat-top">
                <strong>{msg.sender}</strong>
                <span>{msg.time}</span>
              </div>

              <p>{msg.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-area">

        <input
          type="text"
          placeholder="Type a message..."
           value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />

        <button onClick={handleSendMessage}>
          Send
        </button>

      </div>
    </div>
  );
}