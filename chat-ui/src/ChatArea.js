import React from 'react';
import Summary from './Summary';
import './ChatArea.css';

const ChatArea = ({
  messages,
  message,
  setMessage,
  sendMessage,
  summary,
  suggestion,
}) => {
  return (
    <div className="chatArea">
      {/* Render Summary component with passed parameters */}
      <Summary summary={summary} suggestion={suggestion} />
      
      {/* Message container */}
      <div className="messageContainer">
        {messages.map((item) => (
          <div key={item.id} className="messageBubble">
            <p className="messageText">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Input container */}
      <div className="inputContainer">
        <input
          className="input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatArea;