"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { getDatabase, ref, set } from "firebase/database";

export default function Play() {

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
    const db = getDatabase(app);
    const auth = getAuth(app);

    const [loading, setLoading] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Function to create a room in Firebase
    const createRoomPage = (name: string) => {
        set(ref(db, 'rooms/' + name), {
            playerCount: 1
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            {
                !localStorage.getItem("user") ? (
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                        <h1 className="text-3xl font-bold text-red-500 mb-4">You are not signed in yet!</h1>
                        <p className="text-gray-400 mb-6">Please log in to join the game and play!</p>
                        <Link href="/login">Link to login</Link>
                    </div>
                )
                : (
                    <>
                        <h1 className="text-5xl font-bold">Create a Room</h1>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Enter Room Name"
                            className="mt-4 p-2 border border-gray-400 rounded"
                        />
                        <button
                            onClick={() => {
                                setLoading(true);
                                createRoomPage(roomName);
                                setLoading(false);
                                router.push(`/room/${roomName}`); // Navigate to the new room page after creation
                            }}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Room"}
                        </button>
                    </>
                )
            }
        </div>
    );
}