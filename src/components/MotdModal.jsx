// src/components/MotdModal.jsx
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

const MotdModal = ({ visible, onClose }) => {
  const { user } = useContext(AppContext);

  const messageIndex = useMemo(() => {
    const base = user?.uid || new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    return simpleHash(base) % messageofthedaylist.length;
  }, [user]);

  const message = messageofthedaylist[messageIndex];

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-surface text-primary-text border border-accent rounded-xl shadow-xl max-w-md w-[90%] p-6">
        <h2 className="text-xl font-serif font-bold text-accent mb-4">📖 Message of the Day</h2>
        <p className="text-base italic">{message}</p>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent text-background rounded-md hover:bg-accent-hover transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotdModal;
