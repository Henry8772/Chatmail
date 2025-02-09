import React from 'react';
import './EventDashboard.css';

/**
 * props:
 * - events: array of event objects
 * - selectedEventId: the currently active event ID
 * - onSelectEvent: callback when user clicks on an event
 */
const EventDashboard = ({ events, selectedEventId, onSelectEvent }) => {
  if (!events || events.length === 0) {
    return (
      <div className="eventDashboard">
        <div className="dashboardHeader">No Events Found</div>
      </div>
    );
  }

  return (
    <div className="eventDashboard">
      <div className="dashboardHeader">My Events</div>
      <div className="eventList">
        {events.map((event) => {
          const isActive = event.id === selectedEventId;
          return (
            <div
              key={event.id}
              className={`eventItem ${isActive ? 'active' : ''}`}
              onClick={() => onSelectEvent(event.id)}
            >
              <div className="eventTitle">{event.title}</div>
              <div className="eventDescription">
                {event.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventDashboard;