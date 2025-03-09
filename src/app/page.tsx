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
import { auth } from "../lib/auth";
import logo from "./logo.png";

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
    return (
      
      <div className = "text-center flex flex-col justify-center items-center">
        <Image src={logo} alt="big logo" width={200} height={200} />
        <h1 className="text-3xl font-bold">BioBlitz</h1>
        <p className="mt-4 text-gray-700">Making biomed education more accessible.</p>
        {!user ?
        
        <Link href="/login" className="text-blue-500 hover:underline">
        Login!
        </Link>
        :
        <Link href="/play" className="text-blue-500 hover:underline">
        Join a game!
        </Link>
        }
        
      </div>
     
    );
}
