import React from 'react';
import { MessageData } from '../types'; // Import the interface

interface MessageProps {
  message: MessageData;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { sender, text } = message;

  let messageClass = '';
  let senderName = '';

  switch (sender) {
    case 'user':
      messageClass = 'message-user';
      senderName = 'You';
      break;
    case 'Taffy':
      messageClass = 'message-taffy';
      senderName = 'Taffy';
      break;
    case 'System':
      messageClass = 'message-system';
      senderName = 'System';
      break;
    default:
      // Handle unexpected sender type if needed
      const exhaustiveCheck: never = sender;
      messageClass = 'message-unknown';
      senderName = 'Unknown';
  }

  const containsLatex = /\$|\\\(|\\\)|\\\[|\\\]/.test(text);

  return (
    <div className={`message ${messageClass}`}>
      {sender !== 'System' && <span className="message-sender">{senderName}: </span>}
      <span className="message-text">
        {text}
        {containsLatex && <span className="latex-notice"> (Contains LaTeX markup)</span>}
      </span>
    </div>
  );
};

export default Message;