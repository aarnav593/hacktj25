// pages/buttonPage.tsx
"use client";
import { useState } from "react";
import React from 'react';
import Image from "next/image";
import Link from "next/link"
import { signIn } from "next-auth/react";
import { initializeApp } from "firebase/app"
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut,} from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebaseConfig";
import { redirect } from 'next/navigation';

export default function Login() {
    const [user] = useAuthState(auth);

    const signInWithGoogle = () => {
        try {  
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider);
            redirect("./play");
        } catch (error) {
            console.error(error);
        }
        
    }
    return (
        <>
            {
                user == null ? 
                <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
                :
                <div>already signed in!</div>
            } 
             
        </>
    );
}