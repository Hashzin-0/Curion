'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useStore((state) => state.setUser);
  const setAuthReady = useStore((state) => state.setAuthReady);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { user } = session;
        setUser({
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          name: user.user_metadata?.full_name || user.email || 'Usuário',
          photo_url: user.user_metadata?.avatar_url || 'https://picsum.photos/seed/user/200/200',
          headline: 'Profissional',
          summary: 'Bem-vindo ao seu perfil.',
          location: 'Brasil',
        });
      } else {
        setUser(null);
      }
      setAuthReady(true);
    };

    checkUser();

    // Listen for changes on auth state (login, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { user } = session;
          setUser({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            name: user.user_metadata?.full_name || user.email || 'Usuário',
            photo_url: user.user_metadata?.avatar_url || 'https://picsum.photos/seed/user/200/200',
            headline: 'Profissional',
            summary: 'Bem-vindo ao seu perfil.',
            location: 'Brasil',
          });
          
          if (pathname === '/login') {
            router.push('/');
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setAuthReady, router, pathname]);

  return <>{children}</>;
}
