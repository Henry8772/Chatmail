import React, { useState } from 'react';
import Conversations from './Conversations';
import ChatArea from './ChatArea';
import EmailList from './EmailList';
import Banner from './Banner';  // Import the Banner component
import './App.css';

const ChatApp = () => {
  // Sample conversations
  const [conversations] = useState([
    { id: '1', name: 'Job Opportunity', email: 'personal@gmail.com' },
    { id: '2', name: 'Poopycode Review', email: 'personal_github@gmail.com' },
    { id: '3', name: 'Meeting with Dr Who', email: 'student@ucl.ac.uk' },
  ]);

  // Message state for the current conversation
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState({
    summary:
      'Exciting news! HR teams from Google and Microsoft have expressed interest in your profile.',
    suggestion:
      'Next Steps: Consider replying with your updated CV to seize these fantastic opportunities!',
  });
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (message.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), text: message },
      ]);
      setMessage('');
    }
  };

  // Sample email data
  const [emails] = useState([
    {
      id: 'e1',
      sender: 'Google HR',
      subject: 'Opportunity at Google',
      snippet:
        'We are impressed by your credentials and would like to invite you for an interview.',
      time: '10:30 AM',
    },
    {
      id: 'e2',
      sender: 'Microsoft HR',
      subject: 'Your Application at Microsoft',
      snippet:
        'Your profile matches our requirements. Let’s schedule a conversation soon!',
      time: '11:45 AM',
    },
    {
      id: 'e3',
      sender: 'Microsoft HR',
      subject: 'Next Steps at Microsoft',
      snippet:
        'Please send us your updated CV to proceed further with your application.',
      time: 'Yesterday',
    },
  ]);

  return (
    <div className="appWrapper">
      <Banner />
      <div className="appContainer">
        <Conversations
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />
        <ChatArea
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          summary={summary.summary}
          suggestion={summary.suggestion}
        />
        <EmailList emails={emails} />
      </div>
    </div>
  );
};

export default ChatApp;