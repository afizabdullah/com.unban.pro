import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore
console.log("Firebase Config Keys:", Object.keys(firebaseConfig));
console.log("Using Database ID:", firebaseConfig.firestoreDatabaseId);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.log(`[Firestore Error] Operation: ${operationType}, Path: ${path}, User: ${auth.currentUser?.uid}`);
  console.error('Firestore Error Detail: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
      try {
        const testSnap = await getDocFromServer(testRef);
        console.log("Firestore connection test: SUCCESS", testSnap.exists() ? "Stats found" : "Stats doc missing (but read allowed)");
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'global_stats/counters');
        throw err;
      }
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
