'use client';
import { CleaningSchedule } from "@/app/components/CleaningSchedule";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import {use, useEffect, useState} from "react";


export default function RosterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [roommates, setRoommates] = useState<string[]>([]);


    useEffect(() => {
        // Fetch roommates from localStorage or backend
        const storedRoommates = localStorage.getItem('roommates');
        if (storedRoommates) {
            setRoommates(JSON.parse(storedRoommates));
        } else {
            const roommatesName: string[] = ['Alice', 'Bob', 'Charlie']; // Default names
            setRoommates(roommatesName); 
        } 
    }, []);

  return (
    <>
        <Header />
        <CleaningSchedule roommates={roommates} />
        <Footer />
    </>
);
}

