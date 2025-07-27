import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Menu, X, ArrowLeft } from 'lucide-react';

const Header = () => {
  const { isMenuOpen, setIsMenuOpen } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Show back arrow if NOT on homepage
  const showBackButton = location.pathname !== '/';

  return (
    <header className="flex items-center justify-between p-4 bg-surface/80 backdrop-blur-sm border-b border-accent/20 shadow-md z-20">
      {showBackButton ? (
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      ) : (
        <div className="w-10"></div>
      )}

      <h1 className="text-2xl font-serif text-primary-text tracking-wider">God Might Say</h1>

      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
};

export default Header;
