import React, { useState, useEffect, createContext, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  deleteDoc,
  getDocs,
  orderBy
} from 'firebase/firestore';

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
  const [user, setUser] = useState([null]);
  const [authReady, setAuthReady] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [showGuestFavoriteNotice, setShowGuestFavoriteNotice] = useState(false); // ✅ NEW

  const authTimeoutRef = useRef(null);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // 🚨 Handle Facebook redirect
  useEffect(() => {
    const loginStarted = localStorage.getItem("fb-login-started");

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("getRedirectResult error:", error);
      })
      .finally(() => {
        localStorage.removeItem("fb-login-started");
        setAuthReady(true);
      });
  }, []);

  // ✅ Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 🔁 Load content: Firestore or Local
  useEffect(() => {
    if (!authReady) return;

    if (user) {
      let chatLoaded = false;
      let favsLoaded = false;
      const checkLoaded = () => {
        if (chatLoaded && favsLoaded) setIsAppLoading(false);
      };

      const chatQuery = query(collection(db, `users/${user.uid}/chatHistory`), orderBy('timestamp', 'asc'));
      const favQuery = query(collection(db, `users/${user.uid}/favorites`), orderBy('timestamp', 'desc'));

      const unsubChat = onSnapshot(chatQuery, (snapshot) => {
        setChatHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        chatLoaded = true;
        checkLoaded();
      }, (err) => {
        console.error("Chat error:", err);
        chatLoaded = true;
        checkLoaded();
      });

      const unsubFavs = onSnapshot(favQuery, (snapshot) => {
        setFavorites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        favsLoaded = true;
        checkLoaded();
      }, (err) => {
        console.error("Fav error:", err);
        favsLoaded = true;
        checkLoaded();
      });

      return () => {
        unsubChat();
        unsubFavs();
      };
    } else {
      const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      localHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setChatHistory(localHistory);

      const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(localFavs);

      setIsAppLoading(false);
    }
  }, [user, authReady]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    authTimeoutRef.current = setTimeout(() => {
      console.warn("Google login timeout — fallback");
    }, 10000);

    try {
      await signInWithPopup(auth, provider);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      if (
        error.code !== 'auth/cancelled-popup-request' &&
        error.code !== 'auth/popup-closed-by-user'
      ) {
        alert("Google login failed. Check console.");
      }
    }
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    provider.setCustomParameters({ display: 'popup' });

    authTimeoutRef.current = setTimeout(() => {
      console.warn("Facebook login timeout — fallback");
    }, 10000);

    try {
      if (isMobile) {
        localStorage.setItem("fb-login-started", "true");
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Facebook Sign-in Error:", error.message);
      if (
        error.code !== 'auth/cancelled-popup-request' &&
        error.code !== 'auth/popup-closed-by-user'
      ) {
        alert("Facebook login failed. Check console.");
      }
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error("Sign-out Error:", error);
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
      const snapshot = await getDocs(collection(db, `users/${user.uid}/chatHistory`));
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } else {
      localStorage.removeItem('chatHistory');
      setChatHistory([]);
    }
    setIsMenuOpen(false);
  };

  const toggleFavorite = async (message) => {
    if (!message.id) return;

    if (user) {
      const favoriteRef = doc(db, `users/${user.uid}/favorites`, message.id);
      const isFavorited = favorites.some(fav => fav.id === message.id);
      if (isFavorited) {
        await deleteDoc(favoriteRef);
      } else {
        await setDoc(favoriteRef, { ...message, timestamp: serverTimestamp() });
      }
    } else {
      const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
      const exists = localFavs.some(fav => fav.id === message.id);
      const updated = exists
        ? localFavs.filter(fav => fav.id !== message.id)
        : [...localFavs, { ...message, timestamp: new Date().toISOString() }];
      localStorage.setItem('favorites', JSON.stringify(updated));
      setFavorites(updated);
      setShowGuestFavoriteNotice(true); // ✅ trigger warning
    }
  };

  const deleteFavorites = async () => {
    if (user) {
      const snapshot = await getDocs(collection(db, `users/${user.uid}/favorites`));
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } else {
      localStorage.removeItem('favorites');
      setFavorites([]);
    }
  };

  const value = {
    user, authReady, isAppLoading,
    signInWithGoogle, signInWithFacebook, logOut,
    chatHistory, setChatHistory, addMessageToHistory,
    deleteChatHistory, favorites, toggleFavorite,
    deleteFavorites, isLoading, setIsLoading,
    page, setPage, isMenuOpen, setIsMenuOpen,
    showGuestFavoriteNotice, setShowGuestFavoriteNotice // ✅ make available
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
