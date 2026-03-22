'use client';

import { useEffect } from 'react';
import { useSiteBuilderStore } from '@/lib/stores/siteBuilderStore';
import { useStore } from '@/lib/store';
import { SiteBuilder } from '@/components/site/SiteBuilder';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditSitePage() {
  const router = useRouter();
  const { currentUser, isAuthReady } = useStore();
  const { loadSiteData, isLoading } = useSiteBuilderStore();

  useEffect(() => {
    if (isAuthReady && !currentUser) {
      router.push('/');
    }
  }, [isAuthReady, currentUser, router]);

  useEffect(() => {
    if (currentUser?.id) {
      loadSiteData(currentUser.id);
    }
  }, [currentUser?.id, loadSiteData]);

  if (!isAuthReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Carregando editor...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return <SiteBuilder onClose={() => router.push(`/${currentUser.username}`)} />;
}
