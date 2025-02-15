import React from 'react';
import Modal from 'react-modal';
import './EmailModal.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

const EmailModal = ({ isOpen, onRequestClose, email }) => {
  if (!email) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Email Details"
      className="emailModalContent"
      overlayClassName="emailModalOverlay"
    >
      <div className="emailModalHeader">
        <h2>Email Details</h2>
        <button className="closeButton" onClick={onRequestClose}>
          &times;
        </button>
      </div>
      <div className="emailModalBody">
        <p>
          <strong>FROM:</strong> {email.sender}
        </p>
        <p>
          <strong>TO:</strong> {email.receiver}
        </p>
        <p>
          <strong>Subject:</strong> {email.subject}
        </p>
        <p>
          <strong>Content:</strong>
        </p>
        {/* Email content is wrapped inside its own box */}
        <div className="emailContentBox">
          <div
            className="emailContent"
            dangerouslySetInnerHTML={{ __html: email.content }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default EmailModal;