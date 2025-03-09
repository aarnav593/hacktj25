import "./globals.css";
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
        {children}
      </body>
    </html>
  );
}