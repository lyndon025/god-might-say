import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Star } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const { toggleFavorite, favorites, user } = useContext(AppContext);
  const isUser = message.role === 'user';
  const isFavorited = user && message.id ? favorites.some(fav => fav.id === message.id) : false;

  const preface = "God might say:";
  let content = message.content || '';
  let prefaceContent = null;

  if (!isUser && content.startsWith(preface)) {
    prefaceContent = preface;
    content = content.substring(preface.length).trimStart();
  }

  const isError = message.id?.startsWith('error-');

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          `group relative max-w-2xl w-fit rounded-2xl px-5 py-3 shadow-md transition-colors
          ${isUser
            ? 'bg-messenger-blue text-white'
            : isError
              ? 'bg-rose-10 text-rose-300 border border-rose-300'
              : 'bg-surface text-primary-text dark:bg-light-surface dark:text-light-primary-text'
          }`
        }
      >
        {prefaceContent && (
          <p className="font-serif font-bold text-accent mb-2">{prefaceContent}</p>
        )}

        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>

        {!isUser && user && message.id && !isError && (
          <button
            onClick={() => toggleFavorite(message)}
            className={`absolute -bottom-3.5 -right-3.5 p-2 rounded-full transition-all duration-200
              ${isFavorited
                ? 'bg-accent text-background'
                : 'bg-background text-accent dark:bg-light-surface dark:text-accent hover:bg-surface'}
            `}
            aria-label="Favorite"
          >
            <Star size={18} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;