import React from 'react';
import { FaCog } from 'react-icons/fa';
import './Banner.css';

const Banner = () => {
  return (
    <div className="banner">
      <div className="banner-left">
        {/* Replace 'logo.png' with your logo image path */}
        <img src="logo192.png" alt="Logo" className="banner-logo" />
        <span className="banner-username">ChatMail</span>
      </div>
      <div className="banner-right">
        <FaCog className="banner-settings" />
      </div>
    </div>
  );
};

export default Banner;