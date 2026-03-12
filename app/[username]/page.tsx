'use client';

import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ProfileTheme } from '@/src/ai/flows/generate-profile-theme-flow';
import { ThemedProfileLayout } from '@/components/ThemedProfileLayout';

export default function PublicProfile() {
  const { username } = useParams();
  const { users, areas } = useStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [profileTheme, setProfileTheme] = useState<ProfileTheme | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const user = users.find(u => u.username === username);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.push('/');
    }
  }, [user, router, isMounted]);

  const fetchTheme = useCallback(async () => {
    if (!user) return;
    const cacheKey = `profile-theme-${user.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setProfileTheme(JSON.parse(cached)); return; } catch {}
    }
    setIsLoadingTheme(true);
    try {
      const res = await fetch('/api/profile/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          headline: user.headline,
          areas: areas.map(a => a.name),
        }),
      });
      if (res.ok) {
        const theme = await res.json();
        setProfileTheme(theme);
        localStorage.setItem(cacheKey, JSON.stringify(theme));
      }
    } catch (e) {
      console.error('Erro ao carregar tema:', e);
    } finally {
      setIsLoadingTheme(false);
    }
  }, [user, areas]);

  useEffect(() => {
    if (isMounted && user) fetchTheme();
  }, [isMounted, user, fetchTheme]);

  if (!isMounted || !user) return null;

  return (
    <ThemedProfileLayout
      user={user}
      areas={areas}
      isOwner={false}
      theme={profileTheme}
      isLoadingTheme={isLoadingTheme}
      username={String(username)}
    />
  );
}
