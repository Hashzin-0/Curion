
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DatabaseService, JobVacancy } from '@/lib/services/database';
import { User } from '@/lib/store';

/**
 * @fileOverview Hook especializado para gerenciar a ação de Quick Apply.
 */

export function useQuickApply(currentUser: User | null) {
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const apply = async (job: JobVacancy) => {
    if (!currentUser) {
      toast.error('Faça login para se candidatar com um clique!');
      return;
    }

    setIsApplying(job.id);
    
    // Grava evento de conversão
    await DatabaseService.recordProfileView(currentUser.id, 'click_apply', { jobId: job.id, jobTitle: job.title });

    const profileUrl = `${window.location.origin}/${currentUser.username}`;
    const message = encodeURIComponent(
      `Olá! Vi sua vaga de "${job.title}" no Curion X e gostaria de me candidatar. ` +
      `Aqui está meu portfólio interativo e currículo atualizado: ${profileUrl}`
    );

    const contact = job.contact_info?.replace(/\D/g, '') || '';
    const isEmail = job.contact_info?.includes('@');

    setTimeout(() => {
      if (isEmail) {
        window.location.href = `mailto:${job.contact_info}?subject=Candidatura: ${job.title}&body=${message}`;
      } else {
        window.open(`https://wa.me/${contact}?text=${message}`, '_blank');
      }
      setIsApplying(null);
      toast.success('Candidatura iniciada!');
    }, 800);
  };

  return { apply, isApplying };
}
