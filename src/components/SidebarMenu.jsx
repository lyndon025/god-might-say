import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { LogIn, Star, Trash2, X, Info, Heart } from 'lucide-react';

const SidebarMenu = () => {
  const {
    isMenuOpen,
    user,
    signInWithGoogle,
    signInWithFacebook, // ✅ added
    logOut,
    setPage,
    setIsMenuOpen,
    deleteChatHistory
  } = useContext(AppContext);

  const handleNavigation = (pageName) => {
    setPage(pageName);
    setIsMenuOpen(false);
  };

  return (
    <div className={`fixed top-0 right-0 h-full bg-surface border-l-2 border-accent/20 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72`}>
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsMenuOpen(false)}
          className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-col p-6 pt-20 h-full">
        {user ? (
          <>
            <div className="flex items-center mb-6 p-2">
              <img
                src={user.photoURL}
                alt="User"
                className="w-12 h-12 rounded-full mr-4 border-2 border-accent/50"
              />
              <span className="font-medium text-primary-text text-lg">{user.displayName}</span>
            </div>

            <button
              onClick={() => handleNavigation('favorites')}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors mb-2"
            >
              <Star className="mr-4 text-accent" size={20} />
              Favorites
            </button>

            <button
              onClick={logOut}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors"
            >
              <LogIn className="mr-4 text-accent" size={20} />
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={signInWithGoogle}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors mb-2"
            >
              <LogIn className="mr-4 text-accent" size={20} />
              Login with Google
            </button>

            <button
              onClick={signInWithFacebook}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors"
            >
              <LogIn className="mr-4 text-[#1877f2]" size={20} />
              Login with Facebook
            </button>
          </>
        )}

        <div className="mt-4 border-t border-accent/10"></div>

        <button
          onClick={() => handleNavigation('donate')}
          className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors mt-4"
        >
          <Heart className="mr-4 text-accent" size={20} />
          Donate
        </button>

        <button
          onClick={() => handleNavigation('about')}
          className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors"
        >
          <Info className="mr-4 text-accent" size={20} />
          About
        </button>

        <div className="mt-auto">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
                deleteChatHistory();
              }
            }}
            className="flex items-center w-full text-left p-3 rounded-lg text-sm text-secondary-text hover:bg-red-900/50 hover:text-primary-text transition-colors"
          >
            <Trash2 className="mr-3" size={16} />
            Delete Chat History
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;
