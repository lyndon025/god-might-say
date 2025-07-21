// This path is now a simple relative path, which is correct
// because both files are in the 'firebase' folder.
import { db } from './config.js'; 
import { collection, query, onSnapshot } from 'firebase/firestore';

const safeTimestampToDate = (timestamp) => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return new Date(0); 
};

export const streamChatHistory = (userId, callback) => {
  const q = query(collection(db, `users/${userId}/chatHistory`));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const chatHistory = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        jsDate: safeTimestampToDate(data.timestamp),
      };
    });

    chatHistory.sort((a, b) => a.jsDate - b.jsDate);
    
    console.log(`[STREAM] Loaded ${chatHistory.length} chat messages.`);
    callback(chatHistory);
  }, (error) => {
    console.error("Error streaming chat history:", error);
    callback([]);
  });

  return unsubscribe;
};

export const streamFavorites = (userId, callback) => {
  const q = query(collection(db, `users/${userId}/favorites`));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const favorites = querySnapshot.docs.map(doc => {
       const data = doc.data();
       return {
        id: doc.id,
        ...data,
        jsDate: safeTimestampToDate(data.timestamp),
       }
    });

    favorites.sort((a, b) => b.jsDate - a.jsDate);

    console.log(`[STREAM] Loaded ${favorites.length} favorites.`);
    callback(favorites);
  }, (error) => {
    console.error("Error streaming favorites:", error);
    callback([]);
  });

  return unsubscribe;
};
