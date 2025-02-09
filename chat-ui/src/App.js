import React, { useState } from 'react';
import Banner from './Banner';
import EventDashboard from './EventDashboard';
import EmailList from './EmailList';
import AgentPanel from './AgentPanel'; // NEW combined "chat + auto-reply" panel
import './App.css';

const ChatApp = () => {
  // 1. EVENT-CENTRIC DATA
  const [events, setEvents] = useState([
    {
      id: 'ev1',
      title: 'Job Applications',
      description: 'Emails related to ongoing job applications',
      emails: [
        {
          id: 'e1',
          sender: 'Google HR',
          subject: 'Opportunity at Google',
          snippet: 'We are impressed by your credentials...',
          time: '10:30 AM',
          category: 'Job Applications',
        },
        {
          id: 'e2',
          sender: 'Microsoft HR',
          subject: 'Your Application at Microsoft',
          snippet: 'Your profile matches our requirements...',
          time: '11:45 AM',
          category: 'Job Applications',
        },
      ],
      summary: 'Google and Microsoft are both showing interest in your profile.',
      suggestion: 'You might follow up with your updated CV.',
    },
    {
      id: 'ev2',
      title: 'Meeting with Dr. Who',
      description: 'Emails & tasks for upcoming meeting',
      emails: [
        {
          id: 'e3',
          sender: 'Dr. Who',
          subject: 'Re: Meeting Details',
          snippet: 'Let’s schedule a conversation next Tuesday',
          time: 'Yesterday',
          category: 'Meetings',
        },
      ],
      summary: 'Dr. Who is requesting a meeting next week to discuss your research.',
      suggestion: 'Propose a few time slots or request a topic agenda.',
    },
  ]);

  // 2. SELECTED EVENT
  const [selectedEventId, setSelectedEventId] = useState('ev1');

  // 3. MESSAGES + USER INPUT
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  // 4. SENDING A MESSAGE (example)
  const sendMessage = () => {
    if (message.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), text: message },
      ]);
      setMessage('');
    }
  };

  /**
   * 5. Generate “event-level” quick replies
   */
  const generateQuickRepliesForEvent = (event) => {
    if (!event) return [];

    // Simple placeholder logic
    if (event.title === 'Job Applications') {
      return [
        'Send Updated CV',
        'Request More Details About the Role',
        'Politely Decline Opportunities',
      ];
    } else if (event.title === 'Meeting with Dr. Who') {
      return [
        'Confirm Tuesday at 2 PM',
        'Request an Alternate Time',
        'Ask for Meeting Agenda',
      ];
    }
    return ['Acknowledge Email', 'No action needed'];
  };

  // 6. Currently selected event
  const currentEvent = events.find((ev) => ev.id === selectedEventId);

  // 7. Quick replies for this event
  const eventQuickReplies = generateQuickRepliesForEvent(currentEvent);

  return (
    <div className="chatApp">
      <Banner />
      <div className="chatAppContainer">
        {/* LEFT PANEL: EventDashboard */}
        <EventDashboard
          events={events}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
        />

        {/* MIDDLE/RIGHT: 
            You can choose if you still want to see EmailList on the right, 
            or shrink it, or remove it. Here we keep it for clarity. 
        */}
        <EmailList emails={currentEvent?.emails || []} />

        {/* COMBINED AGENT PANEL: summary + messages + quick replies */}
        <AgentPanel
          event={currentEvent}
          messages={messages}
          setMessages={setMessages}
          message={message}
          setMessage={setMessage}
          onSendMessage={sendMessage}
          quickReplies={eventQuickReplies}
        />
      </div>
    </div>
  );
};

export default ChatApp;