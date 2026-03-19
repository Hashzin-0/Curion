
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DatabaseService, JobVacancy } from '@/lib/services/database';
import { useStore } from '@/lib/store';
import { slugify, calcDuration } from '@/lib/utils';
import { generateTextEmbedding } from '@/ai/flows/generate-embedding-flow';
import { toast } from 'sonner';

/**
 * @fileOverview Hook principal do domínio Explore.
 * Implementa Busca Híbrida (Keywords + Semântica).
 */

export function useExplore() {
  const { currentUser, experiences, skills, areaSkills, areas } = useStore();
  const [view, setView] = useState<'candidates' | 'jobs' | 'map'>('candidates');
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword');
  const [searchQuery, setSearchQuery] = useState('');
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [realJobs, setRealJobs] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeRegime, setActiveRegime] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [activeVibe, setActiveVibe] = useState<string | null>(null);

  const loadData = useCallback(async () => {
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
    loadData();
  }, [loadData]);

  // Lógica de Busca Semântica
  const handleSemanticSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setIsLoading(true);
    try {
      // 1. Transformar a pergunta do usuário em um vetor
      const queryVector = await generateTextEmbedding(searchQuery);
      
      // 2. Buscar no Supabase via RPC (Similaridade de Vetores)
      const results = await DatabaseService.searchSemanticProfiles(queryVector);
      
      // 3. Mapear resultados (o RPC retorna dados básicos, mas precisamos das áreas para o card)
      // Em um app real, faríamos um JOIN no RPC, aqui vamos filtrar os perfis já carregados
      const matchedIds = results.map((r: any) => r.id);
      const filtered = publicUsers.filter(u => matchedIds.includes(u.id));
      
      setPublicUsers(filtered);
      toast.success(`IA encontrou ${results.length} talentos relacionados.`);
    } catch (err) {
      toast.error('Erro na busca inteligente. Tente por palavra-chave.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, publicUsers, loadData]);

  // Disparar busca ao mudar modo ou query
  useEffect(() => {
    if (searchMode === 'semantic') {
      const delay = setTimeout(handleSemanticSearch, 1000);
      return () => clearTimeout(delay);
    } else {
      loadData();
    }
  }, [searchMode, searchQuery, handleSemanticSearch, loadData]);

  // Contexto do perfil para o Match IA
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

  const filteredCandidates = useMemo(() => {
    if (searchMode === 'semantic') return publicUsers;
    return publicUsers.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [publicUsers, searchQuery, searchMode]);

  const filteredJobs = useMemo(() => {
    return realJobs.filter(j => {
      const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           j.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegime = !activeRegime || j.regime === activeRegime;
      const matchesModel = !activeModel || j.work_model === activeModel;
      const matchesVibe = !activeVibe || j.company_type === activeVibe;
      return matchesSearch && matchesRegime && matchesModel && matchesVibe;
    });
  }, [realJobs, searchQuery, activeRegime, activeModel, activeVibe]);

  return {
    view, setView,
    searchMode, setSearchMode,
    searchQuery, setSearchQuery,
    isLoading,
    filteredCandidates,
    filteredJobs,
    trendingSkills,
    geoDistribution,
    activeRegime, setActiveRegime,
    activeModel, setActiveModel,
    activeVibe, setActiveVibe,
    currentUser,
    profileContext,
    refresh: loadData
  };
}
