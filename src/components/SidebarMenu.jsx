import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { LogIn, Star, Trash2, X, Info, Heart, Home } from 'lucide-react';

const SidebarMenu = () => {
  const {
    isMenuOpen,
    user,
    signInWithGoogle,
    signInWithFacebook,
    logOut,
    setPage,
    setIsMenuOpen,
    deleteChatHistory,
  } = useContext(AppContext);

  const handleNavigation = (pageName) => {
    setPage(pageName);
    setIsMenuOpen(false);
  };

  return (
    <div className={`fixed top-0 right-0 h-full bg-surface border-l-2 border-accent/20 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72`}>
      <div className="flex flex-col p-6 pt-6 h-full">

        {/* ✅ Top Row: Home + X */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => handleNavigation('home')}
            className="flex items-center text-primary-text hover:bg-accent/10 transition-colors rounded-lg px-3 py-2 text-lg"
          >
            <Home className="mr-2 text-accent" size={20} />
            Home
          </button>

          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* ✅ Logged In: show avatar + name */}
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

            {/* Message of the Day comes first */}
            <button
              onClick={() => handleNavigation('motd')}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors mb-2"
            >
              <Info className="mr-4 text-accent" size={20} />
              Message of the Day
            </button>

            <button
              onClick={() => handleNavigation('favorites')}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors mb-4"
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
            {/* Logged out: login buttons */}
            <button
              onClick={signInWithGoogle}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors mb-2"
            >
              <LogIn className="mr-4 text-accent" size={20} />
              Login with Google
            </button>

            <button
              onClick={signInWithFacebook}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors mb-4"
            >
              <LogIn className="mr-4 text-[#1877f2]" size={20} />
              Login with Facebook
            </button>

            {/* Message of the Day before Favorites */}
            <button
              onClick={() => handleNavigation('motd')}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors mb-2"
            >
              <Info className="mr-4 text-accent" size={20} />
              Message of the Day
            </button>

            <button
              onClick={() => handleNavigation('favorites')}
              className="flex items-center w-full text-left p-3 text-lg rounded-lg text-primary-text hover:bg-accent/10 transition-colors"
            >
              <Star className="mr-4 text-accent" size={20} />
              Favorites
            </button>
          </>
        )}

        {/* Divider */}
        <div className="mt-4 border-t border-accent/10"></div>

        {/* Donate & About */}
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

        {/* Delete History */}
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
