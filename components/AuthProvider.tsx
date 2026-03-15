'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useStore((state) => state.setUser);
  const syncUserWithDatabase = useStore((state) => state.syncUserWithDatabase);
  const setAuthReady = useStore((state) => state.setAuthReady);
  const router = useRouter();
  const pathname = usePathname();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const handleSync = async (user: any) => {
      if (user) {
        await syncUserWithDatabase({
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          name: user.user_metadata?.full_name || user.email || 'Usuário',
          photo_url: user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.id}/200/200`,
        });
      } else {
        setUser(null);
      }
      setAuthReady(true);
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSync(session?.user).then(() => {
        isInitialLoad.current = false;
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await handleSync(session.user);
          // Only redirect automatically if on the landing page during a login event
          if (pathname === '/' && event === 'SIGNED_IN') {
            router.push('/profile');
          }
        } else {
          setUser(null);
          setAuthReady(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, syncUserWithDatabase, setAuthReady, router, pathname]);

  return <>{children}</>;
}
