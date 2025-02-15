import React from 'react';
import { FaCog, FaEnvelope } from 'react-icons/fa';
import { Link } from 'wouter';
import './Banner.css';

const Banner = () => {
  return (
    <div className="banner">
      <div className="banner-left">
        {/* Replace 'logo192.png' with your own logo image path if desired */}
        <img src="chatmail.jpg" alt="Logo" className="banner-logo" />
        <span className="banner-username">Alice (UID:123456)</span>
      </div>
      <div className="banner-right">
        {/* Email icon routes back to the home page (/) */}
        <Link to="/">
          <FaEnvelope className="banner-email" />
        </Link>
        {/* Settings icon routes to /setting */}
        <Link to="/setting">
          <FaCog className="banner-settings" />
        </Link>
      </div>
    </div>
  );
};

export default Banner;