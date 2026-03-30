"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { isAdmin } from "./utils/roleUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

export default function Home() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [membershipChecked, setMembershipChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setRedirecting(true);
        router.push('/login');
      } else if (isAdmin(user.role)) {
        // Admin users go to households list (can create/manage)
        setRedirecting(true);
        router.push('/households');
      } else {
        // Regular users - check if they're a household member
        checkMembershipStatus();
      }
    }
  }, [user, loading, router, token]);

  const checkMembershipStatus = async () => {
    if (!token) {
      console.log('No token available, redirecting to waiting');
      setRedirecting(true);
      setMembershipChecked(true);
      router.push('/waiting');
      return;
    }

    try {
      console.log('Checking membership status with token...');
      const response = await fetch(
        `${API_BASE_URL}/households/member/status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      );

      console.log('Membership status response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Membership data:', data);
        setRedirecting(true);
        setMembershipChecked(true);
        if (data.hasMembership) {
          console.log('User is a member, redirecting to households');
          router.push('/households');
        } else {
          console.log('User has no membership, redirecting to waiting');
          router.push('/waiting');
        }
      } else {
        console.log('Membership status check failed, response:', response.status);
        setRedirecting(true);
        setMembershipChecked(true);
        router.push('/waiting');
      }
    } catch (err) {
      console.error('Error checking membership:', err);
      setRedirecting(true);
      setMembershipChecked(true);
      router.push('/waiting');
    }
  };

  if (loading || redirecting || !membershipChecked) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return null;
}
