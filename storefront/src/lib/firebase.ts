import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBeBbwGi7yleXPesMv92CMWbaG8ebK3p-g",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "app11-88fc1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "app11-88fc1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "app11-88fc1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1029977158311",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1029977158311:web:fe400857c868ccab1ba182",
};

// Initialize Firebase safely
const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword };
