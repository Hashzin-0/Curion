
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, Map as MapIcon, Loader2 } from 'lucide-react';
import { CreateJobModal } from '@/components/CreateJobModal';

// Domínio Modularizado
import { useExplore } from '@/modules/explore/hooks/useExplore';
import { useJobMatch } from '@/modules/explore/hooks/useJobMatch';
import { useQuickApply } from '@/modules/explore/hooks/useQuickApply';
import { ExploreFilters } from '@/modules/explore/components/ExploreFilters';
import { CandidateCard } from '@/modules/explore/components/CandidateCard';
import { JobCard } from '@/modules/explore/components/JobCard';
import { OpportunityMap } from '@/modules/explore/components/OpportunityMap';
import { QuickPreview } from '@/modules/explore/components/QuickPreview';

/**
 * @fileOverview Página Explorer orquestrada seguindo ai_rules.md.
 * Integrado suporte ao Motor de Busca Semântica (IA).
 */

export default function ExplorePage() {
  const {
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
    refresh
  } = useExplore();

  const { calculateMatch, matchResults, isCalculating: isMatchCalculating } = useJobMatch(profileContext);
  const { apply, isApplying } = useQuickApply(currentUser);
  
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: 'candidate' | 'job', data: any } | null>(null);
  const previewTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePreviewEnter = (type: 'candidate' | 'job', data: any) => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewItem({ type, data }), 400);
  };

  const handlePreviewLeave = () => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreviewItem(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              Explorar <span className="text-blue-600">Curion X</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Conectando talentos e oportunidades com inteligência.</p>
          </div>
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setView('candidates')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${view === 'candidates' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'text-slate-400'}`}
            >
              <Users size={16} /> Candidatos
            </button>
            <button 
              onClick={() => setView('jobs')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${view === 'jobs' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <Briefcase size={16} /> Vagas
            </button>
            <button 
              onClick={() => setView('map')}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${view === 'map' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <MapIcon size={16} /> Mapa
            </button>
          </div>
        </header>

        <ExploreFilters 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          activeModel={activeModel} setActiveModel={setActiveModel}
          activeRegime={activeRegime} setActiveRegime={setActiveRegime}
          trendingSkills={trendingSkills}
          placeholder={view === 'candidates' ? "Buscar por nome ou habilidade..." : "Buscar vagas, empresas ou locais..."}
          showCreateButton={view === 'jobs' && !!currentUser}
          onCreateClick={() => setIsCreateJobOpen(true)}
          isLoading={isLoading}
        />

        <AnimatePresence mode="wait">
          {view === 'candidates' && (
            <motion.div key="candidates" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />)
              ) : filteredCandidates.length > 0 ? (
                filteredCandidates.map(user => (
                  <CandidateCard 
                    key={user.id} user={user} 
                    onPreviewEnter={handlePreviewEnter} 
                    onPreviewLeave={handlePreviewLeave} 
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhum talento encontrado com este critério.</p>
                </div>
              )}
            </motion.div>
          )}

          {view === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />)
              ) : filteredJobs.map(job => (
                <JobCard 
                  key={job.id} job={job} 
                  match={matchResults[job.id]}
                  isMatchCalculating={isMatchCalculating === job.id}
                  onMatch={() => calculateMatch(job.id, { title: job.title, description: job.description || '', requirements: job.requirements || [] })}
                  onApply={apply}
                  isApplying={isApplying === job.id}
                  onPreviewEnter={handlePreviewEnter}
                  onPreviewLeave={handlePreviewLeave}
                />
              ))}
            </motion.div>
          )}

          {view === 'map' && (
            <OpportunityMap geoDistribution={geoDistribution} onSelectRegion={(loc: string) => { setSearchQuery(loc); setView('jobs'); }} />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {previewItem && <QuickPreview item={previewItem} onClose={() => setPreviewItem(null)} />}
      </AnimatePresence>

      <CreateJobModal isOpen={isCreateJobOpen} onClose={() => setIsCreateJobOpen(false)} onRefresh={refresh} />
    </div>
  );
}
