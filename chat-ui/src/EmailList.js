import React, { useState } from 'react';
import EmailModal from './EmailModal';
import './EmailList.css';

const EmailList = ({ emails }) => {
  console.log(emails);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Filter emails based on active folder ("inbox" or "sent")
  const filteredEmails = emails.filter(email => email.type === activeFolder);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const closeModal = () => {
    setSelectedEmail(null);
  };

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
          <li
            key={email.id}
            className="emailListItem"
            onClick={() => handleEmailClick(email)}
          >
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
      {/* Render the modal */}
      <EmailModal
        isOpen={!!selectedEmail}
        onRequestClose={closeModal}
        email={selectedEmail}
      />
    </div>
  );
};

export default EmailList;