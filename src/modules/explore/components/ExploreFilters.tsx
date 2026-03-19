
'use client';

import { Search, Plus, Laptop, Globe, Building2, Flame, BrainCircuit, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Barra de filtros e busca do Explore.
 * Adicionado suporte ao seletor de Modo de Busca (Semântica vs Palavras-chave).
 */

export function ExploreFilters({ 
  searchQuery, setSearchQuery, 
  searchMode, setSearchMode,
  activeModel, setActiveModel, 
  activeRegime, setActiveRegime,
  trendingSkills,
  placeholder,
  showCreateButton,
  onCreateClick
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
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={searchMode === 'semantic' ? "Descreva o profissional ideal... (ex: Alguém que entenda de escala)" : placeholder}
              className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mr-2">Modo de Busca:</span>
            <button 
              onClick={() => setSearchMode('keyword')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                searchMode === 'keyword' ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Keyboard size={12} /> Palavras-chave
            </button>
            <button 
              onClick={() => setSearchMode('semantic')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2",
                searchMode === 'semantic' 
                  ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] animate-pulse" 
                  : "border-transparent text-slate-400 hover:border-indigo-100"
              )}
            >
              <BrainCircuit size={14} /> Inteligência IA (Contexto)
            </button>
          </div>
        </div>

        {showCreateButton && (
          <Button onClick={onCreateClick} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-16 rounded-3xl shrink-0">
            <Plus size={20} /> Publicar Vaga
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-2">Filtrar por:</span>
          <div className="flex flex-wrap gap-2">
            <FilterPill label="Remoto" active={activeModel === 'remoto'} onClick={() => setActiveModel(activeModel === 'remoto' ? null : 'remoto')} icon={Laptop} />
            <FilterPill label="Híbrido" active={activeModel === 'hibrido'} onClick={() => setActiveModel(activeModel === 'hibrido' ? null : 'hibrido')} icon={Globe} />
            <FilterPill label="Presencial" active={activeModel === 'presencial'} onClick={() => setActiveModel(activeModel === 'presencial' ? null : 'presencial')} icon={Building2} />
          </div>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
          <div className="flex flex-wrap gap-2">
            <FilterPill label="CLT" active={activeRegime === 'clt'} onClick={() => setActiveRegime(activeRegime === 'clt' ? null : 'clt')} />
            <FilterPill label="PJ" active={activeRegime === 'pj'} onClick={() => setActiveRegime(activeRegime === 'pj' ? null : 'pj')} />
            <FilterPill label="Estágio" active={activeRegime === 'estagio'} onClick={() => setActiveRegime(activeRegime === 'estagio' ? null : 'estagio')} />
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
