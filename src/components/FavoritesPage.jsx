import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ChatMessage from './ChatMessage';
import { Trash2 } from 'lucide-react';

const FavoritesPage = () => {
  const { favorites, deleteFavorites, user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('verses');

  const handleUnfavoriteAll = () => {
    if (window.confirm('Are you sure you want to unfavorite all messages?')) {
      deleteFavorites();
    }
  };

  const verseFavorites = favorites.filter(fav => fav.isVerse);
  const messageFavorites = favorites.filter(fav => !fav.isVerse);

  const renderFavorites = () => {
    const currentList = activeTab === 'verses' ? verseFavorites : messageFavorites;
    const label = activeTab === 'verses' ? 'Bible verses' : 'messages';

    if (currentList.length === 0) {
      return (
        <p className="text-secondary-text dark:text-light-secondary-text italic text-center mt-12">
          You haven't favorited any {label} yet.
        </p>
      );
    }

    return (
      <div className="space-y-6">
        {currentList.map((fav) => (
          <ChatMessage key={fav.id} message={fav} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-background dark:bg-light-background text-primary-text dark:text-light-primary-text min-h-screen">
      {/* Guest warning */}
      {!user && (
        <div className="mb-4 p-3 bg-surface text-primary-text dark:bg-light-surface dark:text-light-primary-text rounded-md text-center font-serif">
          ⚠️ Please log in to save your favorites to your profile. Currently, they are stored only on this device.
        </div>
      )}

      <div className="flex justify-between items-center mb-6 border-b-2 border-accent/20 pb-4">
        <h2 className="text-3xl font-serif">Favorites</h2>
        {favorites.length > 0 && (
          <button
            onClick={handleUnfavoriteAll}
            className="flex items-center text-sm text-secondary-text dark:text-light-secondary-text hover:text-primary-text dark:hover:text-light-primary-text transition-colors"
          >
            <Trash2 size={16} className="mr-1.5" />
            Unfavorite All
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('verses')}
          className={`px-4 py-2 rounded-md font-serif transition-colors ${
            activeTab === 'verses'
              ? 'bg-accent text-background'
              : 'bg-surface dark:bg-light-surface text-primary-text dark:text-light-primary-text hover:bg-accent/10'
          }`}
        >
          📖 Bible Verses
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-md font-serif transition-colors ${
            activeTab === 'messages'
              ? 'bg-accent text-background'
              : 'bg-surface dark:bg-light-surface text-primary-text dark:text-light-primary-text hover:bg-accent/10'
          }`}
        >
          💬 Full Messages
        </button>
      </div>

      {renderFavorites()}
    </div>
  );
};

export default FavoritesPage;
