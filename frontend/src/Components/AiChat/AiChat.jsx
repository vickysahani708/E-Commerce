import { useState } from "react";
import "./AiChat.css";
import chatIcon from "../assets/robot.png";

const AiChat = () => {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const toggleChatVisibility = () => {
    setIsChatVisible(!isChatVisible);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChat(prev => [...prev, { sender: "user", text: message }]);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      setChat(prev => [...prev, { sender: "ai", text: data.reply }]);
    } catch (error) {
      setChat(prev => [
        ...prev,
        { sender: "ai", text: "AI is unavailable right now." }
      ]);
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <div>
      {/* Chat Icon */}
      {!isChatVisible && (
        <div className="chat-icon" onClick={toggleChatVisibility}>
          <img src={chatIcon} alt="Chat Icon" />
        </div>
      )}

      {/* Chat Window */}
      {isChatVisible && (
        <div className="ai-chat">
          <h4>AI Assistant</h4>

          <div className="chat-box">
            {chat.map((m, i) => (
              <div key={i} className={m.sender}>
                {m.text}
              </div>
            ))}
            {loading && <div className="ai">Typing...</div>}
          </div>

          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Ask about products, orders..."
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />

          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>

          <button className="close-chat" onClick={toggleChatVisibility}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default AiChat;
