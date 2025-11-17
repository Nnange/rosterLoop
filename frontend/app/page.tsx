import Image from "next/image";
import Header from "./components/Header";
import { SetupForm } from "./components/SetupForm";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center ">
      <Header /> 
      <SetupForm  />
    </div>
  );
}
