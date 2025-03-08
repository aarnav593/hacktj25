// pages/buttonPage.tsx
"use client";
import { useState } from "react";
import React from 'react';
import Image from "next/image";
import Link from "next/link"
import { signIn } from "next-auth/react";
import { initializeApp } from "firebase/app"
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut,} from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyAe8sUJCUQvLxyBlKCqNLZyycFqwg93Jg0",
    authDomain: "bioblitz-367b6.firebaseapp.com",
    databaseURL: "https://bioblitz-367b6-default-rtdb.firebaseio.com",
    projectId: "bioblitz-367b6",
    storageBucket: "bioblitz-367b6.firebasestorage.app",
    messagingSenderId: "821109453859",
    appId: "1:821109453859:web:f60724742956f22548ed96",
    measurementId: "G-731TXJB1N2"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();



export default function loginPage() {

  const [clicked, setClicked] = useState(false);

  
  const signInWithGoogle = async () => {
  
  
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
  
      const result = await signInWithPopup(auth, provider);
      console.log("User Info:", result.user);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
    setClicked(!clicked);

                };

  auth.onAuthStateChanged(user => {
    if (user) {
      console.log("User is signed in:", user);
      // Store user data in sessionStorage/localStorage
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      console.log("No user signed in.");
    }
  });
  if(!localStorage.getItem('user')){
      
 
  return (
   
    <div style={styles.container}>
      
      <button style={styles.button} onClick={signInWithGoogle}>
        {clicked ? "" : "Sign in with google"}
      </button>
    
    </div>
  );
}else{
return(
  <div>
    <p>You are already signed in.</p>
 </div>
)
}
}



const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
};