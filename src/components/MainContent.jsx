import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ChatScreen from './ChatScreen';
import FavoritesPage from './FavoritesPage';
import AboutPage from './AboutPage';
// Import the new DonatePage component
import DonatePage from './DonatePage';

const MainContent = () => {
  const { page } = useContext(AppContext);

  const renderPage = () => {
    switch (page) {
      case 'favorites':
        return <FavoritesPage />;
      case 'about':
        return <AboutPage />;
      case 'donate': // Add the new case for the donate page
        return <DonatePage />;
      case 'home':
      default:
        return <ChatScreen />;
    }
  };

  return (
  <main className="flex-1 flex flex-col overflow-hidden">
    {renderPage()}
  </main>
);

};

export default MainContent;
