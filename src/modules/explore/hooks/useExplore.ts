
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DatabaseService, JobVacancy } from '@/lib/services/database';
import { useStore } from '@/lib/store';
import { slugify, calcDuration } from '@/lib/utils';

/**
 * @fileOverview Hook principal do domínio Explore.
 * Isola toda a lógica de busca, filtragem e processamento de dados.
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

  // Lógica de Trending Skills
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

  // Lógica de Distribuição Geográfica
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
    return publicUsers.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [publicUsers, searchQuery]);

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
