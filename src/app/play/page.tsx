"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "../../lib/firebaseConfig";
import 'firebase/firestore';
import Link from "next/link";
import { redirect } from 'next/navigation'

export default function Play() {
    const [user] = useAuthState(auth);

    const makeRoom = () => {
        console.log("making a room");
        redirect('/newroom')
    }

    return (
        <div>
            {(user) ? 
            <div className='flex flex-col items-center'>
                <button onClick={makeRoom}>
                    <div className='p-4 mt-10 text-center text-4xl w-96 rounded-lg bg-gray-200'>
                        Make a new room
                    </div>
                </button>
                
                {user?.displayName}
            </div>
            
            : 
            <Link href="/login">Link to login</Link>
            
            }
        </div>

    );
}