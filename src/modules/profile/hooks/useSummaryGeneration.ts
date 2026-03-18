'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { generateProfessionalSummary } from '@/ai/flows/generate-summary-flow';
import { calcDuration } from '@/lib/utils';
import { toast } from 'sonner';

export function useSummaryGeneration() {
  const { currentUser, experiences, education, areaSkills, skills, areas } = useStore();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleGenerateSummary = useCallback(async (editedProfile: any, setEditedProfile: any) => {
    if (!currentUser) return;
    setIsGeneratingSummary(true);
    try {
      const userExps = experiences
        .filter(e => e.user_id === currentUser.id)
        .map(e => ({ 
          role: e.role, 
          company: e.company_name, 
          duration: calcDuration(e.start_date, e.end_date) 
        }));
      
      const userEdu = education
        .filter(e => e.user_id === currentUser.id)
        .map(e => ({ course: e.course, institution: e.institution }));

      const userSkills = areaSkills
        .filter(as => areas.some(a => a.id === as.area_id && a.user_id === currentUser.id))
        .map(as => skills.find(s => s.id === as.skill_id)?.name)
        .filter(Boolean) as string[];

      const result = await generateProfessionalSummary({ 
        name: editedProfile.name || currentUser.name, 
        headline: editedProfile.headline || currentUser.headline, 
        experiences: userExps, 
        skills: [...new Set(userSkills)],
        education: userEdu
      });
      
      setEditedProfile((prev: any) => ({ ...prev, summary: result.summary }));
      toast.info('Resumo gerado pela IA!');
    } catch (error) { 
      console.error('Erro ao gerar resumo:', error);
      toast.error('Erro ao processar resumo com IA.'); 
    } finally { 
      setIsGeneratingSummary(false); 
    }
  }, [currentUser, experiences, education, areaSkills, skills, areas]);

  return { isGeneratingSummary, handleGenerateSummary };
}