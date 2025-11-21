"use client"

import Image from "next/image";
import Header from "./components/Header";
import { SetupForm } from "./components/SetupForm";
import { useState } from "react";
import { CleaningSchedule } from "./components/CleaningSchedule";
import Footer from "./components/Footer";

export default function Home() {
  const [isSetup, setIsSetup] = useState(false);
  const [roommates, setRoommates] = useState<string[]>([]);

  function handleSetupComplete(names: string[]): void {
    setRoommates(names);
    setIsSetup(true);
    localStorage.setItem('roommates', JSON.stringify(names))
  }

  function handleReset(): void {
    localStorage.removeItem('roommates');
    setRoommates([]);
    setIsSetup(false);
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center pt-8 ">
      <Header />
      {!isSetup ? (
        <SetupForm onComplete={handleSetupComplete} />
      ) : (
        <>
          <CleaningSchedule roommates={roommates} />
          <div className="mt-8 text-center">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Reset Roster
            </button>
          </div>
        </>
      )
      }
      <Footer />
    </div>
  );
}
