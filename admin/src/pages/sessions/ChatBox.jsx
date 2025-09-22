// src/shared/sessions/ChatBox.jsx
import React, { useState } from "react";

const ChatBox = ({ open = false, onClose = () => {} }) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), text, me: true }]);
    setText("");
  };

  return (
    <div className={`fixed bottom-5 right-5 w-96 max-w-[90%] h-[520px] bg-gradient-to-b from-gray-900 to-gray-800 border border-white/5 rounded-lg shadow-lg flex flex-col transition-transform ${open ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0 pointer-events-none"}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-white/5">
        <span className="font-semibold text-sm">Chat</span>
        <button onClick={onClose} className="text-gray-300 hover:text-white">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.length === 0 && <div className="text-gray-400 text-center text-sm">No messages yet</div>}
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[80%] p-2 rounded-lg ${m.me ? "self-end bg-teal-700 text-white" : "self-start bg-white/5 text-gray-200"}`}>
            {m.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-white/5">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        <button onClick={sendMessage} className="px-3 py-2 bg-teal-600 rounded-lg text-white hover:bg-teal-500">Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
