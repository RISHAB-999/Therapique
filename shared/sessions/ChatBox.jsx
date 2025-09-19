// src/shared/sessions/components/ChatBox.jsx
import React, { useState } from "react";
import "./Room.css"; // styles live in same CSS file for convenience

const ChatBox = ({ open = false, onClose = () => {} }) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (!text.trim()) return;
    // TODO: hook into socket emit to send server message
    setMessages((m) => [...m, { id: Date.now(), text, me: true }]);
    setText("");
  };

  return (
    <div className={`chatbox-root ${open ? "open" : "closed"}`} aria-hidden={!open}>
      <div className="chatbox-header">
        <div className="chatbox-title">Chat</div>
        <button className="chatbox-close" onClick={onClose}>✕</button>
      </div>

      <div className="chatbox-messages">
        {messages.length === 0 && <div className="chat-empty">No messages yet</div>}
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg ${m.me ? "me" : "them"}`}>
            <div className="chat-msg-text">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="chatbox-input">
        <input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        <button className="chat-send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
