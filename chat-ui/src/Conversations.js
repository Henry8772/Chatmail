//Conversations.js
import React from 'react';
import './Conversations.css';

const Conversations = ({ conversations, selectedConversation, onSelectConversation }) => {
  return (
    <div className="conversations">
      <h2>Conversations</h2>
      <ul className="conversationList">
        {conversations.map((convo) => (
          <li
            key={convo.id}
            className={`conversationItem ${
              selectedConversation === convo.id ? 'active' : ''
            }`}
            onClick={() => onSelectConversation(convo.id)}
          >
            <div className="conversationName">{convo.name}</div>
            <div className="conversationEmail">{convo.email}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Conversations;