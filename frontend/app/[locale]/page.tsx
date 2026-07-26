"use client"

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { isAdmin } from "@/app/utils/roleUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9092/rosterloop/api';

export default function Home() {
  const router = useRouter();
  const t = useTranslations("Common");
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
      setRedirecting(true);
      setMembershipChecked(true);
      router.push('/waiting');
      return;
    }

    try {
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

      if (response.ok) {
        const data = await response.json();
        setRedirecting(true);
        setMembershipChecked(true);
        if (data.hasMembership) {
          router.push('/households');
        } else {
          router.push('/waiting');
        }
      } else {
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
          <h1 className="text-2xl font-bold mb-4">{t('loading')}</h1>
        </div>
      </div>
    );
  }

  return null;
}
