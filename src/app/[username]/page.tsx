'use client';

import { useStore } from '@/lib/store';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SiteRenderer } from '@/components/site/SiteRenderer';
import { useSiteBuilderStore } from '@/lib/stores/siteBuilderStore';
import { DatabaseService } from '@/lib/services/database';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/store';

export default function PublicProfile() {
  const { username } = useParams();
  const { currentUser } = useStore();
  const { loadSiteByUsername, isLoading, config } = useSiteBuilderStore();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!username || !isMounted) return;

    async function fetchUser() {
      setLoadingUser(true);
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();
        
        if (data) {
          setUser(data);
          
          if (currentUser?.id !== data.id) {
            DatabaseService.recordProfileView(data.id);
          }
        }
      } catch (e) {
        console.error('Erro ao buscar usuário:', e);
      }
      setLoadingUser(false);
    }

    fetchUser();
  }, [username, isMounted, currentUser?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSiteByUsername(username as string);
    }
  }, [user?.id, username, loadSiteByUsername]);

  if (!isMounted || loadingUser || isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Usuário não encontrado</h1>
        <p className="text-gray-500">Este perfil não existe ou foi removido.</p>
      </div>
    );
  }

  const isOwner = currentUser?.id === user.id;

  return (
    <SiteRenderer
      username={username as string}
      userId={user.id}
      userName={user.name}
      userAvatar={user.avatar_path}
      userHeadline={user.headline}
      userSummary={user.summary}
      userLocation={user.location}
      isOwner={isOwner}
    />
  );
}
