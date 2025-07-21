import React, { useState, useEffect, createContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp, query, onSnapshot, deleteDoc, getDocs, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!authReady) return;

    if (user) {
      let chatLoaded = false;
      let favsLoaded = false;

      const checkInitialLoadComplete = () => {
        if (chatLoaded && favsLoaded) {
          setIsAppLoading(false);
        }
      };

      const chatQuery = query(collection(db, `users/${user.uid}/chatHistory`), orderBy('timestamp', 'asc'));
      const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
        const historyFromDb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChatHistory(historyFromDb);
        chatLoaded = true;
        checkInitialLoadComplete();
      }, (error) => {
        console.error("Firestore Chat History Error:", error);
        chatLoaded = true;
        checkInitialLoadComplete();
      });

      const favQuery = query(collection(db, `users/${user.uid}/favorites`), orderBy('timestamp', 'desc'));
      const unsubscribeFavorites = onSnapshot(favQuery, (snapshot) => {
        const favsFromDb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFavorites(favsFromDb);
        favsLoaded = true;
        checkInitialLoadComplete();
      }, (error) => {
        console.error("Firestore Favorites Error:", error);
        favsLoaded = true;
        checkInitialLoadComplete();
      });

      return () => {
        unsubscribeChat();
        unsubscribeFavorites();
      };
    } else {
      const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      setChatHistory(localHistory);
      setFavorites([]);
      setIsAppLoading(false);
    }
  }, [user, authReady]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const addMessageToHistory = async (message) => {
    if (user) {
      await addDoc(collection(db, `users/${user.uid}/chatHistory`), message);
    } else {
      const localMessage = { ...message, timestamp: new Date().toISOString() };
      const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      const newHistory = [...localHistory, localMessage];
      setChatHistory(newHistory);
      localStorage.setItem('chatHistory', JSON.stringify(newHistory));
    }
  };

  const deleteChatHistory = async () => {
    if (user) {
      const querySnapshot = await getDocs(collection(db, `users/${user.uid}/chatHistory`));
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } else {
      localStorage.removeItem('chatHistory');
      setChatHistory([]);
    }
    setIsMenuOpen(false);
  };

  const toggleFavorite = async (message) => {
    if (!user || !message.id) return;
    const favoriteRef = doc(db, `users/${user.uid}/favorites`, message.id);
    const isFavorited = favorites.some(fav => fav.id === message.id);
    if (isFavorited) {
      await deleteDoc(favoriteRef);
    } else {
      await setDoc(favoriteRef, { ...message, timestamp: serverTimestamp() });
    }
  };
  
  const deleteFavorites = async () => {
    if (user) {
      const querySnapshot = await getDocs(collection(db, `users/${user.uid}/favorites`));
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }
  };

  const value = {
    user, authReady, isAppLoading,
    signInWithGoogle, logOut, chatHistory, setChatHistory,
    addMessageToHistory, deleteChatHistory, favorites, toggleFavorite,
    deleteFavorites, isLoading, setIsLoading, page, setPage, isMenuOpen, setIsMenuOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
