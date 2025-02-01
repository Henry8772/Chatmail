import React from 'react';
import './EmailList.css';

const EmailList = ({ emails }) => {
  return (
    <div className="emailList">
      <h2>Emails</h2>
      <ul className="emailListItems">
        {emails.map((email) => (
          <li key={email.id} className="emailListItem">
            <div className="emailSender">{email.sender}</div>
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