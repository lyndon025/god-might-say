import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Star, CheckCircle } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const { toggleFavorite, favorites, user } = useContext(AppContext);
  const isUser = message.role === 'user';
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
    if (toggleFavorite) {
      toggleFavorite(verseMessage);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  const renderVerse = (verseText, reference, isFavorited, onClick, key) => (
    <div
      key={`verse-${key}`}
      className="flex items-center gap-2 group cursor-pointer hover:bg-accent/10 px-3 py-2 rounded-md transition-colors"
    >
      <span
        onClick={onClick}
        className="text-accent font-semibold hover:underline flex-1"
        title={isFavorited ? "Remove from favorites" : "Favorite this verse"}
      >
        "{verseText}"<br />
        <span className="text-secondary-text ml-1">— {reference}</span>
      </span>

      <button
        onClick={onClick}
        className={`transition-all p-1 rounded-full ${
          isFavorited
            ? 'text-accent'
            : 'text-secondary-text group-hover:text-accent hover:bg-surface'
        }`}
        aria-label="Toggle Verse Favorite"
      >
        <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
      </button>
    </div>
  );

 const parseContent = (text) => {
  const elements = [];
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    const nextRaw = lines[i + 1];
    const nextLine = nextRaw?.trim();

    // 1) INLINE starred verse + reference on one line: *"Verse"* — Book 3:17
    const inlineMatch = /^\*\s*[“"](.+?)[”"]\s*\*\s*—\s*([1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:-\d+)?)/.exec(line);
    if (inlineMatch) {
      const verseText = inlineMatch[1];
      const reference = inlineMatch[2];
      const verseId   = `verse-${reference.replace(/\s+/g, '-')}`;
      const isFav     = safeFavorites.some(f => f.id === verseId);
      const verseMsg  = {
        id: verseId,
        role: 'assistant',
        content: `"${verseText}" — ${reference}`,
        timestamp: new Date().toISOString(),
        isVerse: true,
      };
      const onToggle  = () => handleVerseFavorite(verseMsg);

      elements.push(
        <div key={`inline-${i}`} className="flex items-center gap-2 group cursor-pointer hover:bg-accent/10 px-3 py-2 rounded-md transition-colors">
          <span
            onClick={onToggle}
            className="text-accent font-semibold hover:underline flex-1"
            title={isFav ? "Remove from favorites" : "Favorite this verse"}
          >
            "{verseText}"<br />
            <span className="text-secondary-text ml-1">— {reference}</span>
          </span>
          <button
            onClick={onToggle}
            className={`transition-all p-1 rounded-full ${isFav ? 'text-accent' : 'text-secondary-text group-hover:text-accent hover:bg-surface'}`}
            aria-label="Toggle Verse Favorite"
          >
            <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      );
      continue;
    }

    // 2) STARRED-QUOTE then reference on next line:
    //    *"Verse"*
    //    — Book 3:17
    const starredQuote = /^\*\s*[“"](.+?)[”"]\s*\*$/.exec(line);
    const starredRef   = /^—\s*([1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:-\d+)?)/.exec(nextLine);
    if (starredQuote && starredRef) {
      const verseText = starredQuote[1];
      const reference = starredRef[1];
      const verseId   = `verse-${reference.replace(/\s+/g, '-')}`;
      const isFav     = safeFavorites.some(f => f.id === verseId);
      const verseMsg  = {
        id: verseId,
        role: 'assistant',
        content: `"${verseText}" — ${reference}`,
        timestamp: new Date().toISOString(),
        isVerse: true,
      };
      const onToggle  = () => handleVerseFavorite(verseMsg);

      elements.push(
        <div key={`starred-${i}`} className="flex items-center gap-2 group cursor-pointer hover:bg-accent/10 px-3 py-2 rounded-md transition-colors">
          <span
            onClick={onToggle}
            className="text-accent font-semibold hover:underline flex-1"
            title={isFav ? "Remove from favorites" : "Favorite this verse"}
          >
            "{verseText}"<br />
            <span className="text-secondary-text ml-1">— {reference}</span>
          </span>
          <button
            onClick={onToggle}
            className={`transition-all p-1 rounded-full ${isFav ? 'text-accent' : 'text-secondary-text group-hover:text-accent hover:bg-surface'}`}
            aria-label="Toggle Verse Favorite"
          >
            <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      );
      i++; // skip the reference line
      continue;
    }

    // 3) QUOTE-then-reference (your existing 5-verse list style):
    //    "Verse"
    //    — Book 3:17
    const quoteFirstMatch = /^[“"](.+)[”"]$/.exec(line);
    const refLineMatch    = /^—\s*([1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:-\d+)?)/.exec(nextLine);
    if (quoteFirstMatch && refLineMatch) {
      const verseText = quoteFirstMatch[1];
      const reference = refLineMatch[1];
      const verseId   = `verse-${reference.replace(/\s+/g, '-')}`;
      const isFav     = safeFavorites.some(f => f.id === verseId);
      const verseMsg  = {
        id: verseId,
        role: 'assistant',
        content: `"${verseText}" — ${reference}`,
        timestamp: new Date().toISOString(),
        isVerse: true,
      };
      const onToggle  = () => handleVerseFavorite(verseMsg);

      elements.push(
        <div key={`quote-${i}`} className="flex items-center gap-2 group cursor-pointer hover:bg-accent/10 px-3 py-2 rounded-md transition-colors">
          <span
            onClick={onToggle}
            className="text-accent font-semibold hover:underline flex-1"
            title={isFav ? "Remove from favorites" : "Favorite this verse"}
          >
            "{verseText}"<br />
            <span className="text-secondary-text ml-1">— {reference}</span>
          </span>
          <button
            onClick={onToggle}
            className={`transition-all p-1 rounded-full ${isFav ? 'text-accent' : 'text-secondary-text group-hover:text-accent hover:bg-surface'}`}
            aria-label="Toggle Verse Favorite"
          >
            <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      );
      i++; // skip the reference line
      continue;
    }

    // 4) REFERENCE-then-QUOTE (your original starred reference style):
    //    *Book 3:17
    //    "Verse"
    const refFirstMatch = /^\*\s*([1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:-\d+)?)/.exec(line);
    const quoteNextMatch = /^[“"](.+)[”"]$/.exec(nextLine);
    if (refFirstMatch && quoteNextMatch) {
      const reference = refFirstMatch[1];
      const verseText = quoteNextMatch[1];
      const verseId   = `verse-${reference.replace(/\s+/g, '-')}`;
      const isFav     = safeFavorites.some(f => f.id === verseId);
      const verseMsg  = {
        id: verseId,
        role: 'assistant',
        content: `"${verseText}" — ${reference}`,
        timestamp: new Date().toISOString(),
        isVerse: true,
      };
      const onToggle  = () => handleVerseFavorite(verseMsg);

      elements.push(
        <div key={`ref-${i}`} className="flex items-center gap-2 group cursor-pointer hover:bg-accent/10 px-3 py-2 rounded-md transition-colors">
          <span
            onClick={onToggle}
            className="text-accent font-semibold hover:underline flex-1"
            title={isFav ? "Remove from favorites" : "Favorite this verse"}
          >
            "{verseText}"<br />
            <span className="text-secondary-text ml-1">— {reference}</span>
          </span>
          <button
            onClick={onToggle}
            className={`transition-all p-1 rounded-full ${isFav ? 'text-accent' : 'text-secondary-text group-hover:text-accent hover:bg-surface'}`}
            aria-label="Toggle Verse Favorite"
          >
            <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      );
      i++; // skip the quote line
      continue;
    }

    // 5) fallback to normal text
    if (rawLine.trim()) {
      elements.push(<span key={`text-${i}`}>{rawLine}<br/></span>);
    } else {
      elements.push(<br key={`br-${i}`} />);
    }
  }

  return elements;
};



  const handleMessageFavorite = () => {
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
