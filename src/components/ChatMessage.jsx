import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Star, CheckCircle } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const { toggleFavorite, favorites, user } = useContext(AppContext);
  const isUser = message.role === 'user';
  
  // ✅ FIX 1: Guard this check to prevent a crash when 'favorites' is not an array.
  const isFavorited = Array.isArray(favorites) && message.id ? favorites.some(fav => fav.id === message.id) : false;

  const preface = "God might say:";
  let content = message.content || '';
  let prefaceContent = null;

  if (!isUser && content.startsWith(preface)) {
    prefaceContent = preface;
    content = content.substring(preface.length).trimStart();
  }

  const isError = message.id?.startsWith('error-');
  const [showSaved, setShowSaved] = useState(false);

  const handleVerseFavorite = (verseMessage) => {
    if (!user) {
      alert("Please log in to favorite this verse.");
      return;
    }
    toggleFavorite(verseMessage);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const parseContent = (text) => {
    const elements = [];
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const refMatch = /^\*\s*([A-Za-z0-9\s]+:\d+(-\d+)?)/.exec(line);
      const nextLine = lines[i + 1]?.trim();

      if (refMatch && nextLine?.startsWith('"')) {
        const reference = refMatch[1];
        const verseText = nextLine.replace(/^"|"$/g, '');
        const verseId = `verse-${reference}`;
        
        // ✅ FIX 2: Also guard this check inside the parser.
        const isVerseFavorited = Array.isArray(favorites) ? favorites.some(f => f.id?.startsWith(verseId)) : false;
        
        const verseMessage = {
          id: verseId,
          role: 'assistant',
          content: `“${verseText}” — ${reference}`,
          timestamp: new Date().toISOString(),
          isVerse: true,
        };
        const handleToggle = () => handleVerseFavorite(verseMessage);

        elements.push(
          <div
            key={`verse-${i}`}
            className="flex items-center gap-2 group cursor-pointer hover:bg-accent/10 px-3 py-2 rounded-md transition-colors"
          >
            <span
              onClick={handleToggle}
              className="text-accent font-semibold hover:underline flex-1"
              title={isVerseFavorited ? "Click to remove from favorites" : "Click to favorite this verse"}
            >
              <>
                “{verseText}”
                <br />
                <span className="text-secondary-text ml-1">— {reference}</span>
              </>
            </span>
            <button
              onClick={handleToggle}
              className={`transition-all p-1 rounded-full ${
                isVerseFavorited
                  ? 'text-accent'
                  : 'text-secondary-text group-hover:text-accent hover:bg-surface'
              }`}
              aria-label="Toggle Favorite"
            >
              <Star size={16} fill={isVerseFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        );

        i++;
      } else {
        elements.push(<span key={`line-${i}`}>{line}<br /></span>);
      }
    }
    return elements;
  };

  const handleMessageFavorite = () => {
    if (!user) {
      alert("Please log in to favorite this message.");
      return;
    }
    toggleFavorite(message);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          group relative max-w-2xl w-fit rounded-2xl px-5 py-3 shadow-md transition-colors
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

        <div className="whitespace-pre-wrap leading-relaxed">
          {parseContent(content)}
        </div>

        {showSaved && (
          <div className="absolute -top-4 right-1 text-green-500 text-sm flex items-center gap-1 animate-fade-in-out">
            <CheckCircle size={16} /> Saved!
          </div>
        )}

        {!isUser && message.id && !isError && (
          <button
            onClick={handleMessageFavorite}
            className={`absolute -bottom-3.5 -right-3.5 p-2 rounded-full transition-all duration-200
              ${isFavorited
                ? 'bg-accent text-background'
                : 'bg-background text-accent dark:bg-light-surface dark:text-accent hover:bg-surface'}
            `}
            aria-label="Favorite Full Message"
          >
            <Star size={18} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;