import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Menu, X, ArrowLeft } from 'lucide-react';

const Header = () => {
  const { isMenuOpen, setIsMenuOpen, page, setPage } = useContext(AppContext);

  // The back arrow will now show on all secondary pages.
const showBackButton = ['favorites', 'about', 'donate', 'motd'].includes(page);

  return (
    <header className="flex items-center justify-between p-4 bg-surface/80 backdrop-blur-sm border-b border-accent/20 shadow-md z-20">
      {showBackButton ? (
        <button onClick={() => setPage('home')} className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors">
          <ArrowLeft size={24} />
        </button>
      ) : (
        <div className="w-10"></div>
      )}
      <h1 className="text-2xl font-serif text-primary-text tracking-wider">God Might Say</h1>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
};

export default Header;
