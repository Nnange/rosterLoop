"use client"

import Header from "./components/Header";
import { SetupForm } from "./components/SetupForm";
import { useState } from "react";
import { CleaningSchedule } from "./components/CleaningSchedule";
import Footer from "./components/Footer";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isSetup, setIsSetup] = useState(false);
  const [roommates, setRoommates] = useState<string[]>([]);
  const router = useRouter();

  function handleSetupComplete(names: string[]): void {
    setRoommates(names);
    setIsSetup(true);
    localStorage.setItem('roommates', JSON.stringify(names))
    router.push(`/roster/main-roster`);

    // TODO: Send data to backend 
  }

  function handleReset(): void {
    localStorage.removeItem('roommates');
    setRoommates([]);
    setIsSetup(false);
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center pt-8 ">
      <Header />
      <SetupForm onComplete={handleSetupComplete} />
      <Footer />
    </div>
  );
}
