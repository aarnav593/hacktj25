"use client";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDatabase, ref, onValue, push, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import OpenAI from "openai";
import Link from "next/link";
import { auth } from "../../lib/auth";
const db = getDatabase();

const openai = new OpenAI({
    apiKey: "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",
    dangerouslyAllowBrowser: true
});

// Define the Question type
type Question = {
    question: string;
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    correct: string;
};

// Define the RoomData type with the Questions field as a Record of number to Question
type RoomData = {
    roomName: string;
    source: string;
    numQuestions: number;
    numPeople: number;
    Questions: Record<number, Question>; // Ensures TypeScript knows the structure
};

export default function CreateRoom() {
    const [user] = useAuthState(auth);
    const [rooms, setRooms] = useState<{ id: string; roomName: string; source: string; numQuestions: number; numPeople: number }[]>([]);
    const [roomName, setRoomName] = useState("");
    const [questionSource, setQuestionSource] = useState("random");
    const [diff, setDiff] = useState("easy");
    const [topic, setTopic] = useState("general");
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
    const makeRoom = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const roomId = Date.now().toString(); // Unique room ID using timestamp

        // Initialize room data
        let roomsRef = ref(db, "rooms/" + roomId);
        let roomData: RoomData = {
            roomName,
            source: questionSource,
            numQuestions,
            numPeople,
            Questions: {} // Initialize as an empty object for storing questions
        };







// Generate questions and store them in the roomData object
for (let i = 0; i < numQuestions; i++) {
    try {
        const questionData = await generateQuestion(diff, questionSource, topic, i); // Await question generation
        if (questionData && questionData.question) {
            roomData.Questions[i] = questionData; // Add question data to the room
        } else {
            console.error(`Question ${i} failed to generate properly.`);
        }
    } catch (error) {
        console.error(`Error generating question ${i}:`, error);
    }
}

        // Push room data with all generated questions to Firebase
        await set(roomsRef, roomData);

        // Redirect to the newly created room
        router.push(`/game?roomId=${roomId}`);
    };

    // Function to generate questions using OpenAI
    async function generateQuestion(diff: string, ques: string, top: string, iterations: number): Promise<Question> {
        const modal = diff === "easy" ? "gpt-4o-mini" : "gpt-4o";

        // Generate question using OpenAI API
        const completion = await openai.chat.completions.create({
            model: modal,
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Return a UNIQUE "+ ques+ " style, " +diff+ " question relating to the following topic, and your response will strictly be in JSON format as follows, with double quotes (not single quotes), without any extra characters or explanations: {'question':'','a':'','b':'','c':'','d':'','e':'','correct':''}"
                },
                {
                    role: "user",
                    content: top
                }
            ]
        });
        console.log(completion.choices[0].message.content);
        const questionData = JSON.parse(completion.choices[0]?.message?.content || "{}");

        // Ensure the data returned matches the Question structure
        return questionData as Question;
    }

    // Handle joining a room
    const joinRoom = (roomId: string) => {
        router.push(`/game?roomId=${roomId}`);
    };

    if (user != null) {
        return (
            <div>
            <div className="text-5xl text-center">Play BioBlitz</div>
            <div className="mt-10 flex gap-8">
                <div className="w-1/3">
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
                            <option value="USA biology olympiad">USABO</option>
                            <option value="United states medical licensing exam">USMLE</option>
                            <option value="national science bowl">NSB</option>
                            <option value="medical college admissions test">MCAT</option>
                            <option value="british biology olympiad">BBO</option>
                        </select>
                    </div>

                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="difficulty">
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
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="difficult">Difficult</option>
                            <option value="extremely difficult">Extremely Difficult</option>
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
                        <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="topic">
                            Topic
                        </label>
                        <input
                            id="topic"
                            name="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                </div>
                <div className="w-2/3">
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
            </div>
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