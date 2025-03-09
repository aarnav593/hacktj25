"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDatabase, ref, onValue } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/auth"; // Assuming auth is properly initialized

const db = getDatabase();

export default function GamePage() {
    const [user] = useAuthState(auth);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const router = useRouter();
    const roomId = new URLSearchParams(window.location.search).get("roomId") as string;

    // Fetch room data from Firebase
    useEffect(() => {
        const roomRef = ref(db, `rooms/${roomId}`);
        onValue(roomRef, (snapshot) => {
            const roomData = snapshot.val();
            if (roomData && roomData.Questions) {
                const questionArray = Object.values(roomData.Questions);
                setQuestions(questionArray);
            } else {
                setQuestions([]);
            }
        });
    }, [roomId]);

    const handleAnswerSelection = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleNextQuestion = () => {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelectedAnswer(null); // Reset selected answer for next question
    };

    if (!user) {
        return <div>You need to sign in to play the game!</div>;
    }

    // Handle game end when all questions are answered
    if (currentQuestionIndex >= questions.length) {
        return (
            <div>
                <h2>Game Over</h2>
                <p>You've completed all the questions!</p>
                <button onClick={() => router.push("/")}>Go to Home</button>
            </div>
        );
    }

    const question = questions[currentQuestionIndex];

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <h2 className="text-3xl text-center mb-6">{`Question ${currentQuestionIndex + 1}`}</h2>
            <p className="text-xl mb-4">{question.question}</p>

            <div className="mb-5">
                <div className="space-y-4">
                    {["a", "b", "c", "d", "e"].map((choice) => (
                        <button
                            key={choice}
                            onClick={() => handleAnswerSelection(choice)}
                            className={`w-full p-2.5 border rounded-lg text-white ${
                                selectedAnswer === choice
                                    ? "bg-blue-700"
                                    : "bg-gray-300 hover:bg-gray-400"
                            }`}
                        >
                            {question[choice]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-5">
                <button
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswer}
                    className="w-full p-2.5 bg-blue-700 text-white rounded-lg"
                >
                    Next Question
                </button>
            </div>
        </div>
    );
}