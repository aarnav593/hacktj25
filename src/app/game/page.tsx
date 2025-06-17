"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getDatabase, ref, onValue, update, set, get, serverTimestamp, goOnline, goOffline } from "firebase/database";
import { auth } from "../../lib/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";

const db = getDatabase();

const LeaderboardDisplay = ({ leaderboard, userId }: { leaderboard: any[], userId: string | undefined }) => (
    <div className="w-full bg-gray-50 p-4 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold mb-3 text-center text-gray-800">Leaderboard</h3>
        <ul className="space-y-2">
            {leaderboard.map((player: any, index: number) => (
                <li key={player.uid} className={`flex justify-between p-2 rounded-md text-sm ${player.uid === userId ? 'bg-blue-200 border-2 border-blue-500' : 'bg-gray-100'}`}>
                    <span className="font-semibold text-gray-700 truncate">{index + 1}. {player.name}</span>
                    <span className="font-mono font-medium text-gray-900">{player.score} pts</span>
                </li>
            ))}
            {leaderboard.length === 0 && <p className="text-center text-gray-500 text-sm">Waiting for players...</p>}
        </ul>
    </div>
);


const GamePageContent = () => {
    const [user] = useAuthState(auth);
    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId");

    const [room, setRoom] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [gameState, setGameState] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [lastQuestionStats, setLastQuestionStats] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isHost, setIsHost] = useState(false);
    const [playerHasAnswered, setPlayerHasAnswered] = useState<boolean>(false);

    useEffect(() => {
        if (!isHost || !room || !gameState || !questions.length) return;
        const gameLoop = () => {
            const updates: any = {};
            if (gameState.phase === 'waiting' || gameState.phase === 'intermission') {
                const nextIndex = gameState.phase === 'intermission' ? gameState.currentQuestionIndex + 1 : 0;
                if (nextIndex >= questions.length) {
                    updates[`rooms/${roomId}/gameState/phase`] = 'finished';
                    updates[`rooms/${roomId}/status`] = 'archived';
                    update(ref(db), updates);
                    return;
                }
                updates[`rooms/${roomId}/gameState`] = { currentQuestionIndex: nextIndex, phase: 'question', questionEndTime: Date.now() + room.timeLimit * 1000 };
                update(ref(db), updates);
            } else if (gameState.phase === 'question') {
                calculateScores();
                updates[`rooms/${roomId}/gameState`] = { ...gameState, phase: 'intermission', questionEndTime: Date.now() + 10000 };
                update(ref(db), updates);
            }
        };
        const timeUntilNextPhase = Math.max(0, (gameState.questionEndTime || 0) - Date.now());
        const timerId = setTimeout(gameLoop, timeUntilNextPhase);
        return () => clearTimeout(timerId);
    }, [isHost, gameState, room, questions, roomId]);

      useEffect(() => {
        if (!roomId || !user) return; 
        goOnline(db);

        const roomRef = ref(db, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const roomData = snapshot.val();
            if (!roomData) return;

            setRoom(roomData);
            setQuestions(roomData.Questions ? Object.values(roomData.Questions) : []);
            const board = roomData.leaderboard ? Object.values(roomData.leaderboard).sort((a: any, b: any) => b.score - a.score) : [];
            setLeaderboard(board);
            setIsHost(user.uid === roomData.host);

            setGameState((currentGameState: any) => {
                const newGameState = roomData.gameState;
                if (JSON.stringify(currentGameState) !== JSON.stringify(newGameState)) {
                    setPlayerHasAnswered(false);
                    return newGameState;
                }
                return currentGameState;
            });
        });

        return () => {
            unsubscribe();
            goOffline(db);
        };
    }, [roomId, user]);

    useEffect(() => {
        if (gameState && (gameState.phase === 'question' || gameState.phase === 'intermission')) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, Math.round(((gameState.questionEndTime || 0) - Date.now()) / 1000));
                setTimeLeft(remaining);
            }, 500);
            return () => clearInterval(interval);
        }
    }, [gameState]);
    
    const handleAnswerClick = (answer: string) => {
        if (!user || playerHasAnswered) return;
        setPlayerHasAnswered(true);
        const answerRef = ref(db, `rooms/${roomId}/answers/${gameState.currentQuestionIndex}/${user.uid}`);
        set(answerRef, { answer: answer, name: user.displayName, timestamp: serverTimestamp() });
    };
    
    const calculateScores = useCallback(async () => {
        if (!gameState || !questions || !leaderboard) return;
        const questionIndex = gameState.currentQuestionIndex;
        const currentQuestion = questions[questionIndex];
        if (!currentQuestion) return;
        const answersRef = ref(db, `rooms/${roomId}/answers/${questionIndex}`);
        const snapshot = await get(answersRef);
        const answersData = snapshot.val() || {};
        const correctAnswers = Object.entries(answersData)
            .filter(([, data]: [string, any]) => data.answer === currentQuestion.correct)
            .sort(([, a]: [string, any], [, b]: [string, any]) => a.timestamp - b.timestamp);
        const pointsToAward = correctAnswers.length;
        const updates: any = {};
        const stats: any[] = [];
        correctAnswers.forEach(([uid, data]: [string, any], index) => {
            const points = pointsToAward - index;
            const playerCurrentScore = (leaderboard.find((p: any) => p.uid === uid) || { score: 0 }).score;
            updates[`rooms/${roomId}/leaderboard/${uid}/score`] = playerCurrentScore + points;
            stats.push({ name: data.name, points });
        });
        setLastQuestionStats(stats);
        if (Object.keys(updates).length > 0) {
            await update(ref(db), updates);
        }
    }, [gameState, questions, leaderboard, roomId]);

    const startGame = () => {
        if (isHost && gameState.phase === 'waiting') {
            update(ref(db, `rooms/${roomId}/gameState`), { phase: 'intermission', questionEndTime: Date.now() });
        }
    };
    
    if (!room || !gameState) return <div className="text-center text-gray-700 text-2xl p-10">Loading Game...</div>;

    const myScore = (leaderboard.find((p: any) => p.uid === user?.uid) || { score: 0 }).score;
    const currentQuestion = questions[gameState.currentQuestionIndex];

    return (
         <div className="bg-white text-gray-900 min-h-screen p-4 md:p-6">
             <header className="w-full max-w-6xl mx-auto mb-6">
                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg border">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-600">{room.roomName}</h1>
                    <div className="text-right">
                        <p className="text-md text-gray-600">Your Score</p>
                        <p className="text-2xl font-bold text-green-600">{myScore}</p>
                    </div>
                </div>
            </header>
            
            <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
                <div className="flex-grow">
                    {gameState.phase === 'waiting' && (
                        <div className="text-center bg-gray-50 p-8 border">
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Waiting for players...</h2>
                            {isHost && <button onClick={startGame} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-2xl transition-transform transform hover:scale-105">Start Game</button>}
                        </div>
                    )}
                    {gameState.phase === 'question' && currentQuestion && (
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md border">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl text-gray-600">Question {gameState.currentQuestionIndex + 1} / {questions.length}</h3>
                                <div className="text-4xl font-mono bg-red-500 text-white px-4 py-1 rounded-lg shadow-inner">{timeLeft}</div>
                            </div>
                            <p className="text-2xl mb-6 text-gray-800">{currentQuestion.question}</p>
                            {!playerHasAnswered ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['a', 'b', 'c', 'd', 'e'].map(option => currentQuestion[option] && (
                                        <button key={option} onClick={() => handleAnswerClick(option)} className="p-4 rounded-lg text-left text-lg transition-all duration-200 w-full border-2 border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 shadow-sm">
                                            <span className="font-bold mr-2 text-blue-600">{option.toUpperCase()}.</span> {currentQuestion[option]}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-white rounded-lg border-2 border-dashed">
                                    <h3 className="text-2xl font-semibold text-gray-700">Answer Submitted!</h3>
                                    <p className="text-gray-500 mt-2">Waiting for the timer or other players...</p>
                                </div>
                            )}
                        </div>
                    )}
                    {gameState.phase === 'intermission' && currentQuestion && (
                        <div className="text-center bg-gray-50 p-8 rounded-lg border">
                            <h2 className="text-3xl font-bold mb-2 text-gray-800">Next question in {timeLeft}s...</h2>
                            <h3 className="text-xl mb-4 text-gray-600">Correct Answer: <span className="text-green-600 font-bold">{currentQuestion.correct.toUpperCase()}. {currentQuestion[currentQuestion.correct]}</span></h3>
                            <div>
                                <h4 className="text-2xl font-bold mb-2 text-blue-600">Question Results</h4>
                                {lastQuestionStats.length > 0 ? (
                                    lastQuestionStats.map(stat => ( <p key={stat.name} className="text-gray-700">{stat.name} earned +{stat.points} points!</p> ))
                                ) : <p className="text-gray-500">No one answered correctly.</p>}
                            </div>
                        </div>
                    )}
                    {gameState.phase === 'finished' && (
                        <div className="text-center bg-gray-50 p-8 rounded-lg border">
                            <h2 className="text-5xl font-bold text-green-600 mb-6">Game Over!</h2>
                            <h3 className="text-3xl font-bold mb-4 text-gray-800">See the final leaderboard on the right.</h3>
                            <Link href="/play" className="text-blue-600 hover:underline">Back to Lobby</Link>
                        </div>
                    )}
                </div>
                <div className="w-full md:w-1/4">
                    <LeaderboardDisplay leaderboard={leaderboard} userId={user?.uid} />
                </div>
            </main>
        </div>
    );
};

const GamePage = () => (
    <Suspense fallback={<div className="text-center text-gray-700 text-2xl p-10">Loading Room...</div>}>
        <GamePageContent />
    </Suspense>
);

export default GamePage;