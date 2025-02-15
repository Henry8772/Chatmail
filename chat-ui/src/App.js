import React, { useState, useEffect } from 'react';
import { Router, Route } from 'wouter';
import Banner from './Banner';
import EventDashboard from './EventDashboard';
import EmailList from './EmailList';
import AgentPanel from './AgentPanel';
import Setting from './Setting';
import './App.css';
import Meeting from './Meeting';

// 1. Import the JSON data
import data from './data/data.json';

const ChatApp = () => {
  // 2. Set up a state variable for events, initially empty
  const [events, setEvents] = useState([]);

  // 3. Load the data.json content into the `events` state on component mount
  useEffect(() => {
    setEvents(data);
  }, []);

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

  // 5. Generate “event-level” quick replies
  const generateQuickRepliesForEvent = (event) => {
    if (!event) return [];
    // if (event.title === 'Job Applications') {
    //   return [
    //     'Send Updated CV',
    //     'Request More Details About the Role',
    //     'Politely Decline Opportunities',
    //   ];
    // } else if (event.title === 'Meeting with Dr. Who') {
    //   return [
    //     'Confirm Tuesday at 2 PM',
    //     'Request an Alternate Time',
    //     'Ask for Meeting Agenda',
    //   ];
    // }
    return [];
  };

  // 6. Currently selected event
  const currentEvent = events.find((ev) => ev.id === selectedEventId);

  // 7. Quick replies for this event
  const eventQuickReplies = generateQuickRepliesForEvent(currentEvent);

  // 8. Group events by category in App.js
  const groupedEvents = events.reduce((acc, event) => {
    let group = '';
    if (event.title === 'Job Applications') {
      group = 'High Priority';
    } else if (event.title === 'Meeting with Dr. Who') {
      group = 'Followup';
    } else {
      group = 'Other';
    }
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(event);
    return acc;
  }, {});

  // 9. Control visibility of the EmailList
  const [showEmailList, setShowEmailList] = useState(false);
  const toggleEmailList = () => setShowEmailList((prev) => !prev);

  return (
    <div className="chatApp">
      <div className="chatAppContainer">
        {/* LEFT PANEL: EventDashboard (using groupedEvents) */}
        <EventDashboard
          groupedEvents={groupedEvents}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
        />

        {/* MIDDLE: Conditionally render EmailList */}

        {/* RIGHT PANEL: AgentPanel with toggle props */}
        <AgentPanel
          event={currentEvent}
          messages={messages}
          setMessages={setMessages}
          message={message}
          setMessage={setMessage}
          onSendMessage={sendMessage}
          quickReplies={eventQuickReplies}
          emailListVisible={showEmailList}
          toggleEmailList={toggleEmailList}
        />

        {showEmailList && <EmailList emails={currentEvent?.emails || []} />}
      </div>
    </div>
  );
};

// A common layout component to display the banner and navigation links
const Layout = ({ children }) => (
  <div className="layout">
    <Banner />
    <div className="content">{children}</div>
  </div>
);

// The main App component using wouter for routing
const App = () => {
  return (
    <Router>
      <Layout>
        <Route path="/" component={ChatApp} />
        <Route path="/setting" component={Setting} />
        <Route path="/meeting" component={() => <Meeting
          videoUrl="assets/test.mp4"
          audioUrl="assets/test.mp3"
        />} />
      </Layout>
    </Router>
  );
};

export default App;
