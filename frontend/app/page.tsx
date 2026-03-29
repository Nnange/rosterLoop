"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { isAdmin } from "./utils/roleUtils";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

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
        // Regular users go to waiting page
        setRedirecting(true);
        router.push('/waiting');
      }
    }
  }, [user, loading, router]);

  if (loading || redirecting) {
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
