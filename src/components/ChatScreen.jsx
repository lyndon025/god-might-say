import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import { serverTimestamp } from 'firebase/firestore';
import ERROR_RESPONSES from '../constants/errorMessages';


import SYSTEM_PROMPT from '../constants/systemPrompt';

const ChatScreen = () => {
  const { chatHistory, isLoading, addMessageToHistory, setIsLoading } = useContext(AppContext);
  const chatEndRef = useRef(null);

  const [chatAreaHeight, setChatAreaHeight] = useState(85);
  const chatScreenRef = useRef(null);
  const isResizing = useRef(false);

  const [input, setInput] = useState('');
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

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

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isLoading]);

  const handleSend = async () => {
  if (input.trim() === '' || !OPENROUTER_API_KEY) return;

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
    // 🧠 Step 1: Filter only user-assistant messages
    const userAssistantOnly = chatHistory.filter(
      m => m.role === 'user' || m.role === 'assistant'
    );

    // 🧠 Step 2: Get last 4 exchanges (user+assistant is a pair = 2 messages)
    const recentExchanges = [];

    for (let i = userAssistantOnly.length - 1; i >= 0 && recentExchanges.length < 8; i--) {
      const msg = userAssistantOnly[i];
      recentExchanges.unshift({
        role: msg.role,
        content: msg.content
      });
    }

    const requestBody = {
      model: "google/gemini-flash-1.5",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentExchanges,
        { role: "user", content: userMessage.content }
      ]
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: 'An unknown error occurred.' }
      }));
      console.error("API Response Error:", errorData);
      throw new Error("Temporary interruption");
    }

    const data = await response.json();
    const aiMessage = {
      id: data.id,
      role: 'assistant',
      content: data.choices[0].message.content,
      timestamp: serverTimestamp()
    };

    addMessageToHistory(aiMessage);
  } catch (error) {
    console.error("Error fetching from OpenRouter:", error);

    const randomError = ERROR_RESPONSES[Math.floor(Math.random() * ERROR_RESPONSES.length)];
    const errorMessage = {
      id: 'error-' + Date.now(),
      role: 'assistant',
      content: randomError,
      timestamp: serverTimestamp(),
    };

    addMessageToHistory(errorMessage);
  } finally {
    setIsLoading(false);
  }
};



return (
  <div ref={chatScreenRef} className="flex flex-col h-full bg-background">

    {/* Chat Area (scrollable) */}
  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">


      {chatHistory.map((msg, index) => (
        <ChatMessage key={msg.id || index} message={msg} />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={chatEndRef} />
    </div>


    {/* Fixed Footer Input Section */}
    <div className="sticky bottom-0 left-0 right-0 bg-background px-3 pt-3 pb-6 border-t border-surface z-20">
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
