"use client";
import Link from "next/link";
import Image from "next/image";

const user = localStorage.getItem('user');
let userObject = user ? JSON.parse(user) : null;
let userName = user ? JSON.parse(user).displayName : null;




export default function Navbar () {
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
              !localStorage.getItem('user') ? (
                <div className="flex">
                  <Link href="/login" className="block py-2 px-3 text-zinc-400 rounded-sm">Log In</Link>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col text-xs">
                    <div className="text-white align-middle text-center">Welcome, </div>
                    <div className="text-white align-middle text-center">{userName!}!</div>
                  </div>
                  <Link href="/play" className="block text-zinc-400 rounded-sm">
                    <button
                      onClick={() => {
                        localStorage.removeItem("user"); // Remove user
                        window.location.reload(); // Refresh to update UI
                      }}
                      className="block py-2 px-3 text-zinc-900 bg-red-500 rounded-sm hover:bg-red-700"
                    >
                      Log Out
                    </button>
                  </Link>
                </div>
              )
            }
          </div>
        </nav>
    )
}