"use client";
import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";
import React, { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lato } from "next/font/google";

const font = Lato({ weight: '400' });

const user = localStorage.getItem("user");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <nav className="border-zinc-200 bg-zinc-900">
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
              </div></div>
            <div>
              <div>
                {
                  !localStorage.getItem('user') ? (
                    <Link href="/login" className="block py-2 px-3 text-zinc-400 rounded-sm">Log In</Link>
                  ) : (
                    <Link href="/play" className="block py-2 px-3 text-zinc-400 rounded-sm">{}</Link>
                  )
                }


                <button
                  onClick={() => {
                    localStorage.removeItem("user"); // Remove user
                    window.location.reload(); // Refresh to update UI
                  }}
                  className="block py-2 px-3 text-zinc-900 bg-red-500 rounded-sm hover:bg-red-700"
                >
                  Log Out
                </button>

              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}