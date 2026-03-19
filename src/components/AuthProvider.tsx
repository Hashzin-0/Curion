'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

/**
 * @fileOverview Provedor de autenticação global.
 * Gerencia a sincronização da sessão do Supabase Auth com o estado do Zustand.
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useStore((state) => state.setUser);
  const syncUserWithDatabase = useStore((state) => state.syncUserWithDatabase);
  const setAuthReady = useStore((state) => state.setAuthReady);
  const router = useRouter();
  const pathname = usePathname();
  const syncInProgress = useRef(false);

  useEffect(() => {
    const handleSync = async (user: any) => {
      if (syncInProgress.current) return;
      
      if (user) {
        syncInProgress.current = true;
        try {
          // Mapeia avatar_url para avatar_path conforme schema public.users
          await syncUserWithDatabase({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            name: user.user_metadata?.full_name || user.email || 'Usuário',
            avatar_path: user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.id}/200/200`,
            email: user.email,
          });
        } catch (e) {
          console.error('AuthProvider: Falha na sincronização:', e);
        } finally {
          syncInProgress.current = false;
          setAuthReady(true);
        }
      } else {
        setUser(null);
        setAuthReady(true);
      }
    };

    // 1. Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSync(session?.user);
    });

    // 2. Ouvir mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          await handleSync(session?.user);
          
          if (pathname === '/' || pathname === '/login') {
            router.push('/profile');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAuthReady(true);
          if (pathname.startsWith('/profile')) {
            router.push('/');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, syncUserWithDatabase, setAuthReady, router, pathname]);

  return <>{children}</>;
}
