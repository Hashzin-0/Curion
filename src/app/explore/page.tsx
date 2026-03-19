'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Briefcase, Plus, ArrowRight, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { DatabaseService, JobVacancy } from '@/lib/services/database';
import { getTheme } from '@/styles/themes';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { CreateJobModal } from '@/components/CreateJobModal';
import { useStore } from '@/lib/store';

export default function ExplorePage() {
  const { currentUser } = useStore();
  const [view, setView] = useState<'candidates' | 'jobs'>('candidates');
  const [searchQuery, setSearchQuery] = useState('');
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [realJobs, setRealJobs] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

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
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCandidates = publicUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJobs = realJobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
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
          </div>
        </header>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={view === 'candidates' ? "Buscar por nome, cargo ou habilidade..." : "Buscar vagas, empresas ou áreas..."}
              className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {view === 'jobs' && currentUser && (
            <Button onClick={() => setIsCreateJobOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-16 rounded-3xl">
              <Plus size={20} /> Publicar Vaga
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {view === 'candidates' ? (
            <motion.div 
              key="candidates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />
                ))
              ) : filteredCandidates.map((user) => (
                <Link key={user.id} href={`/${user.username}`} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col">
                  <div className="p-8 flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-800">
                        <Image src={user.avatar_path || `https://picsum.photos/seed/${user.id}/100/100`} alt={user.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.headline || 'Profissional'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {user.areas?.slice(0, 2).map((area: any) => {
                        const theme = getTheme(area.slug);
                        return (
                          <span key={area.id} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: theme.hex + '15', color: theme.hex }}>
                            {theme.emoji} {area.name}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 italic">"{user.summary?.replace(/<[^>]*>/g, '').slice(0, 100)}..."</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 group-hover:gap-4 transition-all">
                      Ver Perfil Completo <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
                ))
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const theme = getTheme(job.area_slug);
                  return (
                    <div key={job.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner" style={{ backgroundColor: theme.hex + '15' }}>
                          {theme.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{job.title}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="text-slate-600 dark:text-slate-300">{job.company}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                            {job.salary && <span className="text-emerald-500">{job.salary}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <a href={`https://wa.me/${job.contact_info.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="flex-1 md:flex-none">
                           <Button variant="primary" className="w-full px-10">Candidatar-se</Button>
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Nenhuma vaga encontrada.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateJobModal 
        isOpen={isCreateJobOpen} 
        onClose={() => setIsCreateJobOpen(false)} 
        onRefresh={loadData}
      />
    </div>
  );
}
