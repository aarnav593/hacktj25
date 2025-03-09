// pages/buttonPage.tsx
"use client";
import { useState } from "react";
import React from 'react';
import Image from "next/image";
import Link from "next/link"
import { signIn } from "next-auth/react";
import { initializeApp } from "firebase/app"
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut,} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export function Login() {
    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    }
    return (
        <>
             <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
        </>
    );
}

export function Logout() {
    return auth.currentUser && (
        <button className="block py-2 px-3 text-zinc-900 bg-red-500 rounded-sm hover:bg-red-700" onClick={() => auth.signOut()}>Sign Out</button>
    )
}