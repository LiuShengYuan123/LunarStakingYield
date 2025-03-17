'use client'
import Body from "@/components/Body";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="h-screen max-h-screen h-min-screen w-4/5 min-w-7xl mx-auto flex flex-col bg-[#FFFFFF] align-middle">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}
