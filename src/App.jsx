import React, { useContext } from 'react';
// Using the new '@' alias
import { AppProvider, AppContext } from '@/context/AppContext';
import Header from '@/components/Header';
import SidebarMenu from '@/components/SidebarMenu';
import MainContent from '@/components/MainContent';

const AppLayout = () => {
  const { isMenuOpen, setIsMenuOpen } = useContext(AppContext);

  return (
    <div className="w-full h-screen flex flex-col antialiased">
      <Header />
      <SidebarMenu />
      <MainContent />
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
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
}

function App() {
  return (
    <AppProvider>
      <AppGate />
    </AppProvider>
  );
}

export default App;
