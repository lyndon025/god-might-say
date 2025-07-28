import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import { serverTimestamp } from 'firebase/firestore';
import ERROR_RESPONSES from '../constants/errorMessages';
import SendToLLM from '../utils/SendToLLM';

const ChatScreen = () => {
  const { chatHistory, isLoading, addMessageToHistory, setIsLoading } = useContext(AppContext);
  const chatEndRef = useRef(null);
  const chatScreenRef = useRef(null);
  const isResizing = useRef(false);
  const [input, setInput] = useState('');
  const [chatAreaHeight, setChatAreaHeight] = useState(85);

  const handleMouseDown = (e) => { isResizing.current = true; e.preventDefault(); };
  const handleMouseUp = useCallback(() => { isResizing.current = false; }, []);
  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current || !chatScreenRef.current) return;
    const containerRect = chatScreenRef.current.getBoundingClientRect();
    const newHeight = e.clientY - containerRect.top;
    const newHeightPercent = (newHeight / containerRect.height) * 100;
    if (newHeightPercent > 20 && newHeightPercent < 85) {
      setChatAreaHeight(newHeightPercent);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: 'local-' + Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: serverTimestamp(),
    };

    addMessageToHistory(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const cleanOldAssistant = (content) => {
        return content
          .replace(/^\*\s?[A-Za-z0-9\s]+\d+:\d+(-\d+)?$/gm, '')
          .replace(/^["“][^"”]+["”]$/gm, '')
          .trim();
      };

      const recentExchanges = chatHistory
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map(m => ({
          id: m.id,
          role: m.role,
          content: m.role === 'assistant' ? cleanOldAssistant(m.content) : m.content
        }));

      // Optional: force reminder to LLM to ignore old format
      recentExchanges.unshift({
        role: "user",
        content:
          "Reminder: Please ignore any previous assistant messages that may have incorrect formatting. Follow only the format in the system prompt. Thank you."
      });

      const result = await SendToLLM({
        recentExchanges,
        userMessage: userMessage.content
      });

      if (!result.success) throw new Error(result.error);

      addMessageToHistory({
        id: result.id,
        role: 'assistant',
        content: result.content,
        rawContent: result.content,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      const fallback = ERROR_RESPONSES[Math.floor(Math.random() * ERROR_RESPONSES.length)];
      addMessageToHistory({
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: fallback,
        timestamp: serverTimestamp()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={chatScreenRef} className="flex flex-col h-full bg-background text-primary-text dark:bg-light-background dark:text-light-primary-text">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {chatHistory.map((msg, index) => (
          <ChatMessage key={msg.id || index} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={chatEndRef} />
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-surface dark:bg-light-surface px-3 pt-3 pb-6 border-t border-surface dark:border-light-surface z-20">
        <div className="relative w-full">
          <ChatInput input={input} setInput={setInput} onSend={handleSend} />
          <button
            onClick={handleSend}
            className="absolute right-3 bottom-3 bg-accent text-background font-bold rounded-lg px-5 py-2 hover:bg-accent-hover disabled:bg-surface disabled:text-secondary-text transition-all shadow-lg transform hover:scale-105"
            disabled={!input.trim() || isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
