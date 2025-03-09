"use client";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link"
import React from "react";
import { signOut, getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app"
import { getDatabase, ref, get, child} from "firebase/database";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

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


export default function page() {
  var auth = getAuth();
  const [user] = useAuthState(auth);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);

      window.location.href = "/login"; 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  if(!user){
    return (
      
      <div className = "text-center">
        <h1 className="text-5xl font-bold">BioBlitz</h1>
        <p className="mt-4 text-gray-700">Making biomed education more accessible.</p>
        <Link href="/login" className="text-blue-500 hover:underline">
        Login!
        </Link>
      </div>
     
    );
  }else{
  return (
   
    <div className = "text-center">
      <h1 className="text-5xl font-bold">BioBlitz</h1>
      <p className="mt-4 text-gray-700">Making biomed education more accessible.</p>
      <Link href="/play" className="text-blue-500 hover:underline">
      Join a game!
      </Link>
      
    </div>
  
  );}
}
