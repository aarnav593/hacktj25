"use client";
import { useState, useEffect, FormEvent } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDatabase, ref, onValue, set, get, remove, push } from "firebase/database";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {auth, googleProvider, signInWithPopup} from "../../lib/auth";

const db = getDatabase();

type Question = {
    question: string;
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    correct: string;
};

type RoomData = {
    roomName: string;
    source: string;
    numQuestions: number;
    timeLimit: number;
    ogCreator: string;
    difficulty: string;
    Questions: Record<number, Question>;
    players?: Record<string, { score: number }>;
};

export default function CreateRoom() {
    const [user] = useAuthState(auth);
    const [rooms, setRooms] = useState<{ id: string; roomName: string; source: string; numQuestions: number; timeLimit: number; difficulty: string; playerCount: number; }[]>([]);
    const [roomName, setRoomName] = useState("");
    const [questionSource, setQuestionSource] = useState("USA biology olympiad");
    const [diff, setDiff] = useState("easy");
    const [topic, setTopic] = useState("general " + questionSource);
    const [numQuestions, setNumQuestions] = useState(10);
    const [timeLimit, setTimeLimit] = useState(30);
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchCategory, setSearchCategory] = useState("roomName");
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [searchSource, setSearchSource] = useState("");
    const [searchTimeLimit, setSearchTimeLimit] = useState<number | ''>('');
    const [searchDifficulty, setSearchDifficulty] = useState("");
    const [sortBy, setSortBy] = useState<'recent' | 'mostPlayed'>('recent');

    useEffect(() => {
        const roomsRef = ref(db, "rooms");
        onValue(roomsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const roomArray = Object.keys(data).map((id) => ({
                    id,
                    ...data[id],
                    playerCount: data[id].players ? Object.keys(data[id].players).length : 0,
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

        const categoryRef = ref(db, `questions/${questionSource}/${diff}`);
        const snapshot = await get(categoryRef);
        const questionsInCategory = snapshot.val() ? Object.values(snapshot.val()) : [];
        let questionPool: Question[] = [...questionsInCategory as Question[]];

        if (questionPool.length < 1000 && topic) {
            const questionsToGenerate = Math.min(numQuestions, 1000 - questionPool.length);
            try {
                for (let i = 0; i < questionsToGenerate; i++) {
                    const response = await fetch('../api/ai', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ source: questionSource, difficulty: diff, topic: topic }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to generate question');
                    }

                    const newQuestion = await response.json();
                    const newQuestionRef = push(categoryRef);
                    await set(newQuestionRef, newQuestion);
                    questionPool.push(newQuestion);
                }
            } catch(error) {
                console.error("Error generating questions:", error);
                alert("There was an error generating new questions. Please try again.");
                return;
            }
        }

        if (questionPool.length < numQuestions) {
            alert(`Warning: Only ${questionPool.length} questions were found. The game will proceed with this smaller number.`);
        }

        const shuffledQuestions = questionPool.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffledQuestions.slice(0, Math.min(numQuestions, questionPool.length));

        if (selectedQuestions.length === 0) {
            alert("No questions found for the selected criteria. Please change the difficulty or source.");
            return;
        }

        const roomData: RoomData = {
            roomName,
            source: questionSource,
            numQuestions: selectedQuestions.length,
            timeLimit,
            ogCreator: user?.uid!,
            difficulty: diff,
            Questions: {}
        };

        selectedQuestions.forEach((question, index) => {
            roomData.Questions[index] = question;
        });

        const roomsRef = ref(db, "rooms/" + roomId);
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

    const processedRooms = rooms
        .filter(room => {
            if (searchQuery !== "") {
                if (searchCategory === "roomName" && !room.roomName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (searchCategory === "source" && !room.source.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            }

            if (showAdvancedSearch) {
                if (searchSource && room.source !== searchSource) return false;
                if (searchTimeLimit && room.timeLimit > searchTimeLimit) return false;
                if (searchDifficulty && room.difficulty !== searchDifficulty) return false;
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'mostPlayed') {
                return b.playerCount - a.playerCount;
            }
            // Default sort is 'recent'
            return parseInt(b.id) - parseInt(a.id);
        });

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
                                    Topic (for question generation)
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
                        { }
                        <div className="p-4 bg-gray-50 rounded-lg mb-4">
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                />
                                <select
                                    value={searchCategory}
                                    onChange={(e) => setSearchCategory(e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                >
                                    <option value="roomName">Room Name</option>
                                    <option value="source">Source</option>
                                </select>
                                <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100">
                                    {showAdvancedSearch ? 'Hide' : 'Advanced'}
                                </button>
                            </div>

                            {showAdvancedSearch && (
                                <div className="grid grid-cols-3 gap-4 p-4 border-t border-gray-200">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Source</label>
                                        <select onChange={(e) => setSearchSource(e.target.value)} value={searchSource} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                                            <option value="">All</option>
                                            <option value="USA biology olympiad">USABO</option>
                                            <option value="United states medical licensing exam">USMLE</option>
                                            <option value="national science bowl">NSB</option>
                                            <option value="medical college admissions test">MCAT</option>
                                            <option value="british biology olympiad">BBO</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Difficulty</label>
                                        <select onChange={(e) => setSearchDifficulty(e.target.value)} value={searchDifficulty} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5">
                                            <option value="">All</option>
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="difficult">Difficult</option>
                                            <option value="extremely difficult">Extremely Difficult</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Max Time Limit</label>
                                        <input type="number" placeholder="e.g., 60" value={searchTimeLimit} onChange={(e) => setSearchTimeLimit(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"/>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center gap-4 mt-2">
                                <button onClick={() => setSortBy('recent')} className={`px-4 py-2 text-sm font-medium rounded-lg ${sortBy === 'recent' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border'}`}>
                                    Most Recent
                                </button>
                                <button onClick={() => setSortBy('mostPlayed')} className={`px-4 py-2 text-sm font-medium rounded-lg ${sortBy === 'mostPlayed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border'}`}>
                                    Most Played
                                </button>
                            </div>
                        </div>

                        {processedRooms.length === 0 ? (
                            <p className="text-center text-gray-500">No rooms match your criteria. Create one!</p>
                        ) : (
                            <ul className="space-y-4">
                                {processedRooms.map((room) => (
                                    <li key={room.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-3xl font-semibold mb-2">{room.roomName}</h3>
                                                <p className="text-lg text-gray-600">Source: {room.source}</p>
                                                <p className="text-lg text-gray-600">Questions: {room.numQuestions}</p>
                                                <p className="text-lg text-gray-600 capitalize">Difficulty: {room.difficulty || 'Not specified'}</p>
                                                <p className="text-lg text-gray-600">Players: {room.playerCount}</p>
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