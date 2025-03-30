import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void; // Function prop type
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState<string>(''); // Type state

  // Type event as React.FormEvent
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  // Type event as React.ChangeEvent
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Type your message to Taffy..."
        aria-label="Chat message input"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="send-button"
        disabled={isLoading || !inputValue.trim()}
        aria-label="Send message"
      >
        {isLoading ? '...' : 'Send'}
      </button>
    </form>
  );
};

export default ChatInput;