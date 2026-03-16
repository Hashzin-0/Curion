
'use client';

import { useState, useMemo } from 'react';
import { useStore, Skill } from '@/lib/store';
import fuzzysort from 'fuzzysort';
import { Search, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SkillSearch({ onAdd }: { onAdd: (skill: Skill) => void }) {
  const allSkills = useStore(state => state.skills);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query) return [];
    const sorted = fuzzysort.go(query, allSkills, { key: 'name', limit: 5 });
    return sorted.map(s => s.obj);
  }, [query, allSkills]);

  return (
    <div className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procure por habilidades (ex: React, Inglês...)"
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
        />
      </div>

      <AnimatePresence>
        {query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[80] overflow-hidden"
          >
            {results.length > 0 ? (
              results.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => { onAdd(skill); setQuery(''); }}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-200">{skill.name}</span>
                  <Plus size={16} className="text-blue-500" />
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Sparkles className="mx-auto mb-2 text-blue-500 opacity-50" />
                <p className="text-sm">Nenhuma habilidade encontrada.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
