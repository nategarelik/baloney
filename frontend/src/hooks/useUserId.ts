"use client";

import { useState, useEffect } from "react";
import { DEMO_USER_ID } from "@/lib/constants";

const STORAGE_KEY = "baloney-user-id";

export function useUserId(): string {
  // Always start with DEMO_USER_ID to avoid SSR hydration mismatch,
  // then update from localStorage in useEffect (client-only)
  const [userId, setUserId] = useState(DEMO_USER_ID);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUserId(stored);
    } catch {}

    function handleReady(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.userId) {
        setUserId(detail.userId);
      }
    }
    window.addEventListener("baloney-userid-ready", handleReady);
    return () => window.removeEventListener("baloney-userid-ready", handleReady);
  }, []);

  return userId;
}
