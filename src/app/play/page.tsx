"use client";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDatabase, ref, onValue, set, get, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import Link from "next/link";
// import OpenAI from "../../ai.js";
import { auth } from "../../lib/auth";
import { questionBank } from "../../lib/questionBank.js";

const db = getDatabase();

type Question = {
    question: string;
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    correct: string;
    difficulty: string;
    competition: string;
    image?: string;
};

type RoomData = {
    roomName: string;
    source: string;
    numQuestions: number;
    timeLimit: number;
    ogCreator: string;
    Questions: Record<number, Question>;
};

async function generateQuestion(source:string, diff:string, topic:string, questionNum:number, roomData:RoomData) {
    const completion = await OpenAI.chat.completions.create({
        messages: [{ role: "system", content: `You are a question generator for a game. You will be given a source, difficulty, and topic. You must generate a question with 5 options (a,b,c,d,e) and a correct answer. The question must be in the following format: {"question": "", "a": "", "b": "", "c": "", "d": "", "e": "", "correct": ""}. The source for the question is ${source}. The difficulty is ${diff}. The topic is ${topic}.` }],
         model: "o4-mini",
       });
    const question = JSON.parse(completion.choices[0].message.content!);
    roomData.Questions[questionNum] = question;
 }

export default function CreateRoom() {
    const [user] = useAuthState(auth);
    const [rooms, setRooms] = useState<{ id: string; roomName: string; source: string; numQuestions: number; timeLimit: number }[]>([]);
    const [roomName, setRoomName] = useState("");
    const [questionSource, setQuestionSource] = useState("USA biology olympiad");
    const [diff, setDiff] = useState("easy");
    const [topic, setTopic] = useState("general "+questionSource);
    const [numQuestions, setNumQuestions] = useState(10);
    const [timeLimit, setTimeLimit] = useState(30); // Default time limit to 30 seconds
    const router = useRouter();

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

    const makeRoom = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const roomId = Date.now().toString();

        let roomsRef = ref(db, "rooms/" + roomId);
        let roomData: RoomData = {
            roomName,
            source: questionSource,
            numQuestions,
            timeLimit, // Use the new timeLimit state here
            ogCreator: user?.uid!,
            Questions: {}
        };

        // for (let i = 0; i < numQuestions; i++) {
        //     await generateQuestion(questionSource, diff, topic, i, roomData);
        // }

        const filteredQuestions = questionBank.filter(q =>
            q.difficulty === diff && q.competition === questionSource
        );

        if (filteredQuestions.length < numQuestions) {
            alert(`Warning: Only ${filteredQuestions.length} questions were found for the selected criteria. The game will proceed with this smaller number of questions.`);
        }
        
        const shuffledQuestions = filteredQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffledQuestions.slice(0, numQuestions);

        selectedQuestions.forEach((question, index) => {
            roomData.Questions[index] = question;
        });
        
        roomData.numQuestions = selectedQuestions.length;

        if (selectedQuestions.length === 0) {
            alert("No questions found for the selected criteria. Please change the difficulty or source.");
            return;
        }

        await set(roomsRef, roomData);

        router.push(`/game?roomId=${roomId}`);
    };

    const joinRoom = async (roomId: string, userId: string) => {
        const playerRef = ref(db, `rooms/${roomId}/players/${userId}`);
        const snapshot = await get(playerRef);

        if (!snapshot.exists()) {
            await set(playerRef, { score: 0 });
        }
        router.push(`/game?roomId=${roomId}`);
    };

    const deleteRoom = (roomId: string) => {
        const data = get(ref(db, "rooms/" + roomId));
        data.then((snapshot) => {
            const roomData = snapshot.val();
            if (roomData && roomData.ogCreator == user?.uid!) {
                remove(ref(db, `/rooms/${roomId}`));
            } else {
                alert("You are not the creator of this room!")
            }
        });
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
                                    onChange={(e) => {setQuestionSource(e.target.value); setTopic("general ")+questionSource}}

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
                            
                            {/* New Time Limit Input */}
                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="time-limit">
                                    Time Limit (seconds)
                                </label>
                                <input
                                    type="number"
                                    id="time-limit"
                                    name="time-limit"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    min="5"
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
                            
                            <button
                                type="submit"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                            >
                                Create Room
                            </button>
                        </form>
                    </div>
                    <div className="w-2/3">
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
                                                <p className="text-lg-600 text-gray-600">Difficulty: Extremely hard</p>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                            <button
                                                onClick={() => joinRoom(room.id, user?.uid!)}
                                                className="text-white text-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5"
                                            >
                                                Join
                                            </button>
                                            <button
                                                onClick={() => deleteRoom(room.id)}
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Delete Room
                                            </button>
                                            </div>
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
