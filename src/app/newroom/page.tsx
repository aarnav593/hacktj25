"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "../../lib/firebaseConfig";
import Form from "next/form";
import { FormEvent } from 'react'
import { getDatabase, ref, set } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';
import { redirect } from 'next/navigation';

export default function Navbar() {
    const [user] = useAuthState(auth);

    const makeRoom = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget)

        const roomName = formData.get("room-name") as string;
        const source = formData.get("question-source") as string;
        const numQuestions = formData.get("num-questions");
        const numPeople = formData.get("num-people");

        const db = getDatabase();
        set(ref(db, 'rooms/' + uuidv4()), {
            roomName: roomName,
            source: source,
            numQuestions: numQuestions,
            numPeople: numPeople
        });
        console.log('done');
        redirect("/play");
    }

    return (
        <>
            <div className="text-3xl text-center mt-10 mb-10">Make a new room</div>
            <Form action="/play"  onSubmit={makeRoom}  className="max-w-sm mx-auto">
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="room-name">
                        Room name
                    </label>
                    <input
                        type="text"
                        name="room-name"
                        id="room-name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="Enter room name"
                        required
                    />
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="question-source">
                        Question source
                    </label>
                    <select
                        id="question-source"
                        name="question-source"
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
                        Number of questions
                    </label>
                    <input
                        type="number"
                        id="num-questions"
                        name="num-questions"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        min="1"
                        required
                    />
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="num-people">
                        Number of people
                    </label>
                    <input
                        type="number"
                        id="num-people"
                        name="num-people"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        min="1"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                >
                    Submit
                </button>
            </Form>
        </>
    )
}