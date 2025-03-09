"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut,} from "firebase/auth";
import 'firebase/firestore';
import Link from "next/link";
import { redirect } from 'next/navigation'
import { getDatabase, ref, onValue, off, DataSnapshot } from "firebase/database";
import { useEffect } from 'react';
import { useState } from 'react';
import { initializeApp } from "firebase/app"

interface RoomAttributes {
    [key: string]: any;
}

interface Rooms {
    [roomId: string]: RoomAttributes;
}
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

export default function Play() {
    let auth = getAuth(app)
    const [user] = useAuthState(auth);

    const makeRoom = () => {
        console.log("making a room");
        redirect('/newroom')
    }
    const [rooms, setRooms] = useState<Rooms>({});

    useEffect(() => {
        const db = getDatabase();
        const roomsRef = ref(db, 'rooms/');

        // Callback to handle data updates
        const handleData = (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val() as Rooms;
                setRooms(data);
            } else {
                setRooms({});
            }
        };

        // Set up the real-time listener
        onValue(roomsRef, handleData);

        // Clean up the listener on component unmount
        return () => off(roomsRef, 'value', handleData);
    }, []);

    return (
        <div>
            {(user) ?
                <div className='flex flex-col items-center'>
                    <button onClick={makeRoom}>
                        <div className='p-4 mt-10 text-center text-4xl w-96 rounded-lg bg-gray-200'>
                            Make a new room
                        </div>
                    </button>

                    <div>
                        {(Object.entries(rooms) as [string, RoomAttributes][]).map(([roomId, roomData]) => (
                            <div key={roomId} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
                                <h2>Room ID: {roomId}</h2>
                                <div>
                                    {Object.entries(roomData).map(([attrKey, attrValue]) => (
                                        <p key={attrKey}>
                                            <strong>{attrKey}:</strong> {attrValue.toString()}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                :
                <Link href="/login">Link to login</Link>

            }
        </div>

    );
}