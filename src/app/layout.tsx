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
      <body className={`${font.className} h-screen`}>
        <Navbar />
        <div className="w-full flex justify-center h-max pb-20">
          <div className="w-8/9 pt-10 h-max">
          {children}
          </div>
        </div>
      </body>
    </html>
    
  );
}