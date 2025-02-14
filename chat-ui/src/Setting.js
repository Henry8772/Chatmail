import React, { useState } from 'react';
import './Setting.css';
import { MdEmail } from 'react-icons/md'; // Import the email icon

// Component for a single email item
const EmailItem = ({ email, onPersonalityChange, onAliasChange, onKnowledgeUpload }) => {
  // Handle file selection change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onKnowledgeUpload(email.id, file);
  };

  return (
    <div className="email-item">
      {/* Display email with icon on its own line */}
      <p>
        <MdEmail className="email-icon" />
        {email.email}
      </p>

      {/* Personality field on the same line */}
      <div className="input-group personality-group">
        <label>Personality</label>
        <input
          type="text"
          value={email.personality}
          onChange={(e) => onPersonalityChange(email.id, e.target.value)}
        />
      </div>

      {/* Alias field on the same line */}
      <div className="input-group alias-group">
        <label>Alias</label>
        <input
          type="text"
          value={email.alias || ''}
          onChange={(e) => onAliasChange(email.id, e.target.value)}
        />
      </div>

      {/* Knowledge field on the same line */}
      <div className="input-group knowledge-group">
        <label>Knowledge</label>
        <input type="file" onChange={handleFileChange} />
        {email.knowledge && (
          <span className="upload-info">Uploaded: {email.knowledge.name}</span>
        )}
      </div>
    </div>
  );
};

// Component for the email list
const EmailList = ({ emails, onPersonalityChange, onAliasChange, onKnowledgeUpload }) => {
  return (
    <div className="email-list">
      <h2>Accounts</h2>
      {emails.map((email) => (
        <EmailItem
          key={email.id}
          email={email}
          onPersonalityChange={onPersonalityChange}
          onAliasChange={onAliasChange}
          onKnowledgeUpload={onKnowledgeUpload}
        />
      ))}
    </div>
  );
};

// Main settings page component accepting email data as a prop
const Setting = ({ initialUser }) => {
  const [user, setUser] = useState(initialUser);

  // Update personality value for a given email
  const handlePersonalityChange = (id, newPersonality) => {
    setUser((prevUser) => ({
      ...prevUser,
      emails: prevUser.emails.map((email) =>
        email.id === id ? { ...email, personality: newPersonality } : email
      ),
    }));
  };

  // Update alias for a given email
  const handleAliasChange = (id, newAlias) => {
    setUser((prevUser) => ({
      ...prevUser,
      emails: prevUser.emails.map((email) =>
        email.id === id ? { ...email, alias: newAlias } : email
      ),
    }));
  };

  // Update knowledge file for a given email
  const handleKnowledgeUpload = (id, file) => {
    setUser((prevUser) => ({
      ...prevUser,
      emails: prevUser.emails.map((email) =>
        email.id === id ? { ...email, knowledge: file } : email
      ),
    }));
  };

  return (
    <div className="setting-page">
      {/* User Info Section */}
      <div className="user-info">
        <h1>{user.username}</h1>
        <p>{user.info}</p>
      </div>

      {/* Email List Section */}
      <EmailList
        emails={user.emails}
        onPersonalityChange={handlePersonalityChange}
        onAliasChange={handleAliasChange}
        onKnowledgeUpload={handleKnowledgeUpload}
      />

      {/* Fake "Add Accounts" Button */}
      <button className="add-accounts-button">Add Accounts</button>
    </div>
  );
};

// Set default props in case no initialUser data is passed from the parent
Setting.defaultProps = {
  initialUser: {
    username: 'Alice',
    info: 'A senior product manager at ChatMail',
    emails: [
      {
        id: 1,
        email: 'chatmail@gmail.com',
        personality: 'Personal and humorous',
        alias: 'personal',
        knowledge: null,
      },
      {
        id: 2,
        email: 'product-manager@chatmail.com',
        personality: 'A professional senior product manager',
        alias: 'official',
        knowledge: null,
      },
    ],
  },
};

export default Setting;