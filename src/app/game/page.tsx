"use client";

import { getDatabase, ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useSearchParams } from "next/navigation";

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
const db = getDatabase(app);

export default function GamePage() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId"); // Correct way to get query param

    const [roomData, setRoomData] = useState(null);
    const [userAnswer, setUserAnswer] = useState(""); // Store user input for the answer
    const [feedback, setFeedback] = useState(""); // Store feedback message

    useEffect(() => {
        if (!roomId) return; // Exit if roomId is null

        const roomRef = ref(db, `rooms/${roomId}`);

        // Fetch initial data
        const unsubscribe = onValue(roomRef, (snapshot) => {
            setRoomData(snapshot.val());
        });

        return () => unsubscribe(); // Cleanup listener when component unmounts
    }, [roomId]);

    const handleSubmitAnswer = () => {
        const questionData = roomData?.Questi; 
        const correctAnswer = Questi?.correct;

        // Check user's answer
        if (userAnswer.toLowerCase() === correctAnswer?.toLowerCase()) {
            setFeedback("Correct!");
        } else {
            setFeedback("Incorrect. Try again!");
        }

        // Optionally, clear the input after submission
        setUserAnswer("");
    };

    return (
        <div className="game-container">
            <header className="game-header">
                <h1 className="room-title">Room ID: {roomId}</h1>
            </header>
            <main className="game-main">
                {!roomData ? (
                    <p className="loading-message">Loading room data...</p>
                ) : (
                    <div className="room-data">
                        <h2>Room Data:</h2>
                        <pre className="room-data-json">{JSON.stringify(roomData, null, 2)}</pre>
                    </div>
                )}
                {/* Question and answer form */}
                {roomData && roomData.Questi && (
                    <div className="question-section">
                        <h2>Question: {roomData.Questi.question}</h2>
                        <div className="answer-options">
                            <button>{roomData.Questi.A}</button>
                            <button>{roomData.Questi.B}</button>
                            <button>{roomData.Questi.C}</button>
                            <button>{roomData.Questi.D}</button>
                            <button>{roomData.Questi.E}</button>
                        </div>
                       
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Enter your answer"
                            className="user-input"
                        />
                        {/* Submit button */}
                        <button onClick={handleSubmitAnswer} className="submit-btn">
                            Submit Answer
                        </button>
                        {/* Display feedback */}
                        {feedback && <p className="feedback-message">{feedback}</p>}
                    </div>
                )}
            </main>
        </div>
    );
    
}
