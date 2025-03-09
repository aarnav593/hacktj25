"use client";
import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";
import React, { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lato } from "next/font/google";
import Navbar from "./components/navbar";

const font = Lato({ weight: '400' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Navbar />
        {/* <div className="w-full flex justify-center items-center"> */}
          {/* <div className="w-8/9 pt-10 shadow-2xl"> */}
          {children}
          {/* </div> */}
        {/* </div> */}
      </body>
    </html>
    
  );
}