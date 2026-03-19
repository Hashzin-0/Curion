
'use client';

import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { ThemedProfileLayout } from '@/components/ThemedProfileLayout';
import { ProfileTheme } from '@/ai/flows/generate-profile-theme-flow';
import { supabase } from '@/lib/supabase';
import { DatabaseService } from '@/lib/services/database';

export default function PublicProfile() {
  const { username } = useParams();
  const { users, areas, isLoading, currentUser } = useStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profileTheme, setProfileTheme] = useState<ProfileTheme | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchUser = useCallback(async () => {
    if (!username || !isMounted) return;
    setLoadingUser(true);
    
    // Tenta encontrar na store primeiro
    let found = users.find(u => u.username === username);
    
    // Se não estiver na store, busca no banco
    if (!found) {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();
        if (data) found = data;
      } catch (e) {
        console.error('Erro ao buscar usuário:', e);
      }
    }
    
    if (found) {
      setUser(found);
      
      // REGRA DE NEGÓCIO: Só grava a visualização se o visitante NÃO for o dono do perfil
      // Isso evita inflar métricas com visitas do próprio usuário
      if (currentUser?.id !== found.id) {
        DatabaseService.recordProfileView(found.id);
      }
    }
    
    setLoadingUser(false);
    
    // Redireciona se não encontrar após carregar
    if (!found && !isLoading && isMounted) {
      router.push('/');
    }
  }, [username, users, isMounted, isLoading, router, currentUser?.id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fetchTheme = useCallback(async () => {
    if (!user) return;
    setIsLoadingTheme(true);
    try {
      const userAreas = areas.filter(a => a.user_id === user.id);
      const res = await fetch('/api/profile/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          headline: user.headline,
          areas: userAreas.map(a => a.name),
        }),
      });
      if (res.ok) {
        const theme = await res.json();
        setProfileTheme(theme);
      }
    } catch (e) {
      console.error('Erro ao gerar tema:', e);
    } finally {
      setIsLoadingTheme(false);
    }
  }, [user, areas]);

  useEffect(() => {
    if (user) fetchTheme();
  }, [user, fetchTheme]);

  if (!isMounted || loadingUser || (isLoading && !user)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando perfil público...</p>
      </div>
    );
  }

  if (!user) return null;

  const userAreas = areas.filter(a => a.user_id === user.id);

  return (
    <ThemedProfileLayout
      user={user}
      areas={userAreas}
      isOwner={currentUser?.id === user.id}
      theme={profileTheme}
      isLoadingTheme={isLoadingTheme}
      username={user.username}
    />
  );
}
