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

  // 3. Load the data.json content into the events state on component mount
  useEffect(() => {
    setEvents(data);
  }, []);

  // 2. SELECTED EVENT
  const [selectedEventId, setSelectedEventId] = useState('ev1');

  // 3. MESSAGES + USER INPUT
  //
  // Now `messages` is a dictionary (object) where:
  // {
  //    ev1: [ { id: ..., text: ...}, { ... } ],
  //    ev2: [ ... ],
  //    ...
  // }
  const [messages, setMessages] = useState({});

  // 4. SENDING A MESSAGE (example)
  const sendMessage = (message, role) => {

    
    const totalPrefixLength = 6;

    // 3. Calculate how many hyphens are needed
    let neededHyphens = totalPrefixLength - role.length;
    if (neededHyphens < 0) {
      neededHyphens = 0; // Avoid negative if role is longer than 6
    }

    // 4. Build the prefix: e.g., "AI----" or "USER--"
    const prefix = role + " ".repeat(neededHyphens);

    // 5. Combine prefix + actual message
    const finalMessage = `${prefix} ${message}`;

    // We'll create or update the array of messages for the currently selected event
    setMessages((prevMessages) => {
      const currentMessages = prevMessages[selectedEventId] || [];
      return {
        ...prevMessages,
        [selectedEventId]: [
          ...currentMessages,
          { id: Date.now().toString(), text: finalMessage },
        ],
      };
    });
    console.log("messages", messages);
    
  };

  // 5. Generate “event-level” quick replies
  const generateQuickRepliesForEvent = (event) => {
    if (!event) return [];
    // Your logic for generating quick replies here
    return [];
  };

  // 6. Currently selected event
  const currentEvent = events.find((ev) => ev.id === selectedEventId);

  // 7. Quick replies for this event
  const eventQuickReplies = generateQuickRepliesForEvent(currentEvent);

  // 8. Group events by category in App.js
  const _groupedEvents = events.reduce((acc, event) => {
    let group = event.group || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(event);
    return acc;
  }, {});
  const groupOrder = ['High Priority', 'Other'];

  const groupedEvents = groupOrder.reduce((ordered, key) => {
  if (_groupedEvents[key]) {
    ordered[key] = _groupedEvents[key];
  }
  return ordered;
  }, {});

  // 9. Control visibility of the EmailList
  const [showEmailList, setShowEmailList] = useState(false);
  const toggleEmailList = () => setShowEmailList((prev) => !prev);

  // Because `messages` is an object keyed by eventId, pass the messages for the current event:
  const currentEventMessages = messages[selectedEventId] || [];

  return (
    <div className="chatApp">
      <div className="chatAppContainer">
        {/* LEFT PANEL: EventDashboard (using groupedEvents) */}
        <EventDashboard
          groupedEvents={groupedEvents}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
        />

        {/* MIDDLE PANEL: AgentPanel with toggle props */}
        <AgentPanel
          event={currentEvent}
          messages={currentEventMessages}
          sendMessage={sendMessage}
          // quickReplies={eventQuickReplies}
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
        <Route 
          path="/meeting" 
          component={() => (
            <Meeting
              videoUrl="assets/test.mp4"
              audioUrl="assets/test.mp3"
              audioText="Welcome to the ChatMail General Business Meeting! 🎉I’m ChatMail Bot, your AI host today. Here’s what we’ll cover. Our goals, Our progress,What’s next"
            />
          )}
        />
      </Layout>
    </Router>
  );
};

export default App;
