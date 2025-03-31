import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MainProvider } from "@/context/index"
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LunarStakingYield",
  description: "月球主题的质押Dapp",
  icons:{
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MainProvider>
          {children}
        </MainProvider>
      </body>
    </html>
  );
}
