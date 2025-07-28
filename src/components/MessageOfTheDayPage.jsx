import React, { useMemo, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import messageofthedaylist from '../constants/messageofthedaylist';

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
    <div className="p-6 max-w-2xl mx-auto bg-background dark:bg-light-background text-primary-text dark:text-light-primary-text min-h-screen">
      <h2 className="text-3xl font-serif mb-6 text-center">Message of the Day</h2>
      <div className="bg-surface dark:bg-light-surface rounded-lg shadow-md p-6">
        <p className="text-xl font-serif leading-relaxed italic">
          "{message}"
        </p>
      </div>
    </div>
  );
};

export default MessageOfTheDayPage;
