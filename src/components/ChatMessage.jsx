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

    // Match flexible formats: "- * Book 1:1:" or "— * Book 1:1*:"
    const refMatch = /[*-–—]\s*\*?\s*([1-3]?\s?[A-Za-z]+(?:\s\d+)?:\d+(?:-\d+)?)(\*?)[:：]?\s*/.exec(line);
    const verseTextMatch = line.match(/[“"]([^”"]+)[”"]?/);

    if (refMatch) {
      const reference = refMatch[1].trim();
      const verseText =
        verseTextMatch?.[1] ||
        line
          .replace(refMatch[0], '')
          .replace(/^["“]|["”]$/g, '')
          .trim();

      const verseId = `verse-${reference}`;
      const isFavorited = favorites.some(f => f.id?.startsWith(verseId));

      const handleToggle = () => {
        if (!user) {
          alert("Log in to save this verse.");
          return;
        }

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
          onClick={handleToggle}
          className="flex items-center gap-2 group px-3 py-2 rounded-md transition-colors cursor-pointer hover:bg-accent/10"
          title={user ? 'Click to favorite this verse' : 'Log in to save this verse'}
        >
          <span className="text-accent font-semibold hover:underline flex-1">
            “{verseText}” — {reference}
          </span>
          <span
            onClick={handleToggle}
            className={`transition-all p-1 rounded-full ${
              user
                ? isFavorited
                  ? 'text-accent'
                  : 'text-secondary-text group-hover:text-accent hover:bg-surface'
                : 'text-secondary-text opacity-60 hover:text-accent cursor-pointer'
            }`}
          >
            <Star size={16} fill={user && isFavorited ? 'currentColor' : 'none'} />
          </span>
        </div>
      );

      continue;
    }

    // Fallback line
    elements.push(<span key={`line-${i}`}>{line}<br /></span>);
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
        {!isUser && message.id && !isError && (
  <button
    onClick={() => {
      if (!user) {
        alert("Log in to save this message to favorites.");
        return;
      }
      toggleFavorite(message);
    }}
    className={`absolute -bottom-3.5 -right-3.5 p-2 rounded-full transition-all duration-200
      ${user
        ? isFavorited
          ? 'bg-accent text-background'
          : 'bg-background text-accent dark:bg-light-surface dark:text-accent hover:bg-surface'
        : 'bg-background text-secondary-text opacity-60'}
    `}
    aria-label="Favorite Full Message"
    title={user ? 'Click to favorite this message' : 'Log in to save this message'}
  >
    <Star size={18} fill={user && isFavorited ? 'currentColor' : 'none'} />
  </button>
)}

      </div>
    </div>
  );
};

export default ChatMessage;
