import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Menu, X, ArrowLeft, Sun, Moon } from 'lucide-react';
import logo from '/icon.png';

const Header = () => {
  const { isMenuOpen, setIsMenuOpen } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const showBackButton = location.pathname !== '/';

  // 🌗 Theme state
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-surface dark:bg-light-surface backdrop-blur-sm border-b border-accent/20 shadow-md z-20">
      {showBackButton ? (
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      ) : (
        <div className="w-10" />
      )}

      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="h-8 w-8 rounded-md" />
        <h1 className="text-2xl font-serif tracking-wider text-primary-text dark:text-light-primary-text">
          God Might Say
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-accent hover:bg-accent/10 transition"
          title="Toggle Light/Dark"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
