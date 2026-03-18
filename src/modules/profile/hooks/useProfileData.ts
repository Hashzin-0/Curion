'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore, ProfessionalArea } from '@/lib/store';
import { toast } from 'sonner';
import { ProfileTheme } from '@/ai/flows/generate-profile-theme-flow';

export function useProfileData() {
  const { 
    currentUser, areas, education, portfolio, experiences,
    updateUser, updateArea, removeArea, updateEducation, removeEducation, 
    updatePortfolioItem, removePortfolioItem, updateExperience, removeExperience
  } = useStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileTheme, setProfileTheme] = useState<ProfileTheme | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTheme = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingTheme(true);
    try {
      const res = await fetch('/api/profile/theme', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          name: currentUser.name, 
          headline: currentUser.headline, 
          areas: areas.map(a => a.name) 
        }) 
      });
      if (res.ok) setProfileTheme(await res.json());
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoadingTheme(false); 
    }
  }, [currentUser, areas]);

  useEffect(() => { 
    if (currentUser) fetchTheme(); 
  }, [currentUser, fetchTheme]);

  const handleUpdateProfile = async (editedProfile: any, onDone: () => void) => {
    await updateUser(editedProfile);
    onDone();
    toast.success('Perfil atualizado!');
    fetchTheme();
  };

  const copyProfileLink = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(`${window.location.origin}/${currentUser.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copiado!');
  };

  const createSaveHandler = (updateFn: (data: any) => Promise<void>, entityName: string) => async (data: any, onDone: () => void) => {
    if (!data) return;
    setIsProcessing(true);
    await updateFn(data);
    setIsProcessing(false);
    onDone();
    toast.success(`${entityName} atualizado(a) com sucesso!`);
  };

  const handleSaveEdu = createSaveHandler(updateEducation, 'Formação');
  const handleSavePort = createSaveHandler(updatePortfolioItem, 'Portfólio');
  const handleSaveExp = createSaveHandler(updateExperience, 'Experiência');
  const handleSaveArea = createSaveHandler(updateArea, 'Área');

  const createDeleteHandler = (deleteFn: (id: string) => Promise<void>, entityName: string) => (id: string) => {
    if (confirm(`Excluir ${entityName.toLowerCase()}?`)) {
      deleteFn(id);
    }
  };

  const handleDeleteArea = createDeleteHandler(removeArea, 'Área e todas as suas experiências');
  const handleDeleteEdu = createDeleteHandler(removeEducation, 'Formação');
  const handleDeletePort = createDeleteHandler(removePortfolioItem, 'Item do portfólio');
  const handleDeleteExp = createDeleteHandler(removeExperience, 'Experiência');

  return {
    currentUser, areas, education, portfolio, experiences,
    isProcessing, profileTheme, isLoadingTheme, copied,
    handleUpdateProfile, copyProfileLink,
    handleSaveEdu, handleSavePort, handleSaveExp, handleSaveArea,
    handleDeleteArea, handleDeleteEdu, handleDeletePort, handleDeleteExp
  };
}