'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DatabaseService, JobVacancy } from '@/lib/services/database';
import { useStore } from '@/lib/store';
import { calcDuration } from '@/lib/utils';
import { generateTextEmbedding } from '@/ai/flows/generate-embedding-flow';
import { parseSearchIntent } from '@/ai/flows/parse-search-intent-flow';
import { toast } from 'sonner';

/**
 * @fileOverview Hook principal do domínio Explore com Motor Unificado NER.
 * Implementa Busca Inteligente com Expansão de Query e Degradamento de Match.
 */

export function useExplore() {
  const { currentUser, experiences, skills, areaSkills, areas } = useStore();
  const [view, setView] = useState<'candidates' | 'jobs' | 'map'>('candidates');
  const [searchQuery, setSearchQuery] = useState('');
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [realJobs, setRealJobs] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeRegime, setActiveRegime] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profiles, jobs] = await Promise.all([
        DatabaseService.fetchPublicProfiles(),
        DatabaseService.fetchJobs()
      ]);
      setPublicUsers(profiles || []);
      setRealJobs(jobs || []);
    } catch (e) {
      console.error('Explore: Erro ao carregar dados', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /**
   * Motor Unificado de Busca Inteligente (NER + Vector)
   */
  const handleUnifiedSearch = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      loadInitialData();
      return;
    }

    setIsLoading(true);
    try {
      // 1. NER: Entender intenção e extrair filtros automáticos
      const intent = await parseSearchIntent(searchQuery);
      
      // 2. Vector: Gerar embedding da query expandida (melhor precisão)
      const queryVector = await generateTextEmbedding(intent.expandedQuery);
      
      // 3. Busca Híbrida em Paralelo
      const [userMatches, jobMatches] = await Promise.all([
        DatabaseService.searchSemanticProfiles(queryVector),
        DatabaseService.searchSemanticJobs(queryVector)
      ]);

      // 4. Mapear resultados (o RPC retorna IDs e similarity)
      // Cruzamos com os dados completos que já temos ou buscamos no momento
      const matchedUserIds = userMatches.map((r: any) => r.id);
      const filteredUsers = publicUsers
        .filter(u => matchedUserIds.includes(u.id))
        .sort((a, b) => {
          const simA = userMatches.find((r: any) => r.id === a.id)?.similarity || 0;
          const simB = userMatches.find((r: any) => r.id === b.id)?.similarity || 0;
          return simB - simA;
        });

      setPublicUsers(filteredUsers);
      setRealJobs(jobMatches as any[]);

      if (userMatches.length === 0 && jobMatches.length === 0) {
        toast.info('Nenhum resultado 100% compatível. Tente mudar os termos.');
      }
    } catch (err) {
      console.error('Unified Search Error:', err);
      toast.error('Falha no motor inteligente. Usando busca local...');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, publicUsers, loadInitialData]);

  // Debounce para não sobrecarregar a IA a cada tecla
  useEffect(() => {
    const delay = setTimeout(handleUnifiedSearch, 1500);
    return () => clearTimeout(delay);
  }, [searchQuery, handleUnifiedSearch]);

  const profileContext = useMemo(() => {
    if (!currentUser) return null;
    return {
      headline: currentUser.headline || '',
      summary: currentUser.summary || '',
      skills: areaSkills
        .filter(as => areas.some(a => a.id === as.area_id && a.user_id === currentUser.id))
        .map(as => skills.find(s => s.id === as.skill_id)?.name || '')
        .filter(Boolean),
      experiences: experiences
        .filter(e => e.user_id === currentUser.id)
        .map(e => `${e.role} na ${e.company_name} (${calcDuration(e.start_date, e.end_date)})`)
    };
  }, [currentUser, experiences, skills, areaSkills, areas]);

  const trendingSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    realJobs.forEach(job => {
      job.requirements?.forEach(req => {
        const normalized = req.trim().toLowerCase();
        if (normalized.length > 2 && normalized.length < 25) {
          counts[normalized] = (counts[normalized] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
  }, [realJobs]);

  const geoDistribution = useMemo(() => {
    const clusters: Record<string, { jobs: number, candidates: number, display: string }> = {};
    realJobs.forEach(j => {
      const loc = j.location || 'Remoto';
      if (!clusters[loc]) clusters[loc] = { jobs: 0, candidates: 0, display: loc };
      clusters[loc].jobs++;
    });
    publicUsers.forEach(u => {
      const loc = u.location || 'Remoto';
      if (!clusters[loc]) clusters[loc] = { jobs: 0, candidates: 0, display: loc };
      clusters[loc].candidates++;
    });
    return Object.values(clusters).sort((a, b) => (b.jobs + b.candidates) - (a.jobs + a.candidates));
  }, [realJobs, publicUsers]);

  const filteredCandidates = useMemo(() => publicUsers, [publicUsers]);

  const filteredJobs = useMemo(() => {
    return realJobs.filter(j => {
      const matchesRegime = !activeRegime || j.regime === activeRegime;
      const matchesModel = !activeModel || j.work_model === activeModel;
      return matchesRegime && matchesModel;
    });
  }, [realJobs, activeRegime, activeModel]);

  return {
    view, setView,
    searchQuery, setSearchQuery,
    isLoading,
    filteredCandidates,
    filteredJobs,
    trendingSkills,
    geoDistribution,
    activeRegime, setActiveRegime,
    activeModel, setActiveModel,
    currentUser,
    profileContext,
    refresh: loadInitialData
  };
}
