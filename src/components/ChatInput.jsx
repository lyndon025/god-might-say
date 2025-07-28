import React, { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import CHAT_PLACEHOLDERS from '../constants/chatPlaceholders';

const ChatInput = ({ input, setInput, onSend }) => {
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    const random = Math.floor(Math.random() * CHAT_PLACEHOLDERS.length);
    setPlaceholder(CHAT_PLACEHOLDERS[random]);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <TextareaAutosize
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full min-h-[2.5rem] max-h-[12rem] bg-surface text-primary-text placeholder-secondary-text rounded-lg p-3 border-2 border-transparent focus:border-accent focus:outline-none focus:ring-0 resize-none"
      minRows={3}
    />
  );
};

export default ChatInput;
