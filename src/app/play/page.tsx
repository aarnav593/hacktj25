"use client";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDatabase, ref, onValue, set, update, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import OpenAI from "openai";
import router from "next/router";
import Link from "next/link";

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
    const [diff, setDiff] = useState("easy")
    const [topic, setTopic] = useState("general")
    const [numQuestions, setNumQuestions] = useState(10);
    const [numPeople, setNumPeople] = useState(1);
    //const toggleCorrectAnswer = () => {
       // setShowCorrectAnswer((prev) => !prev);
  //  };

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
        const openai = new OpenAI(
            {
                apiKey: "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",
                dangerouslyAllowBrowser: true
            })
        event.preventDefault();
        const roomId = Date.now().toString(); // Unique room ID using timestamp
        // Generate question first
        let roomsRef;
        let roomData;
        for(let i = 1; i < numQuestions; i++){
        generateQuestion(diff, questionSource,  topic, i);


         roomsRef = ref(db, "rooms/" + roomId);
         /*roomData = {
            roomName,
            source: questionSource,
            numQuestions,
            numPeople,
            Questions: {
                [i]: {
                    question: "", 
                    a: "",
                    b: "",
                    c: "",
                    d: "",
                    e: "",
                    correct: ""
                }
            }
        };}*/

        // Instead of updating the "questions" node, we are now updating the correct "Questions" node
        

        // Set room data in Firebase
        push(roomsRef!, roomData);

        // Generate and set the question data in the "questions" folder
        async function generateQuestion(diff: string, ques: string, top: string,iterations:Number) {
            const modal = diff === "easy" ? "gpt-4o-mini" : "gpt-4o";

            const completion = await openai.chat.completions.create({
                model: modal,
                messages: [
                    {
                        role: "system",
                        content: "Return a unique "+ques+" style," +diff+ "question relating to the following topic, and return it in the json form: {question:'',a:'',b:'',c:'',d:'',e:'',correct:''}"
                    },
                    {
                        role: "user",
                        content: top
                    }
                ],
                store: true,
            });

            const questionData = JSON.parse(completion.choices[0]?.message?.content || "{}");

            // Update the room with the question data
            update(ref(db, "rooms/"+roomId+"/questions/"+iterations), questionData);
        }

        // Redirect to the newly created room
        router.push(`/game?roomId=${roomId}`);
    };
    };
    // Handle joining a room
    const joinRoom = (roomId: string) => {
        router.push(`/game?roomId=${roomId}`);
    };
    
   // const toggleCorrectAnswer = () => {
 //       setShowCorrectAnswer((prev) => !prev);
  //  };

    if (user != null) {
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
                            <option value="USABO">USABO</option>
                            <option value="USMLE">USMLE</option>
                            <option value="NSB">NSB</option>
                            <option value="MCAT">MCAT</option>
                            <option value="BBO">BBO</option>
                        </select>
                    </div>
    
                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="question-source">
                            Difficulty
                        </label>
                        <select
                            id="difficulty"
                            name="difficulty"
                            value={diff}
                            onChange={(e) => setDiff(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Difficult">Difficult</option>
                            <option value="Extremely Difficult">Extremely Difficult</option>
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
                        <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="num-questions">
                        Topic 
            
                                </label>
                        <input
                            id="topic"
                            name="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            min="1"
                            
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
                                        <h3 className="text-3xl font-semibold mb-2">{room.roomName}</h3>
                                        <p className="text-lg-600 text-gray-600">Source: {room.source}</p>
                                        <p className="text-lg-600 text-gray-600">Questions: {room.numQuestions}</p>
                                        <p className="text-lg-600 text-gray-600">Players: {room.numPeople}</p>
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
    } else {
        return (
            <div>
                <div className="text-4xl text-center">You are not signed in!</div>
                <div className="text-lg text-center">
                To sign in, click here: <Link href="/login" className="underline">Login</Link>
                </div>
            </div>
            
        );
    }
}
