import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, AppContext } from '@/context/AppContext';
import Header from '@/components/Header';
import SidebarMenu from '@/components/SidebarMenu';

// Page Components
import ChatScreen from '@/components/ChatScreen';
import FavoritesPage from '@/components/FavoritesPage';
import DonatePage from '@/components/DonatePage';
import AboutPage from '@/components/AboutPage';
import MotdModal from '@/components/MotdModal';



const AppLayout = () => {
  const { isMenuOpen, setIsMenuOpen } = useContext(AppContext);
  const [vhHeight, setVhHeight] = useState('100vh');
  const [showMotd, setShowMotd] = useState(false);

  useEffect(() => {
    const updateHeight = () => {
      setVhHeight(`${window.innerHeight}px`);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    const toggleMotd = () => setShowMotd(true);
    window.addEventListener('toggle-motd', toggleMotd);
    return () => window.removeEventListener('toggle-motd', toggleMotd);
  }, []);

  return (
    <div className="w-full flex flex-col antialiased" style={{ height: vhHeight }}>
      <Header />
      <SidebarMenu />

      {/* ROUTED CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ChatScreen />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      <MotdModal visible={showMotd} onClose={() => setShowMotd(false)} />
    </div>
  );
};


const AppGate = () => {
  const { isAppLoading } = useContext(AppContext);
  if (isAppLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <p className="text-xl font-serif text-secondary-text animate-pulse">Loading Conversation...</p>
      </div>
    );
  }
  return <AppLayout />;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppGate />
      </Router>
    </AppProvider>
  );
}

export default App;
