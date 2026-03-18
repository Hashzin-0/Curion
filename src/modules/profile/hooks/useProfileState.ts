'use client';

import { useState, useEffect } from 'react';
import { useStore, User, ProfessionalArea, Education, PortfolioItem, Experience } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function useProfileState() {
  const store = useStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'analytics'>('profile');
  const [editingArea, setEditingArea] = useState<ProfessionalArea | null>(null);
  const [areaForm, setAreaForm] = useState<Partial<ProfessionalArea>>({});
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [editingPort, setEditingPort] = useState<PortfolioItem | null>(null);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<User>>({});

  useEffect(() => {
    if (store.isAuthReady && !store.currentUser && !store.isLoading) router.push('/');
  }, [store.currentUser, store.isAuthReady, store.isLoading, router]);

  useEffect(() => {
    if (store.currentUser) {
      setEditedProfile({ 
        name: store.currentUser.name, 
        headline: store.currentUser.headline, 
        summary: store.currentUser.summary, 
        location: store.currentUser.location, 
        photo_url: store.currentUser.photo_url 
      });
    }
  }, [store.currentUser]);

  return {
    ...store,
    router,
    activeTab,
    setActiveTab,
    editingArea,
    setEditingArea,
    areaForm,
    setAreaForm,
    editingEdu,
    setEditingEdu,
    editingPort,
    setEditingPort,
    editingExp,
    setEditingExp,
    isAddingContent,
    setIsAddingContent,
    isEditingProfile,
    setIsEditingProfile,
    editedProfile,
    setEditedProfile
  };
}