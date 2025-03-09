"use client";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

// Firebase config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase();

export default function CreateRoom() {
    const [user] = useAuthState(auth);
    const [rooms, setRooms] = useState<{ id: string; roomName: string; source: string; numQuestions: number; numPeople: number }[]>([]);
    const [roomName, setRoomName] = useState("");
    const [questionSource, setQuestionSource] = useState("random");
    const [numQuestions, setNumQuestions] = useState(10);
    const [numPeople, setNumPeople] = useState(1);
    const router = useRouter();

    // Fetch rooms from Firebase
    useEffect(() => {
        const roomsRef = ref(db, "rooms");
        onValue(roomsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const roomArray = Object.keys(data).map((id) => ({
                    id,
                    ...data[id]
                }));
                setRooms(roomArray);
            } else {
                setRooms([]);
            }
        });
    }, []);

    // Handle room creation
    const makeRoom = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const roomId = Date.now().toString(); // Unique room ID using timestamp

        const roomData = {
            roomName,
            source: questionSource,
            numQuestions,
            numPeople
        };

        const roomsRef = ref(db, "rooms/" + roomId);
        set(roomsRef, roomData);

        // Redirect to the newly created room
        router.push(`/game?roomId=${roomId}`);
    };

    // Handle joining a room
    const joinRoom = (roomId: string) => {
        router.push(`/game?roomId=${roomId}`);
    };

    return (
        <div className="max-w-2xl mx-auto mt-10">
            {/* Create Room Form */}
            <h2 className="text-3xl text-center mb-6">Create a New Room</h2>
            <form onSubmit={makeRoom} className="mb-10">
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="room-name">
                        Room Name
                    </label>
                    <input
                        type="text"
                        name="room-name"
                        id="room-name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Enter room name"
                        required
                    />
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="question-source">
                        Question Source
                    </label>
                    <select
                        id="question-source"
                        name="question-source"
                        value={questionSource}
                        onChange={(e) => setQuestionSource(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                    >
                        <option value="random">USABO</option>
                        <option value="trivia">Trivia</option>
                        <option value="math">Math</option>
                        <option value="history">History</option>
                        <option value="science">Science</option>
                    </select>
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="num-questions">
                        Number of Questions
                    </label>
                    <input
                        type="number"
                        id="num-questions"
                        name="num-questions"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        min="1"
                        required
                    />
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="num-people">
                        Number of People
                    </label>
                    <input
                        type="number"
                        id="num-people"
                        name="num-people"
                        value={numPeople}
                        onChange={(e) => setNumPeople(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        min="1"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                >
                    Create Room
                </button>
            </form>

            {/* List of available rooms */}
            <h2 className="text-3xl text-center mb-6">Available Rooms</h2>
            {rooms.length === 0 ? (
                <p className="text-center text-gray-500">No rooms available. Create one!</p>
            ) : (
                <ul className="space-y-4">
                    {rooms.map((room) => (
                        <li key={room.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold">{room.roomName}</h3>
                                    <p className="text-gray-600 text-sm">Source: {room.source}</p>
                                    <p className="text-gray-600 text-sm">Questions: {room.numQuestions}</p>
                                    <p className="text-gray-600 text-sm">Players: {room.numPeople}</p>
                                </div>
                                <button
                                    onClick={() => joinRoom(room.id)}
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                >
                                    Join
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
