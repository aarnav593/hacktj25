import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User, onAuthStateChanged } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAe8sUJCUQvLxyBlKCqNLZyycFqwg93Jg0",
  authDomain: "bioblitz-367b6.firebaseapp.com",
  databaseURL: "https://bioblitz-367b6-default-rtdb.firebaseio.com",
  projectId: "bioblitz-367b6",
  storageBucket: "bioblitz-367b6.firebasestorage.app",
  messagingSenderId: "821109453859",
  appId: "1:821109453859:web:f60724742956f22548ed96",
  measurementId: "G-731TXJB1N2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Global state for authentication
let globalUser: User | null = null;
let setGlobalUser: React.Dispatch<React.SetStateAction<User | null>> | null = null;

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(globalUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      globalUser = user; // Sync global user state
      if (setGlobalUser) setGlobalUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setGlobalUser = setCurrentUser;
  }, []);

  return { currentUser, setCurrentUser };
}

// Sign in function
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    globalUser = result.user;
    if (setGlobalUser) setGlobalUser(result.user);
    return result.user;
  } catch (error) {
    console.error("Sign-in error:", error);
    throw error;
  }
}

// Sign out function
export async function signOutUser() {
  try {
    await signOut(auth);
    globalUser = null;
    if (setGlobalUser) setGlobalUser(null);
  } catch (error) {
    console.error("Sign-out error:", error);
  }
}

// Export current user and setter globally
export { globalUser as currentUser, setGlobalUser as setCurrentUser };
