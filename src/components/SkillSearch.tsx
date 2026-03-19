
'use client';

import { useState, useMemo } from 'react';
import { useStore, Skill } from '@/lib/store';
import fuzzysort from 'fuzzysort';
import { Search, Plus, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FixedSizeList as List } from 'react-window';

export function SkillSearch({ onAdd }: { onAdd: (skill: Skill) => void }) {
  const { skills: allSkills, isLoading } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query || !allSkills.length) return [];
    const sorted = fuzzysort.go(query, allSkills, { key: 'name', limit: 20 });
    return sorted.map(s => s.obj);
  }, [query, allSkills]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const skill = results[index];
    return (
      <button
        key={skill.id}
        style={style}
        onClick={() => { onAdd(skill); setQuery(''); }}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-50 dark:border-slate-800"
      >
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 dark:text-slate-200">{skill.name}</span>
        </div>
        <Plus size={16} className="text-blue-500" />
      </button>
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isLoading ? "Carregando biblioteca..." : "Procure por habilidades (ex: React, Inglês...)"}
          disabled={isLoading}
          className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all text-lg disabled:opacity-50"
        />
        {isLoading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-blue-500" size={20} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {query && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[100] overflow-hidden"
          >
            {results.length > 0 ? (
              <List
                height={Math.min(results.length * 64, 320)}
                itemCount={results.length}
                itemSize={64}
                width="100%"
              >
                {Row}
              </List>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Sparkles className="mx-auto mb-4 text-blue-500 opacity-50" size={32} />
                <p className="text-sm font-bold">Nenhuma habilidade encontrada.</p>
                <p className="text-xs mt-1">Tente termos mais genéricos ou verifique se o banco de dados está populado.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
