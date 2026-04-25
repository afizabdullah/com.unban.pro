import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with long polling to bypass potential proxy/WebSocket issues
console.log("Initializing Firestore with Database ID:", firebaseConfig.firestoreDatabaseId);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }
};

// Critical Connection Test with Retry
async function testConnection(retries = 3) {
  console.log("Starting Firestore connectivity test...");
  console.log("Target Database ID:", firebaseConfig.firestoreDatabaseId || "(default)");
  console.log("Current Auth State:", auth.currentUser ? `Authenticated (${auth.currentUser.uid})` : "Not Authenticated");
  
  // Ensure anonymous auth is at least attempted if not signed in
  if (!auth.currentUser) {
    try {
      console.log("Attempting anonymous login...");
      await signInAnonymously(auth);
      console.log("Anonymous login successful. UID:", auth.currentUser?.uid);
    } catch (e) {
      console.warn("Anonymous auth failed:", e);
    }
  }

  for (let i = 0; i < retries; i++) {
    try {
      // Test read on a known public path
      const testRef = doc(db, 'global_stats', 'counters');
      const testSnap = await getDocFromServer(testRef);
      console.log("Firestore connection test: SUCCESS", testSnap.exists() ? "Stats found" : "Stats doc missing (but read allowed)");
      return;
    } catch (error) {
      const err = error as any;
      console.error(`Firestore test attempt ${i+1} failed:`, err.code, err.message);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

// Start connection test early
testConnection();
