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
  orderBy // Keeping orderBy for now, but note about indexes for user
} from 'firebase/firestore';

// Initialize Firebase outside the component to ensure it's only done once
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

  const authTimeoutRef = useRef(null);
  // Detect mobile once
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Effect for handling initial authentication state and redirect results
  useEffect(() => {
    // Flag to ensure getRedirectResult is only processed once on initial load
    let initialRedirectCheckDone = false;

    // First, check for redirect results
    const checkRedirectAndAuthState = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Firebase redirect login success:", result.user);
          setUser(result.user);
        }
      } catch (error) {
        console.error("Firebase Redirect login error:", error);
      } finally {
        initialRedirectCheckDone = true; // Mark as done regardless of success/failure
        // Set up the auth state listener after checking for redirect result
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthReady(true); // Now auth is ready
          // Clear any timeout set for auth if it was for signInWithPopup
          if (authTimeoutRef.current) {
            clearTimeout(authTimeoutRef.current);
            authTimeoutRef.current = null;
          }
        });
        // Cleanup listener on unmount
        return unsubscribe;
      }
    };

    const unsubscribePromise = checkRedirectAndAuthState();

    // Ensure unsubscribe is called if the component unmounts quickly
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  // Effect for loading Firestore data or local storage
  useEffect(() => {
    // Only proceed if authentication state is ready
    if (!authReady) {
      return;
    }

    if (user) {
      let chatLoaded = false;
      let favsLoaded = false;

      const checkInitialLoadComplete = () => {
        if (chatLoaded && favsLoaded) {
          setIsAppLoading(false);
        }
      };

      // Firestore queries - consider adding indexes in Firebase Console if you encounter errors or performance issues with orderBy
      const chatQuery = query(collection(db, `users/${user.uid}/chatHistory`), orderBy('timestamp', 'asc'));
      const favQuery = query(collection(db, `users/${user.uid}/favorites`), orderBy('timestamp', 'desc'));

      const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
        setChatHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        chatLoaded = true;
        checkInitialLoadComplete();
      }, (error) => {
        console.error("Firestore Chat History Error:", error);
        chatLoaded = true;
        checkInitialLoadComplete();
      });

      const unsubscribeFavorites = onSnapshot(favQuery, (snapshot) => {
        setFavorites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      // Handle unauthenticated user (local storage)
      const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      localHistory.sort((a, b) => {
        // Ensure timestamp is treated as a Date object for sorting
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateA - dateB;
      });
      setChatHistory(localHistory);
      setFavorites([]); // Clear favorites for logged out users
      setIsAppLoading(false);
    }
  }, [user, authReady]); // Depend on user and authReady states

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setIsMenuOpen(false); // Close menu on login attempt

    // Clear any existing timeout before setting a new one
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
    }

    // Set a timeout, especially for popup, in case it gets stuck
    authTimeoutRef.current = setTimeout(() => {
      console.warn("Google login process timeout. If no popup appeared, it might be blocked.");
      // You might want to show a message to the user here
    }, 15000); // 15 seconds timeout

    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
      // authReady will be set true by onAuthStateChanged listener
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      // Clean up timeout on error
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
      if (
        error.code !== 'auth/cancelled-popup-request' &&
        error.code !== 'auth/popup-closed-by-user'
      ) {
        // Using a custom modal/toast message instead of alert for better UX
        // You'll need to implement a UI for this, e.g., a state variable to show an error message
        console.log("Google login failed: " + error.message);
      }
    }
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    setIsMenuOpen(false); // Close menu on login attempt

    // Using signInWithRedirect always for Facebook due to common mobile issues
    try {
      await signInWithRedirect(auth, provider);
      // authReady will be set true by onAuthStateChanged listener
    } catch (error) {
      console.error("Facebook Redirect Sign-in Error:", error);
      // Using a custom modal/toast message instead of alert for better UX
      console.log("Facebook login failed: " + error.message);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null); // Explicitly clear user state immediately
      setChatHistory([]); // Clear chat history on logout
      setFavorites([]); // Clear favorites on logout
      setPage('home'); // Reset page to home or appropriate default
      // No window.location.reload() for smoother UX
    } catch (error) {
      console.error("Sign-out Error:", error);
    }
  };

  const addMessageToHistory = async (message) => {
    if (user) {
      await addDoc(collection(db, `users/${user.uid}/chatHistory`), {
        ...message,
        timestamp: serverTimestamp() // Ensure timestamp is set on Firestore
      });
    } else {
      const localMessage = { ...message, timestamp: new Date().toISOString() };
      const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      const newHistory = [...localHistory, localMessage];
      // Sort local history to ensure chronological order after adding new message
      newHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setChatHistory(newHistory);
      localStorage.setItem('chatHistory', JSON.stringify(newHistory));
    }
  };

  const deleteChatHistory = async () => {
    if (user) {
      // Get all documents in the collection and delete them in a batch
      const chatCollectionRef = collection(db, `users/${user.uid}/chatHistory`);
      const snapshot = await getDocs(chatCollectionRef);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } else {
      localStorage.removeItem('chatHistory');
      setChatHistory([]);
    }
    setIsMenuOpen(false);
  };

  const toggleFavorite = async (message) => {
    if (!user || !message.id) return; // message.id is required for Firestore doc ID
    const favoriteRef = doc(db, `users/${user.uid}/favorites`, message.id);
    const isFavorited = favorites.some(fav => fav.id === message.id);
    if (isFavorited) {
      await deleteDoc(favoriteRef);
    } else {
      // When setting a favorite, ensure to include relevant data from the message
      await setDoc(favoriteRef, { ...message, timestamp: serverTimestamp() });
    }
  };

  const deleteFavorites = async () => {
    if (user) {
      const favCollectionRef = collection(db, `users/${user.uid}/favorites`);
      const snapshot = await getDocs(favCollectionRef);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }
  };

  const value = {
    user,
    authReady,
    isAppLoading,
    signInWithGoogle,
    signInWithFacebook,
    logOut,
    chatHistory,
    setChatHistory,
    addMessageToHistory,
    deleteChatHistory,
    favorites,
    toggleFavorite,
    deleteFavorites,
    isLoading,
    setIsLoading,
    page,
    setPage,
    isMenuOpen,
    setIsMenuOpen
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
