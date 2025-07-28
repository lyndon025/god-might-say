// src/components/MotdModal.jsx
import React, { useMemo, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import messageofthedaylist from '../constants/messageofthedaylist';
import html2canvas from 'html2canvas';

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

  const captureScreenshot = () => {
    const target = document.getElementById('motd-card-content');
    if (!target) return;

    html2canvas(target, { scale: 2, backgroundColor: getComputedStyle(target).backgroundColor }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'motd.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const shareMessage = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Message of the Day',
      text: `${message}\n\nRead more at https://godmightsay.com`,
    });
  } else {
    alert('Sharing is not supported on this device/browser.');
  }
};

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-surface dark:bg-light-surface text-primary-text dark:text-light-primary-text border border-accent rounded-xl shadow-xl max-w-md w-[90%] p-6 transition-colors duration-300">
        {/* Content to be captured */}
        <div id="motd-card-content" className="bg-surface dark:bg-light-surface p-4 rounded-lg pb-8">
          <h2 className="text-xl font-serif font-bold text-accent mb-4">📖 Message of the Day</h2>
          <p className="text-base italic text-white dark:text-black leading-relaxed mb-6">{message}</p>
          <div className="text-center pt-4 border-t border-accent/30">
            <p className="text-sm text-accent font-serif">www.godmightsay.com</p>
          </div>
        </div>

        {/* Control buttons not included in screenshot */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={captureScreenshot}
            className="px-4 py-2 bg-accent text-background rounded-md hover:bg-accent-hover transition"
          >
            Save Image
          </button>
          <button
            onClick={shareMessage}
            className="px-4 py-2 bg-accent text-background rounded-md hover:bg-accent-hover transition"
          >
            Share
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface dark:bg-light-surface text-primary-text dark:text-light-primary-text border border-light-border rounded-md hover:opacity-80 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotdModal;