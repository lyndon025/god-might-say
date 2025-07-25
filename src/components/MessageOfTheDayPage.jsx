import React, { useMemo, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import messageofthedaylist from '../constants/messageofthedaylist';

// This function hashes a string into a deterministic number
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const MessageOfTheDayPage = () => {
  const { user } = useContext(AppContext);

  const messageIndex = useMemo(() => {
    const base = user?.uid || new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    return simpleHash(base) % messageofthedaylist.length;
  }, [user]);

  const message = messageofthedaylist[messageIndex];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-serif text-primary-text mb-6 text-center">Message of the Day</h2>
      <div className="bg-surface rounded-lg shadow-md p-6">
        <p className="text-xl font-serif text-primary-text leading-relaxed italic">
          "{message}"
        </p>
      </div>
    </div>
  );
};

export default MessageOfTheDayPage;


