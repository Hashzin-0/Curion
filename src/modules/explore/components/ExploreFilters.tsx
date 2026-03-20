'use client';

import { Search, Flame, BrainCircuit, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Barra de filtros simplificada para o Motor Unificado NER.
 */

export function ExploreFilters({ 
  searchQuery, setSearchQuery, 
  activeModel, setActiveModel, 
  activeRegime, setActiveRegime,
  trendingSkills,
  placeholder,
  showCreateButton,
  onCreateClick,
  isLoading
}: any) {
  const FilterPill = ({ label, active, onClick, icon: Icon }: any) => (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-slate-200'
      )}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-4">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="text-blue-500 animate-spin" size={20} />
              ) : (
                <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              )}
            </div>
            <input 
              type="text" 
              placeholder="Descreva o que procura... (ex: dev em SP que fale inglês)"
              className="w-full pl-14 pr-14 py-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <BrainCircuit size={14} className="text-blue-600 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">Motor Inteligente Ativo</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">O motor entende intenções, locais e competências automaticamente.</p>
          </div>
        </div>

        {showCreateButton && (
          <Button onClick={onCreateClick} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-16 rounded-3xl shrink-0">
            Publicar Vaga
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-2">Refinar manualmente:</span>
          <div className="flex flex-wrap gap-2">
            <FilterPill label="Remoto" active={activeModel === 'remoto'} onClick={() => setActiveModel(activeModel === 'remoto' ? null : 'remoto')} />
            <FilterPill label="Híbrido" active={activeModel === 'hibrido'} onClick={() => setActiveModel(activeModel === 'hibrido' ? null : 'hibrido')} />
            <FilterPill label="Presencial" active={activeModel === 'presencial'} onClick={() => setActiveModel(activeModel === 'presencial' ? null : 'presencial')} />
          </div>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
          <div className="flex flex-wrap gap-2">
            <FilterPill label="CLT" active={activeRegime === 'clt'} onClick={() => setActiveRegime(activeRegime === 'clt' ? null : 'clt')} />
            <FilterPill label="PJ" active={activeRegime === 'pj'} onClick={() => setActiveRegime(activeRegime === 'pj' ? null : 'pj')} />
          </div>
        </div>

        {trendingSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-900/50">
              <Flame size={12} className="text-orange-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-widest">Em Alta:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSkills.map((skill: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setSearchQuery(skill)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
