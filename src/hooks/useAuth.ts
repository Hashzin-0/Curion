'use client';

import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";

export function useAuth() {
  const currentUser = useStore((state) => state.currentUser);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao iniciar login:", err);
      setIsLoggingIn(false);
    }
  };

  return { currentUser, isMounted, isLoggingIn, handleGoogleLogin };
}
