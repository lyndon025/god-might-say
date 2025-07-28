import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ChatMessage from './ChatMessage';
import { Trash2 } from 'lucide-react';

const FavoritesPage = () => {
    const { favorites, deleteFavorites, user } = useContext(AppContext);

    if (!user) {
        return (
            <div className="p-6 text-center text-secondary-text dark:text-light-secondary-text font-serif bg-background dark:bg-light-background min-h-screen">
                Please log in to see your favorites.
            </div>
        );
    }

    const handleUnfavoriteAll = () => {
        if (window.confirm('Are you sure you want to unfavorite all messages?')) {
            deleteFavorites();
        }
    };

    return (
        <div className="p-4 md:p-6 bg-background dark:bg-light-background text-primary-text dark:text-light-primary-text min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b-2 border-accent/20 pb-4">
                <h2 className="text-3xl font-serif">Favorites</h2>
                {favorites.length > 0 && (
                    <button onClick={handleUnfavoriteAll} className="flex items-center text-sm text-secondary-text dark:text-light-secondary-text hover:text-primary-text dark:hover:text-light-primary-text transition-colors">
                        <Trash2 size={16} className="mr-1.5" />
                        Unfavorite All
                    </button>
                )}
            </div>

            {favorites.length === 0 ? (
                <p className="text-secondary-text dark:text-light-secondary-text text-center mt-8 font-serif text-lg">
                    You haven't favorited any messages yet.
                </p>
            ) : (
                <div className="space-y-6">
                    {favorites.map(fav => (
                        <ChatMessage key={fav.id} message={fav} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;