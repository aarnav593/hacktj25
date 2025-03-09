import Image from "next/image";
import Head from "next/head";
import Link from "next/link"
import React from "react";
import { signOut, getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app"


export default function page() {
    return (
      
      <div className = "text-center">
        <h1 className="text-5xl font-bold">BioBlitz</h1>
        <p className="mt-4 text-gray-700">Making biomed education more accessible.</p>
        <Link href="/login" className="text-blue-500 hover:underline">
        Login!
        </Link>
      </div>
     
    );
}
