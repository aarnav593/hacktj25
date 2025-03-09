"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/auth";
import { usePathname } from "next/navigation"; 
import logo from "../logo.png";


export default function Navbar () {
    const [user] = useAuthState(auth);
    const pathname = usePathname(); 
    return (
      <nav className="border-zinc-200 bg-zinc-900 text-zinc-400">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
            <div className="flex gap-4">
              <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse ml-2">
                <Image src={logo}  alt="Bioblitz logo" width={50} height={50} />
              </Link>
              <div className="items-center justify-between w-full" id="navbar-user">
                <ul className="flex">
                  <li>
                    <Link href="/play" className="block py-2 px-3 text-zinc-400 my-auto text-large rounded-sm hover:text-zinc-100">Play</Link>
                  </li>
                  <li>
                    <Link href="/about" className="block py-2 px-3 text-zinc-400 my-auto text-large rounded-sm hover:text-zinc-100">About</Link>
                  </li>
                </ul>
              </div>
            </div>
            {
              user == null ? (
                <div className="flex">
                  <Link href="/login" className="block py-1 px-3 text-sm text-zinc-400 hover:text-zinc-100 rounded-xl">Log In</Link>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col text-xs">
                    <div className="text-white align-middle text-center">Welcome, </div>
                    <div className="text-white align-middle text-center">{user?.displayName!}!</div>
                  </div>
                  <Link href="/play" className="block text-zinc-400 rounded-sm">
                    <button
                      onClick={() => {
                        auth.signOut();
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
    );
}