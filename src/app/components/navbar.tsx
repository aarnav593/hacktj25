"use client";
import Link from "next/link";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "../../lib/firebaseConfig";
import { Logout } from "./auth";

export default function Navbar () {
    const [user] = useAuthState(auth);
    return (
        <nav className="border-zinc-200 bg-zinc-900 text-zinc-400">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
            <div className="flex gap-4">
              <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse ml-2">
                <span className="self-center text-xl whitespace-nowrap text-zinc-400">BioBlitz</span>
              </Link>
              <div className="items-center justify-between w-full" id="navbar-user">
                <ul className="flex">
                  <li>
                    <Link href="/play" className="block py-2 px-3 text-zinc-400 rounded-sm hover:text-zinc-100">Play</Link>
                  </li>
                  <li>
                    <Link href="/about" className="block py-2 px-3 text-zinc-400 rounded-sm hover:text-zinc-100">About</Link>
                  </li>
                </ul>
              </div>
            </div>
            {
              user == null ? (
                <div className="flex">
                  <Link href="/login" className="block py-2 px-3 text-zinc-400 rounded-sm">Log In</Link>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col text-xs">
                    <div className="text-white align-middle text-center">Welcome, </div>
                    <div className="text-white align-middle text-center">{user.displayName}!</div>
                  </div>
                  <Link href="/play" className="block text-zinc-400 rounded-sm">
                    <Logout />
                  </Link>
                </div>
              )
            }
          </div>
        </nav>
    )
}