import React from 'react';
import './EventDashboard.css';

/**
 * Props:
 * - groupedEvents: an object where keys are category names and values are arrays of events
 * - selectedEventId: the currently active event ID
 * - onSelectEvent: callback when a user clicks on an event
 */
const EventDashboard = ({ groupedEvents, selectedEventId, onSelectEvent }) => {
  return (
    <div className="eventDashboard">
      <div className="dashboardHeader">My Events</div>
      <div className="eventList">
        {Object.keys(groupedEvents).map((group) => (
          <div key={group} className="eventGroup">
            <div className="groupHeader">{group}</div>
            {groupedEvents[group].map((event) => (
              <div
                key={event.id}
                className={`eventItem ${selectedEventId === event.id ? 'active' : ''}`}
                onClick={() => onSelectEvent(event.id)}
              >
                <div className="eventTitle">{event.title}</div>
                <div className="eventDescription">{event.description}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDashboard;