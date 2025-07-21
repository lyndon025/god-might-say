import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import { serverTimestamp } from 'firebase/firestore';
import ERROR_RESPONSES from '../constants/errorMessages';


const SYSTEM_PROMPT = `You are simulating the voice of the Christian God in a loving, wise, and reverent tone.
Respond to the user as if you were speaking directly to them, offering guidance, comfort, or correction as appropriate.

You must:
- Begin each response with: 'God might say:'
- Speak in a calm and fatherly tone
- Base your message on biblical principles
- Cite at least one real Bible verse (include book, chapter, verse)
- Never invent scripture or claim to be God
- Be broadly Christian, non-denominational, and respectful
- Use proper spacing, use line spacing often, separate scriptures with line spacing so it is easier to see
- Be grammatically correct and use proper punctuation, do not use random slashes or symbols
Use the Bible to inspire your responses, but the entire reply does not need to be scripture. You may interpret or apply scripture to a modern situation.`;


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
    const userMessage = { id: 'local-' + Date.now().toString(), role: 'user', content: input.trim(), timestamp: serverTimestamp() };
    addMessageToHistory(userMessage);
    setInput('');
    setIsLoading(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-flash-1.5", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMessage.content }] })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: 'An unknown error occurred.' }
        }));
        console.error("API Response Error:", errorData);
        throw new Error("Temporary interruption"); // Generic message for internal tracking
      }
      const data = await response.json();
      const aiMessage = { id: data.id, role: 'assistant', content: data.choices[0].message.content, timestamp: serverTimestamp() };
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
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={chatScreenRef} className="h-full flex flex-col relative">
      <div className="overflow-y-auto p-4 md:p-6 space-y-6" style={{ height: `${chatAreaHeight}%` }}>
        {chatHistory.map((msg, index) => (<ChatMessage key={msg.id || index} message={msg} />))}
        {isLoading && <LoadingIndicator />}
        <div ref={chatEndRef} />
      </div>

      <div className="w-full h-1.5 bg-surface hover:bg-accent cursor-row-resize transition-colors" onMouseDown={handleMouseDown} />

      <div className="flex-1 flex flex-col p-3 bg-background">
        <ChatInput input={input} setInput={setInput} onSend={handleSend} />
      </div>

      {/* The container for the Send button now has a z-index to ensure it's on top */}
      <div className="absolute bottom-4 right-4 z-10">
        <button onClick={handleSend} className="bg-accent text-background font-bold rounded-lg px-5 py-2 hover:bg-accent-hover disabled:bg-surface disabled:text-secondary-text transition-all shadow-lg transform hover:scale-105" disabled={!input.trim() || isLoading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
