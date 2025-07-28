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
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    const cleanLine = (line) =>
      line.replace(/[*_`~]+/g, '')      // remove markdown
          .replace(/[“”]/g, '"')        // normalize quotes
          .replace(/^—\s*/, '')         // remove starting dash
          .trim();

    const refRegex = /\b([A-Za-z]+\s?\d{0,3})\s+(\d+:\d+([–-]\d+)?)/;
    const quoteRegex = /"([^"]{6,500})"/;

    let i = 0;
    while (i < lines.length) {
      const current = cleanLine(lines[i]);
      const next = cleanLine(lines[i + 1] || '');
      const combined = `${current} ${next}`;

      // Case 1: Same line has both quote and reference
      if (quoteRegex.test(current) && refRegex.test(current)) {
        const verseText = quoteRegex.exec(current)[1];
        const refMatch = refRegex.exec(current);
        const reference = `${refMatch[1]} ${refMatch[2]}`;
        const verseId = `verse-${reference.replace(/\s+/g, '-')}`;
        const isVerseFavorited = safeFavorites.some(f => f.id?.startsWith(verseId));
        const verseMessage = {
          id: verseId,
          role: 'assistant',
          content: `"${verseText}" — ${reference}`,
          timestamp: new Date().toISOString(),
          isVerse: true,
        };
        elements.push(renderVerse(verseText, reference, isVerseFavorited, () => handleVerseFavorite(verseMessage), i));
        i += 1;
        continue;
      }

      // Case 2: Quote line then Reference line
      if (quoteRegex.test(current) && refRegex.test(next)) {
        const verseText = quoteRegex.exec(current)[1];
        const refMatch = refRegex.exec(next);
        const reference = `${refMatch[1]} ${refMatch[2]}`;
        const verseId = `verse-${reference.replace(/\s+/g, '-')}`;
        const isVerseFavorited = safeFavorites.some(f => f.id?.startsWith(verseId));
        const verseMessage = {
          id: verseId,
          role: 'assistant',
          content: `"${verseText}" — ${reference}`,
          timestamp: new Date().toISOString(),
          isVerse: true,
        };
        elements.push(renderVerse(verseText, reference, isVerseFavorited, () => handleVerseFavorite(verseMessage), i));
        i += 2;
        continue;
      }

      // Case 3: Reference line then Quote line
      if (refRegex.test(current) && quoteRegex.test(next)) {
        const verseText = quoteRegex.exec(next)[1];
        const refMatch = refRegex.exec(current);
        const reference = `${refMatch[1]} ${refMatch[2]}`;
        const verseId = `verse-${reference.replace(/\s+/g, '-')}`;
        const isVerseFavorited = safeFavorites.some(f => f.id?.startsWith(verseId));
        const verseMessage = {
          id: verseId,
          role: 'assistant',
          content: `"${verseText}" — ${reference}`,
          timestamp: new Date().toISOString(),
          isVerse: true,
        };
        elements.push(renderVerse(verseText, reference, isVerseFavorited, () => handleVerseFavorite(verseMessage), i));
        i += 2;
        continue;
      }

      // Case 4: Reference line followed by unquoted verse (your new case)
      if (refRegex.test(current) && next.length > 10) {
        const verseText = next.replace(/["“”]/g, '').trim();
        const refMatch = refRegex.exec(current);
        const reference = `${refMatch[1]} ${refMatch[2]}`;
        const verseId = `verse-${reference.replace(/\s+/g, '-')}`;
        const isVerseFavorited = safeFavorites.some(f => f.id?.startsWith(verseId));
        const verseMessage = {
          id: verseId,
          role: 'assistant',
          content: `"${verseText}" — ${reference}`,
          timestamp: new Date().toISOString(),
          isVerse: true,
        };
        elements.push(renderVerse(verseText, reference, isVerseFavorited, () => handleVerseFavorite(verseMessage), i));
        i += 2;
        continue;
      }

      // Fallback
      elements.push(<span key={`line-${i}`}>{current}<br /></span>);
      i += 1;
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
