
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
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
    setIsProcessing(true);
    try {
      // 1. Atualiza o banco de dados
      await updateUser(editedProfile);
      
      // 2. Sincroniza o vetor de busca (Busca Semântica)
      const profileText = `${editedProfile.name} | ${editedProfile.headline} | ${editedProfile.summary}`;
      fetch('/api/profile/sync-embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editedProfile.id || currentUser?.id, text: profileText })
      }).catch(e => console.error('Erro ao sincronizar busca semântica:', e));

      // 3. Feedback imediato
      onDone();
      toast.success('Perfil atualizado!');
      
      // 4. Atualiza o tema
      fetchTheme();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Falha ao salvar alterações.');
    } finally {
      setIsProcessing(false);
    }
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
    try {
      await updateFn(data);
      onDone();
      toast.success(`${entityName} atualizado(a)!`);
    } catch (error) {
      toast.error(`Erro ao salvar ${entityName.toLowerCase()}.`);
    } finally {
      setIsProcessing(false);
    }
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

  const handleDeleteArea = createDeleteHandler(removeArea, 'Área');
  const handleDeleteEdu = createDeleteHandler(removeEducation, 'Formação');
  const handleDeletePort = createDeleteHandler(removePortfolioItem, 'Portfólio');
  const handleDeleteExp = createDeleteHandler(removeExperience, 'Experiência');

  return {
    currentUser, areas, education, portfolio, experiences,
    isProcessing, profileTheme, isLoadingTheme, copied,
    handleUpdateProfile, copyProfileLink,
    handleSaveEdu, handleSavePort, handleSaveExp, handleSaveArea,
    handleDeleteArea, handleDeleteEdu, handleDeletePort, handleDeleteExp
  };
}
