'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Página de Callback de Autenticação.
 * Captura o código da URL após o login com Google e aguarda a sessão.
 */

export default function AuthCallbackPage() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session && !hasRedirected.current) {
          hasRedirected.current = true;
          router.push('/profile');
        } else {
          // Caso a sessão demore a aparecer na URL (comum em SPAs), 
          // ouvimos a mudança de estado para capturá-la o mais rápido possível.
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session && !hasRedirected.current) {
              hasRedirected.current = true;
              router.push('/profile');
              subscription.unsubscribe();
            }
          });

          // Fallback de segurança: se após 5 segundos não houver sessão, volta para home
          setTimeout(() => {
            if (!hasRedirected.current) {
              console.warn('AuthCallback: Timeout atingido sem sessão detectada.');
              router.push('/');
            }
          }, 5000);
        }
      } catch (err) {
        console.error('Erro no callback de autenticação:', err);
        router.push('/login?error=auth_callback_failed');
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        </div>
      </div>
      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Finalizando Acesso</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm">Sincronizando seu portfólio inteligente...</p>
    </div>
  );
}
