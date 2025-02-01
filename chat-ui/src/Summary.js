import React from 'react';
import './ChatArea.css';

const Summary = ({ summary, suggestion }) => {
  return (
    <div className="preConversation">
      <p className="summary"><b>ChatMail: </b>{summary}</p>
      <p className="suggestion">{suggestion}</p>
      <div className="actionButtons">
        <button className="agreeButton">Agree</button>
        <button className="improveButton">Improve</button>
      </div>
    </div>
  );
};

export default Summary;