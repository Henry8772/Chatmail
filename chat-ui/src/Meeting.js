import React from 'react';
import ReactPlayer from 'react-player';
import './Meeting.css';

const Meeting = ({ videoUrl, audioUrl }) => {
  // Extract meeting topic and attendees from URL parameters
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const topic = params.get('topic') || 'No topic provided';
  const attendeesStr = params.get('attendees');
  const attendees = attendeesStr 
    ? attendeesStr.split(',').map(name => name.trim())
    : [];

  return (
    <div className="meeting-container">
      {/* Combined Meeting Info: Topic & Attendees */}
      <div className="meeting-info">
        <div className="meeting-topic">
          <h2>{topic}</h2>
        </div>
        <div className="attendees">
          {attendees.length ? (
            <p>Attendees: {attendees.join(', ')}</p>
          ) : (
            <p>No attendees</p>
          )}
        </div>
      </div>

      {/* Video Section */}
      <div className="video-section">
        <div className="video-wrapper">
          <ReactPlayer
            url={videoUrl}
            controls
            playing={false}
            width="100%"  // Fill the wrapper
            height="100%" // Fill the wrapper
          />
        </div>
      </div>

      {/* Audio Section */}
      <div className="audio-section">
        <ReactPlayer
          url={audioUrl}
          controls
          playing={false}
          width="100%"
          height="50px"
        />
      </div>
    </div>
  );
};

export default Meeting;