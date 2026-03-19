
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

/**
 * @fileOverview Hook especializado para gerenciar o estado de cálculo do Match IA.
 */

export function useJobMatch(profileContext: any) {
  const [matchResults, setMatchResults] = useState<Record<string, { score: number; reason: string }>>({});
  const [isCalculating, setIsCalculating] = useState<string | null>(null);

  const calculateMatch = async (jobId: string, jobData: { title: string; description: string; requirements: string[] }) => {
    if (!profileContext) {
      toast.error('Complete seu perfil para calcular o match!');
      return;
    }

    setIsCalculating(jobId);
    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: profileContext,
          jobData
        })
      });
      
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMatchResults(prev => ({ ...prev, [jobId]: data }));
    } catch (err) {
      toast.error('Erro ao calcular match IA.');
    } finally {
      setIsCalculating(null);
    }
  };

  return { calculateMatch, matchResults, isCalculating };
}
