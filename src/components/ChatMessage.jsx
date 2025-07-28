import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Star, CheckCircle } from 'lucide-react';

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
  const [showSaved, setShowSaved] = useState(false);

  const handleVerseFavorite = async (verseText, reference) => {
    if (!user) return alert("Please log in to favorite this verse.");
    const id = `verse-${reference}-${Date.now()}`;
    const verseMessage = {
      id,
      role: 'assistant',
      content: `“${verseText}” — ${reference}`,
      timestamp: new Date().toISOString(),
      isVerse: true,
    };
    try {
      await toggleFavorite(verseMessage);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error("Error saving verse:", err);
    }
  };

 const parseContent = (text) => {
  const elements = [];
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match: * Book Chapter:Verse
    const refMatch = /^\*\s*([A-Za-z0-9\s]+:\d+(-\d+)?)/.exec(line);
    const nextLine = lines[i + 1]?.trim();

    if (refMatch && nextLine?.startsWith('"')) {
      const reference = refMatch[1];
      const verseText = nextLine.replace(/^"|"$/g, '');
      const verseId = `verse-${reference}`;

      const isFavorited = favorites.some(f => f.id?.startsWith(verseId));

      const handleToggle = () => {
        if (!user) return;
        const verseMessage = {
          id: verseId,
          role: 'assistant',
          content: `“${verseText}” — ${reference}`,
          timestamp: new Date().toISOString(),
          isVerse: true,
        };
        toggleFavorite(verseMessage);
      };

      elements.push(
        <div
          key={`verse-${i}`}
          onClick={user ? handleToggle : undefined}
          className={`flex items-center gap-2 group px-3 py-2 rounded-md transition-colors ${
            user ? 'cursor-pointer hover:bg-accent/10' : ''
          }`}
        >
          <span
            className={`text-accent font-semibold ${user ? 'hover:underline flex-1' : 'flex-1'}`}
          >
            “{verseText}” — {reference}
          </span>

          {/* Show star only if user is logged in */}
          {user && (
            <button
              onClick={handleToggle}
              className={`transition-all p-1 rounded-full ${
                isFavorited
                  ? 'text-accent'
                  : 'text-secondary-text group-hover:text-accent hover:bg-surface'
              }`}
              aria-label="Toggle Favorite"
            >
              <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      );

      i++; // skip next line
    } else {
      elements.push(<span key={`line-${i}`}>{line}<br /></span>);
    }
  }

  return elements;
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

        <p className="whitespace-pre-wrap leading-relaxed">
          {parseContent(content)}
        </p>

        {/* ✅ Saved Verse Feedback */}
        {showSaved && (
          <div className="absolute -top-4 right-1 text-green-500 text-sm flex items-center gap-1 animate-fade-in-out">
            <CheckCircle size={16} /> Saved!
          </div>
        )}

        {/* ⭐ Star button for full message */}
        {!isUser && user && message.id && !isError && (
          <button
            onClick={() => toggleFavorite(message)}
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
