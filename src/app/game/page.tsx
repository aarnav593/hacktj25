"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation"; // Add this import
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "../../lib/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from 'next/link'

const db = getDatabase();

export default function GamePage() {
  const [user] = useAuthState(auth);
  const [questions, setQuestions] = useState<any[]>([]); // Store all the questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question
  const [showResult, setShowResult] = useState<string>(""); // Show the result (Correct or Incorrect)
  const searchParams = useSearchParams(); // Use this to get query parameters
  const roomId = searchParams.get("roomId"); // Get the roomId from the URL query
console.log(roomId);
  // Fetch room data from Firebase and load questions
  useEffect(() => {
    if (roomId) {
      const roomRef = ref(db, `rooms/${roomId}`);
      get(roomRef).then((snapshot) => {
        const roomData = snapshot.val();
        if (roomData && roomData.Questions) {
          const questionsArray = Object.values(roomData.Questions);
          setQuestions(questionsArray);
        }
      });
    }
  }, [roomId]);

  // Handle button click for checking answer
  const handleAnswerClick = (selectedAnswer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correct) {
      setShowResult("Correct!");
    } else {
      setShowResult("Incorrect!");
    }

    // Move to the next question after a delay (for user feedback)
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowResult(""); // Reset the result message
      } else {
        setShowResult("Quiz Finished!");
      }
    }, 1000);
  };

  if (!user) {
    return (
      <div>
        <div className="text-4xl text-center">You are not signed in!</div>
        <div className="text-lg text-center">
          To sign in, click here: <Link href="/login" className="underline">Login</Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto mt-10">
      {/* Display question */}
      <div className="mb-5 text-center">
        <p className="text-xl font-semibold mb-3">{currentQuestion.question}</p>
      </div>

      {/* Display answer choices */}
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => handleAnswerClick("a")}
          className="bg-blue-500 text-white rounded-lg px-5 py-2 hover:bg-blue-600"
        >
          {currentQuestion.a}
        </button>
        <button
          onClick={() => handleAnswerClick("b")}
          className="bg-blue-500 text-white rounded-lg px-5 py-2 hover:bg-blue-600"
        >
          {currentQuestion.b}
        </button>
        <button
          onClick={() => handleAnswerClick("c")}
          className="bg-blue-500 text-white rounded-lg px-5 py-2 hover:bg-blue-600"
        >
          {currentQuestion.c}
        </button>
        <button
          onClick={() => handleAnswerClick("d")}
          className="bg-blue-500 text-white rounded-lg px-5 py-2 hover:bg-blue-600"
        >
          {currentQuestion.d}
        </button>
        <button
          onClick={() => handleAnswerClick("e")}
          className="bg-blue-500 text-white rounded-lg px-5 py-2 hover:bg-blue-600"
        >
          {currentQuestion.e}
        </button>
      </div>

      {/* Display result message */}
      {showResult && (
        <div className="mt-4 text-center">
          <p className={`text-2xl ${showResult === "Correct!" ? "text-green-500" : "text-red-500"}`}>
            {showResult}
          </p>
        </div>
      )}

      {/* Display next question */}
      {currentQuestionIndex === questions.length - 1 && (
        <div className="mt-5 text-center">
          <p className="text-2xl font-semibold">Quiz Finished!</p>
        </div>
      )}
    </div>
  );
}