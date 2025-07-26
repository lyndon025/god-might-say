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
  const [authReady, setAuthReady] = useState(false); // Indicates if Firebase auth state has been fully checked
  const [chatHistory, setChatHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // For specific actions like AI generation
  const [page, setPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true); // For initial app data loading

  const authTimeoutRef = useRef(null);
  // Detect mobile once on component mount
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Primary effect for managing authentication state and redirect results
  useEffect(() => {
    // Flag to ensure getRedirectResult is only processed once on initial app load
    let hasCheckedRedirect = false;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Clear any pending popup timeout
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }

      if (currentUser) {
        // User is logged in (either initially, or after a popup/redirect)
        setUser(currentUser);
        setAuthReady(true);
      } else {
        // No current user. Check if this is a redirect landing.
        if (!hasCheckedRedirect) {
          try {
            const result = await getRedirectResult(auth);
            if (result?.user) {
              // Redirect successfully handled, user is now signed in
              console.log("Firebase redirect login success:", result.user);
              setUser(result.user); // setUser will trigger onAuthStateChanged again with the new user
            } else {
              // No redirect result, user is genuinely logged out or not logged in initially
              setUser(null);
            }
          } catch (error) {
            // Handle errors during redirect processing (e.g., auth/cancelled-popup-request)
            console.error("Redirect login error:", error);
            setUser(null); // Ensure user is null on redirect error
            // Optionally, show a user-friendly error message here (e.g., via a toast/modal state)
          } finally {
            hasCheckedRedirect = true; // Mark that we've checked for redirect results
            setAuthReady(true); // Auth state is now finalized
          }
        } else {
          // If onAuthStateChanged fires with null user AND we've already checked for redirect,
          // then the user is definitively logged out.
          setUser(null);
          setAuthReady(true); // Auth state is now finalized
        }
      }
    });

    // Cleanup function for onAuthStateChanged listener
    return () => unsubscribeAuth();
  }, []); // Empty dependency array means this effect runs only once on mount

  // Effect for loading Firestore data or local storage based on auth state
  useEffect(() => {
    // This effect should only run once auth state is confirmed (authReady is true)
    if (!authReady) {
      return;
    }

    if (user) {
      let chatLoaded = false;
      let favsLoaded = false;

      const checkInitialLoadComplete = () => {
        if (chatLoaded && favsLoaded) {
          setIsAppLoading(false); // Finished loading user-specific data
        }
      };

      // Firestore queries with orderBy:
      // IMPORTANT: For `orderBy` clauses that are not on the document ID,
      // you will likely need to create a composite index in your Firebase Console
      // (Firestore -> Indexes) if your dataset grows, otherwise queries may fail
      // or be very slow.
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
      // User is logged out, load from local storage
      const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      // Ensure local history is sorted by timestamp
      localHistory.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateA - dateB;
      });
      setChatHistory(localHistory);
      setFavorites([]); // Clear favorites for logged out users
      setIsAppLoading(false); // No user data to load, so app is ready
    }
  }, [user, authReady]); // Depend on user and authReady states

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setIsMenuOpen(false); // Close menu on login attempt

    // Clear any existing timeout before setting a new one
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
    }

    // Set a timeout, especially for popup, in case it gets stuck or blocked
    authTimeoutRef.current = setTimeout(() => {
      console.warn("Google login process timed out. If no popup appeared, it might be blocked or there's a network issue.");
      // You might want to show a message to the user here (e.g., "Login process taking longer than expected...")
    }, 15000); // 15 seconds timeout

    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
      // onAuthStateChanged listener will handle setting the user state and clearing timeout
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      // Clean up timeout on error
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
      // Provide more specific error feedback without using alert
      let errorMessage = "Google login failed.";
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login cancelled or popup closed.";
      } else if (error.message) {
        errorMessage += ` Details: ${error.message}`;
      }
      console.log(errorMessage);
      // For a real app, you'd update a state variable like `setErrorMessage(errorMessage)`
    }
  };

  const signInWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    setIsMenuOpen(false); // Close menu on login attempt

    // Clear any existing timeout before setting a new one
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
    }
    
    // Set a timeout for popup only, redirect will not block
    if (!isMobile) {
        authTimeoutRef.current = setTimeout(() => {
            console.warn("Facebook login process timed out. If no popup appeared, it might be blocked or there's a network issue.");
        }, 15000); // 15 seconds timeout
    }

    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider); // Use popup for PC
      }
      // onAuthStateChanged listener will handle setting the user state and clearing timeout
    } catch (error) {
      console.error("Facebook Sign-in Error:", error);
      // Clean up timeout on error
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
      // Provide more specific error feedback without using alert
      let errorMessage = "Facebook login failed.";
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login cancelled or popup closed.";
      } else if (error.message) {
        errorMessage += ` Details: ${error.message}`;
      }
      console.log(errorMessage);
      // For a real app, you'd update a state variable like `setErrorMessage(errorMessage)`
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      // Firebase's onAuthStateChanged listener will automatically set user to null
      // and trigger the cleanup for chatHistory/favorites.
      // Explicitly clearing state here can cause a momentary flash, but ensures immediate UI update.
      setUser(null);
      setChatHistory([]);
      setFavorites([]);
      setPage('home'); // Reset page to default after logout
    } catch (error) {
      console.error("Sign-out Error:", error);
    }
  };

  const addMessageToHistory = async (message) => {
    if (user) {
      await addDoc(collection(db, `users/${user.uid}/chatHistory`), {
        ...message,
        timestamp: serverTimestamp() // Ensures server-generated timestamp for consistency
      });
    } else {
      const localMessage = { ...message, timestamp: new Date().toISOString() };
      const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      const newHistory = [...localHistory, localMessage];
      // Sort local history to ensure chronological order for display
      newHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setChatHistory(newHistory);
      localStorage.setItem('chatHistory', JSON.stringify(newHistory));
    }
  };

  const deleteChatHistory = async () => {
    if (user) {
      // Fetch all docs and delete them in a batch-like operation
      const chatCollectionRef = collection(db, `users/${user.uid}/chatHistory`);
      const snapshot = await getDocs(chatCollectionRef);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } else {
      localStorage.removeItem('chatHistory');
      setChatHistory([]);
    }
    setIsMenuOpen(false); // Close menu after action
  };

  const toggleFavorite = async (message) => {
    if (!user || !message.id) return; // message.id is crucial as it's used for the doc ID
    const favoriteRef = doc(db, `users/${user.uid}/favorites`, message.id);
    const isFavorited = favorites.some(fav => fav.id === message.id);

    if (isFavorited) {
      await deleteDoc(favoriteRef);
    } else {
      // Store the message content and add a timestamp
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
