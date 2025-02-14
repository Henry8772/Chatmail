import React, { useState } from 'react';
import './EmailList.css';

const EmailList = ({ emails }) => {
  const [activeFolder, setActiveFolder] = useState('inbox');

  // Filter emails based on active folder ("inbox" or "sent")
  const filteredEmails = emails.filter(email => email.type === activeFolder);

  return (
    <div className="emailList">
      <div className="folderSwitch">
        <button
          className={`folderButton ${activeFolder === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveFolder('inbox')}
        >
          Inbox
        </button>
        <button
          className={`folderButton ${activeFolder === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveFolder('sent')}
        >
          Sent
        </button>
      </div>
      <h2>Emails</h2>
      <ul className="emailListItems">
        {filteredEmails.map((email) => (
          <li key={email.id} className="emailListItem">
            <div className="emailSender">
              <span className="emailPrefix">
                {activeFolder === 'inbox' ? 'FROM: ' : 'TO: '}
              </span>
              <span>
                {activeFolder === 'inbox' ? email.sender : email.receiver}
              </span>
            </div>
            <div className="emailDetails">
              <span className="emailSubject">{email.subject}</span>
              <span className="emailSnippet">{email.snippet}</span>
            </div>
            <div className="emailTime">{email.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailList;