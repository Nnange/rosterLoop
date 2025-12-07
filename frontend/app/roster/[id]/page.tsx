'use client';
import { CleaningSchedule } from "@/app/components/CleaningSchedule";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import {use, useEffect, useState} from "react";
import { getHouseholdById } from "@/app/utils/api";


export default function RosterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [roommates, setRoommates] = useState<string[]>([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getHouseholdById(id);
                console.log('Fetched household data:', data);
                setRoommates(data.flatmateNames);
            } catch (error) {
                console.error('Error fetching household data:', error);
            }
        }
        fetchData();
    }, []);

  return (
    <>
        <Header />
        <CleaningSchedule roommates={roommates} />
        <Footer />
    </>
);
}

