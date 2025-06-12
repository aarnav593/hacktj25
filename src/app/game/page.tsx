"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getDatabase, ref, get, update, remove } from "firebase/database";
import { auth } from "../../lib/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";

const db = getDatabase();
let stataFin = false;

export default function GamePage() {
  const [user] = useAuthState(auth);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResult, setShowResult] = useState<string>("");
  const [timer, setTimer] = useState(10);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  useEffect(() => {
    if (roomId) {
      const roomRef = ref(db, `rooms/${roomId}`);
      get(roomRef).then((snapshot) => {
        const roomData = snapshot.val();
        if (roomData && roomData.Questions) {
          setQuestions(Object.values(roomData.Questions));
        }
      });
    }
  }, [roomId]);

  useEffect(() => {
    if (questions.length > 0) {
      setTimer(20);
      const countdown = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            clearInterval(countdown);
            handleAnswerTimeout();
          }
          return prevTimer - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    if (roomId) {
      const leaderboardRef = ref(db, `rooms/${roomId}/leaderboard`);
      get(leaderboardRef).then((snapshot) => {
        if (snapshot.exists()) {
          setLeaderboard(Object.values(snapshot.val()));
        }
      });
    }
  }, [showResult]);

  const updateScore = (isCorrect: boolean) => {
    if (!user || !roomId) return;
    const playerRef = ref(db, `rooms/${roomId}/leaderboard/${user.uid}`);
    get(playerRef).then((snapshot) => {
      let currentScore = 0;
      if (snapshot.exists()) {
        currentScore = snapshot.val().score;
      }
      if (isCorrect) {
        update(playerRef, {
          name: user.displayName || "Unknown",
          score: currentScore + 1,
        });
      }
    });
  };

  const handleAnswerClick = (selectedAnswer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correct) {
      setShowResult("Correct!");
      updateScore(true);
    } else {
      setShowResult("Incorrect!");
      updateScore(false);
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, 1000);
  };

  const handleAnswerTimeout = () => {
    setShowResult("Time's Up! Incorrect!");
    updateScore(false);
    setTimeout(() => {
      moveToNextQuestion();
    }, 1000);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex <= questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setShowResult("");
    } else {
      setShowResult("");
      stataFin = true;
    }
  };
  

  const deleteRoom = () => {
    const data = get(ref(db, `rooms/${roomId}`));
    data.then((snapshot) => {
      const roomData = snapshot.val();
      if (roomData && roomData.ogCreator == user?.uid) {
        remove(ref(db, `/rooms/${roomId}`));
      } else {
        alert("You are not the creator of this room!");
      }
    });
    
  }

  const isCreator = async (): Promise<boolean> => {
    const snapshot = await get(ref(db, `rooms/${roomId}`));
    const roomData = snapshot.val();
    return roomData && roomData.ogCreator === user?.uid;
  };

  const [isCreatorState, setIsCreatorState] = useState(false);

  useEffect(() => {
    const checkCreator = async () => {
      const result = await isCreator();
      setIsCreatorState(result);
    };
    checkCreator();
  }, [roomId, user]);

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
  <div>
  {currentQuestion ? (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="mb-5 text-center">
        <p className="text-xl font-semibold mb-3">
          {currentQuestionIndex + 1}. {currentQuestion.question}
        </p>
        {   }
        {currentQuestion.image && (
          <div className="my-4">
            <img 
              src={currentQuestion.image} 
              alt="Question illustration" 
              className="max-w-full h-auto rounded-lg mx-auto" 
            />
          </div>
        )}
        <p className="text-lg font-bold text-red-500">
          Time Left: {timer}s
        </p>
      </div>
    </div>
  ) : (
    <p>Quiz Finished!</p>
    //Put leaderboard here
  )}

  {currentQuestion && (
    <div className="grid grid-cols-1 gap-4">
      {["a", "b", "c", "d", "e"].map((option) => (
        <button
          key={option}
          onClick={() => handleAnswerClick(option)}
          className="bg-blue-500 text-white rounded-lg px-5 py-2 hover:bg-blue-600"
        >
          {currentQuestion[option]}
        </button>
      ))}
    </div>
  )}

  {showResult && (
    <div className="mt-4 text-center">
      <p className={`text-2xl ${showResult.includes("Correct") ? "text-green-500" : "text-red-500"}`}>
        {showResult}
      </p>
    </div>
  )}

  {currentQuestionIndex > questions.length - 1 && (
    <div className="mt-5 text-center">
      <h2 className="text-xl font-bold mt-4">Leaderboard</h2>
      <ul className="mt-2">
        {leaderboard
          .sort((a, b) => b.score - a.score)
          .map((player, index) => (
            <li key={index} className="text-lg">
              {index + 1}. {player.name} - {player.score} pts
            </li>
          ))}
      </ul>
      <div className="mt-5">
        <Link href="/" className="bg-gray-500 text-white rounded-lg px-5 py-2 hover:bg-gray-600">
          Back to Main Page
        </Link>
        {isCreatorState ? (
          <button onClick={deleteRoom} className="bg-red-500 text-white rounded-lg px-5 py-2 hover:bg-gray-600">
            Delete room
          </button>
        ) : (
          null
        )}
      </div>
    </div>
  )}
</div>
  );
}

