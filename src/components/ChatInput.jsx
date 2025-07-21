import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const ChatInput = ({ input, setInput, onSend }) => {

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
            placeholder="Ask a question..."
            className="w-full h-full flex-1 bg-surface text-primary-text placeholder-secondary-text rounded-lg p-3 border-2 border-transparent focus:border-accent focus:outline-none focus:ring-0 resize-none"
            minRows={1}
        />
    );
};

export default ChatInput;
