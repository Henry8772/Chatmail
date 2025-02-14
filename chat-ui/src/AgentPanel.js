import React from 'react';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import './AgentPanel.css';

const AgentPanel = ({
  event,
  messages,
  setMessages,
  message,
  setMessage,
  onSendMessage,
  quickReplies,
  emailListVisible,
  toggleEmailList,
}) => {
  if (!event) {
    return (
      <div className="agentPanel">
        <div className="agentHeader">No Event Selected</div>
      </div>
    );
  }

  const handleQuickReply = (reply) => {
    // Add the auto-reply to messages or handle it as a new email
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: reply }]);
  };

  return (
    <div className="agentPanel">
      <div className="agentHeader">
        <h3>{event.title}</h3>
        <p className="eventSummary">{event.summary}</p>
        <p className="eventSuggestion">Suggestion: {event.suggestion}</p>
      </div>

      {/* React Toggle to control EmailList visibility */}
      <div className="toggleEmailList">
        <span className="toggleText">
          {emailListVisible ? "Hide Email List" : "Show Email List"}
        </span>
        <Toggle
          checked={emailListVisible}
          onChange={toggleEmailList}
          icons={false}
        />
      </div>

      <div className="agentMessages">
        {messages.map((m) => (
          <div key={m.id} className="agentMessageBubble">
            {m.text}
          </div>
        ))}
      </div>

      <div className="agentQuickReplies">
        <strong>Quick Replies:</strong>
        <div className="replyButtons">
          {quickReplies.map((option, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(option)}
              className="replyButton"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="agentInputArea">
        <input
          type="text"
          placeholder="Ask or type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') onSendMessage();
          }}
        />
        <button onClick={onSendMessage} className="sendButton">
          Send
        </button>
      </div>
    </div>
  );
};

export default AgentPanel;