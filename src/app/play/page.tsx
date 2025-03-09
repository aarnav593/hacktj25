"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "../../lib/firebaseConfig";
import 'firebase/firestore';
import Link from "next/link";
import { redirect } from 'next/navigation'
import { getDatabase, ref, onValue, off, DataSnapshot } from "firebase/database";
import { useEffect } from 'react';
import { useState } from 'react';

interface RoomAttributes {
    [key: string]: any;
}

interface Rooms {
    [roomId: string]: RoomAttributes;
}


export default function Play() {
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