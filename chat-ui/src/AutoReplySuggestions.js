import React from 'react';
import './AutoReplySuggestions.css';

const AutoReplySuggestions = ({ email, options, onSendAutoReply }) => {
  // If no email or no options, render nothing or a fallback UI
  if (!email || !options?.length) return null;

  return (
    <div className="autoReplyContainer">
      <h3 className="autoReplyTitle">
        Quick Replies for <span>{email.subject}</span>
      </h3>
      <div className="autoReplyButtons">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSendAutoReply(option)}
            className="autoReplyButton"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AutoReplySuggestions;