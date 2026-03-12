'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let subscription: any = null;

    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.push('/profile');
      } else {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            router.push('/profile');
          }
        });
        subscription = data.subscription;

        // Fallback to home if no session found
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    handleAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 dark:text-slate-400 font-medium">Autenticando...</p>
    </div>
  );
}
