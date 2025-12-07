"use client"

import Header from "./components/Header";
import { SetupForm } from "./components/SetupForm";
import Footer from "./components/Footer";
import { useRouter } from "next/navigation";
import { createHousehold } from "./utils/api";
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const router = useRouter();

  async function handleSetupComplete(flatmateNames: string[]): Promise<void> {
    let id = uuidv4();
    await createHousehold(id, flatmateNames);
    router.push(`/roster/${id}`);
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center pt-8 ">
      <Header />
      <SetupForm onComplete={handleSetupComplete} />
      <Footer />
    </div>
  );
}
