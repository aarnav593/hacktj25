// pages/buttonPage.tsx
"use client";
import { useState } from "react";
import React from 'react';
import Image from "next/image";
import Link from "next/link"
import { signIn } from "next-auth/react";
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, } from "firebase/auth";
import {auth} from "../../lib/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { redirect } from "next/navigation";

export default function loginPage() {

  const [clicked, setClicked] = useState(false);
  const [user] = useAuthState(auth);

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
    redirect("./play");
  };

  auth.onAuthStateChanged(user => {
    if (user) {
      console.log("User is signed in:", user);
    } else {
      console.log("No user signed in.");
    }
  });
  if (user == null) {
    return (
      <div className="flex items-center justify-center">
        <button onClick={signInWithGoogle} className="cursor-pointer bg-zinc-900 text-4xl p-6 text-white rounded-lg">
          {clicked ? "" : "Sign in with google"}
          
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <p>You are already signed in.</p>
      </div>
    )
  }
}