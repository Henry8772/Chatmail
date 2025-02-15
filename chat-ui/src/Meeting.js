// Meeting.js
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { convertTextToSpeech } from './elevenlabs_caller';
import './Meeting.css';

const Meeting = ({ videoUrl, audioUrl, audioText }) => {
  // Extract meeting topic and attendees from URL parameters
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const topic = params.get('topic') || 'No topic provided';
  const attendeesStr = params.get('attendees');
  const attendees = attendeesStr 
    ? attendeesStr.split(',').map(name => name.trim())
    : [];

  // State to hold the generated audio file URL
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
  // Ref to ensure convertTextToSpeech is called only once
  const didCallRef = useRef(false);

  useEffect(() => {
    // If audioText is provided and we haven't called the API yet,
    // call convertTextToSpeech only once on mount.
    if (audioText && !didCallRef.current) {
        console.log('audioText:', didCallRef.current);
      didCallRef.current = true;
      (async () => {
        const fileName = await convertTextToSpeech(audioText);
        if (fileName) {
          // Assuming your public assets folder serves files from `/assets/`
          setGeneratedAudioUrl(`assets/${fileName}`);
        }
      })();
    }
    // Empty dependency array means this effect runs only once on mount.
  }, [audioText]);

  // If audioText is provided, use the generated URL; otherwise use audioUrl.
  const finalAudioUrl = audioText ? generatedAudioUrl : audioUrl;

  return (
    <div className="meeting-container">
      {/* Meeting Info: Topic & Attendees */}
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
            width="100%"
            height="100%"
          />
        </div>
      </div>

      {/* Audio Section */}
      <div className="audio-section">
        {finalAudioUrl ? (
          <ReactPlayer
            url={finalAudioUrl}
            controls
            playing={false}
            width="100%"
            height="50px"
          />
        ) : (
          // Show a loading message if audioText is provided and audio isn't generated yet.
          audioText && <p>Generating audio...</p>
        )}
      </div>
    </div>
  );
};

export default Meeting;