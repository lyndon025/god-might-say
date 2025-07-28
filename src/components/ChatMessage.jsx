import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Star, CheckCircle } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const { toggleFavorite, favorites, user } = useContext(AppContext);
  const isUser = message.role === 'user';

  // Ensure favorites is always treated as an array
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  const isFavorited =
    message.id ? safeFavorites.some(fav => fav.id === message.id) : false;

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
    // Saves favorites both for logged-in users and guests
    if (toggleFavorite) {
      toggleFavorite(verseMessage);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  const parseContent = (text) => {
    const elements = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1]?.trim();

      // Enhanced regex to match Bible verses with OR without asterisk
      // Matches: "* John 3:16" OR "John 3:16" (book name followed by chapter:verse)
      const refMatch = /^(\*\s*)?([A-Za-z0-9\s]+\s+\d+:\d+(-\d+)?)/.exec(line);
      
      // Check if this looks like a Bible reference and next line starts with quotes
      if (refMatch && nextLine && nextLine.startsWith('"') && nextLine.endsWith('"')) {
        const reference = refMatch[2]; // Get the reference without the optional asterisk
        const verseText = nextLine.replace(/^"|"$/g, '');
        const verseId = `verse-${reference.replace(/\s+/g, '-')}`;

        // Always check favorites safely
        const isVerseFavorited = safeFavorites.some(f => 
          f.id && f.id.startsWith(verseId)
        );

        const verseMessage = {
          id: verseId,
          role: 'assistant',
          content: `"${verseText}" — ${reference}`,
          timestamp: new Date().toISOString(),
          isVerse: true,
        };

        const handleToggle = () => handleVerseFavorite(verseMessage);

        elements.push(
          <div
            key={`verse-${i}`}
            className="flex items-center gap-2 group cursor-pointer hover:bg-accent/10 px-3 py-2 rounded-md transition-colors"
          >
            {/* Verse text */}
            <span
              onClick={handleToggle}
              className="text-accent font-semibold hover:underline flex-1"
              title={isVerseFavorited ? "Remove from favorites" : "Favorite this verse"}
            >
              "{verseText}"<br />
              <span className="text-secondary-text ml-1">— {reference}</span>
            </span>

            {/* Star button */}
            <button
              onClick={handleToggle}
              className={`transition-all p-1 rounded-full ${
                isVerseFavorited
                  ? 'text-accent'
                  : 'text-secondary-text group-hover:text-accent hover:bg-surface'
              }`}
              aria-label="Toggle Verse Favorite"
            >
              <Star size={16} fill={isVerseFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        );

        i += 1; // skip the next line since we processed it
        continue;
      }

      // Handle regular lines (non-verse content)
      if (line) {
        elements.push(<span key={`line-${i}`}>{line}<br /></span>);
      } else {
        // Empty line - add line break
        elements.push(<br key={`br-${i}`} />);
      }
    }

    return elements;
  };

  const handleMessageFavorite = () => {
    // Saves favorites both for logged-in users and guests
    if (toggleFavorite) {
      toggleFavorite(message);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
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
          }`}
      >
        {/* Optional preface */}
        {prefaceContent && (
          <p className="font-serif font-bold text-accent mb-2">{prefaceContent}</p>
        )}

        {/* Message content (with verses) */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {parseContent(content)}
        </div>

        {/* Saved feedback */}
        {showSaved && (
          <div className="absolute -top-4 right-1 text-green-500 text-sm flex items-center gap-1 animate-fade-in-out">
            <CheckCircle size={16} /> Saved!
          </div>
        )}

        {/* Full-message favorite button */}
        {!isUser && message.id && !isError && (
          <button
            onClick={handleMessageFavorite}
            className={`absolute -bottom-3.5 -right-3.5 p-2 rounded-full transition-all duration-200
              ${isFavorited ? 'bg-accent text-background' : 'bg-background text-accent dark:bg-light-surface dark:text-accent hover:bg-surface'}`}
            aria-label="Toggle Message Favorite"
          >
            <Star size={18} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;