
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, Briefcase, Plus, ArrowRight, Sparkles, MapPin, 
  Loader2, BrainCircuit, Target, CheckCircle2, Info, X, Star, FileText,
  Globe, Laptop, Building2, Coffee, Zap, ThumbsUp, Flame, TrendingUp, Send
} from 'lucide-react';
import { DatabaseService, JobVacancy } from '@/lib/services/database';
import { getTheme } from '@/styles/themes';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { CreateJobModal } from '@/components/CreateJobModal';
import { useStore } from '@/lib/store';
import { slugify, calcDuration, cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * @fileOverview Página de Exploração com Match IA, Preview Rápido, Filtros Inteligentes, Trending Skills e Quick Apply.
 */

function StatusIndicator({ status }: { status?: string }) {
  if (!status || status === 'busy') return null;
  
  const colors = {
    searching: 'bg-emerald-500',
    open: 'bg-blue-500',
  };

  const labels = {
    searching: 'Buscando Oportunidades',
    open: 'Aberto a Propostas',
  };

  return (
    <div className="absolute -bottom-1 -right-1 z-10 flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-100 dark:border-slate-800">
      <div className={cn("w-2 h-2 rounded-full animate-pulse", colors[status as keyof typeof colors])} />
      <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{labels[status as keyof typeof labels]}</span>
    </div>
  );
}

function JobMatchBadge({ job, currentUser, profileContext }: { job: JobVacancy, currentUser: any, profileContext: any }) {
  const [match, setMatch] = useState<{ score: number; reason: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateMatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser || !profileContext) {
      toast.error('Complete seu perfil para calcular o match!');
      return;
    }

    setIsCalculating(true);
    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: profileContext,
          jobData: {
            title: job.title,
            description: job.description || '',
            requirements: job.requirements || []
          }
        })
      });
      
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMatch(data);
    } catch (err) {
      toast.error('Erro ao calcular match IA.');
    } finally {
      setIsCalculating(false);
    }
  };

  if (match) {
    const isHigh = match.score >= 80;
    const isMid = match.score >= 50 && match.score < 80;

    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${isHigh ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : isMid ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Target size={14} className="animate-pulse" />
            <span className="text-sm font-black uppercase tracking-tighter">{match.score}% Compatível</span>
          </div>
          <p className="text-[9px] font-bold uppercase leading-tight mt-0.5 opacity-80">{match.reason}</p>
        </div>
        {isHigh && <CheckCircle2 size={18} className="text-emerald-500" />}
      </motion.div>
    );
  }

  return (
    <button 
      onClick={handleCalculateMatch}
      disabled={isCalculating}
      className="group relative flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all active:scale-95 disabled:opacity-50"
    >
      {isCalculating ? (
        <>
          <Loader2 size={14} className="animate-spin text-indigo-600" />
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Analisando...</span>
        </>
      ) : (
        <>
          <BrainCircuit size={14} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Match IA</span>
        </>
      )}
    </button>
  );
}

export default function ExplorePage() {
  const { currentUser, experiences, skills, areaSkills, areas } = useStore();
  const [view, setView] = useState<'candidates' | 'jobs'>('candidates');
  const [searchQuery, setSearchQuery] = useState('');
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [realJobs, setRealJobs] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  
  const [activeRegime, setActiveRegime] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [activeVibe, setActiveVibe] = useState<string | null>(null);

  const [previewItem, setPreviewItem] = useState<{ type: 'candidate' | 'job', data: any } | null>(null);
  const previewTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Funcionalidade 6: Trending Skills Logic
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

  const filteredCandidates = publicUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJobs = realJobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         j.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegime = !activeRegime || j.regime === activeRegime;
    const matchesModel = !activeModel || j.work_model === activeModel;
    const matchesVibe = !activeVibe || j.company_type === activeVibe;

    return matchesSearch && matchesRegime && matchesModel && matchesVibe;
  });

  const handleMouseEnter = (type: 'candidate' | 'job', data: any) => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      setPreviewItem({ type, data });
    }, 400); 
  };

  const handleMouseLeave = () => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreviewItem(null);
  };

  // Funcionalidade 7: Quick Apply Logic
  const handleQuickApply = async (job: JobVacancy) => {
    if (!currentUser) {
      toast.error('Faça login para se candidatar com um clique!');
      return;
    }

    setIsApplying(job.id);
    
    // Grava conversão
    await DatabaseService.recordProfileView(currentUser.id, 'click_apply', { jobId: job.id, jobTitle: job.title });

    const profileUrl = `${window.location.origin}/${currentUser.username}`;
    const message = encodeURIComponent(
      `Olá! Vi sua vaga de "${job.title}" no Curion X e gostaria de me candidatar. ` +
      `Aqui está meu portfólio interativo e currículo atualizado: ${profileUrl}`
    );

    const contact = job.contact_info?.replace(/\D/g, '') || '';
    const isEmail = job.contact_info?.includes('@');

    setTimeout(() => {
      if (isEmail) {
        window.location.href = `mailto:${job.contact_info}?subject=Candidatura: ${job.title}&body=${message}`;
      } else {
        window.open(`https://wa.me/${contact}?text=${message}`, '_blank');
      }
      setIsApplying(null);
      toast.success('Candidatura iniciada!');
    }, 800);
  };

  const FilterPill = ({ label, active, onClick, icon: Icon }: any) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );

  const getTopSkills = (user: any) => {
    const allUserSkills: any[] = [];
    user.professional_areas?.forEach((area: any) => {
      area.area_skills?.forEach((as: any) => {
        if (as.skills?.name) {
          allUserSkills.push({
            name: as.skills.name,
            endorsements: as.endorsements_count || 0
          });
        }
      });
    });
    
    return allUserSkills
      .sort((a, b) => b.endorsements - a.endorsements)
      .slice(0, 3);
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
              onClick={() => { setView('candidates'); setPreviewItem(null); }}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${view === 'candidates' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'text-slate-400'}`}
            >
              <Users size={16} /> Candidatos
            </button>
            <button 
              onClick={() => { setView('jobs'); setPreviewItem(null); }}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${view === 'jobs' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <Briefcase size={16} /> Vagas
            </button>
          </div>
        </header>

        <div className="space-y-6">
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
              <div className="flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-900/50">
                  <Flame size={12} className="text-orange-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-widest">Em Alta:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSkills.map((skill, idx) => (
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
              ) : filteredCandidates.map((user) => {
                const topSkills = getTopSkills(user);
                return (
                  <Link 
                    key={user.id} 
                    href={`/${user.username}`} 
                    onMouseEnter={() => handleMouseEnter('candidate', user)}
                    onMouseLeave={handleMouseLeave}
                    className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col"
                  >
                    <div className="p-8 flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 shadow-sm">
                          <Image src={user.avatar_path || `https://picsum.photos/seed/${user.id}/100/100`} alt={user.name} fill className="object-cover" />
                          <StatusIndicator status={user.availability_status} />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.headline || 'Profissional'}</p>
                        </div>
                      </div>

                      {topSkills.length > 0 && (
                        <div className="mb-6 space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                            <Star size={10} className="text-yellow-500" /> Competências em Destaque
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {topSkills.map((skill, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase">{skill.name}</span>
                                {skill.endorsements > 0 && (
                                  <span className="flex items-center gap-0.5 text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-1 rounded">
                                    <ThumbsUp size={8} /> {skill.endorsements}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-6">
                        {user.professional_areas?.slice(0, 2).map((area: any) => {
                          const theme = getTheme(slugify(area.name));
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
                );
              })}
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
                  const theme = getTheme(job.area_slug || 'default');
                  const isCurrentApplying = isApplying === job.id;

                  return (
                    <div 
                      key={job.id} 
                      onMouseEnter={() => handleMouseEnter('job', job)}
                      onMouseLeave={handleMouseLeave}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0" style={{ backgroundColor: theme.hex + '15' }}>
                          {theme.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{job.title}</h3>
                            {currentUser && (
                              <JobMatchBadge job={job} currentUser={currentUser} profileContext={profileContext} />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="text-slate-600 dark:text-slate-300">{job.company}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px]">{job.work_model?.toUpperCase()}</span>
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded text-[9px]">{job.regime?.toUpperCase()}</span>
                            {job.salary && <span className="text-emerald-500">{job.salary}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button 
                          variant="primary" 
                          className="w-full md:w-auto px-10 relative overflow-hidden"
                          onClick={() => handleQuickApply(job)}
                          disabled={isCurrentApplying}
                        >
                          {isCurrentApplying ? (
                            <>
                              <Loader2 size={18} className="animate-spin mr-2" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send size={18} className="mr-2" />
                              Quick Apply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Nenhuma vaga encontrada para estes filtros.</p>
                  <button onClick={() => { setActiveRegime(null); setActiveModel(null); setActiveVibe(null); setSearchQuery(''); }} className="mt-4 text-blue-600 font-black text-xs uppercase hover:underline">Limpar Tudo</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="fixed bottom-10 right-10 z-[100] w-full max-w-sm hidden lg:block"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-900 dark:bg-white p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Info className="text-blue-500" size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white dark:text-slate-900">Preview Rápido</span>
                </div>
                <button onClick={handleMouseLeave} className="text-white/50 dark:text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {previewItem.type === 'candidate' ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md">
                        <Image src={previewItem.data.avatar_path || `https://picsum.photos/seed/${previewItem.data.id}/100/100`} alt="" fill className="object-cover" />
                        <StatusIndicator status={previewItem.data.availability_status} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{previewItem.data.name}</h4>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{previewItem.data.headline || 'Profissional'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                        <FileText size={12} /> Resumo
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4 italic">
                        "{previewItem.data.summary?.replace(/<[^>]*>/g, '') || 'Sem resumo disponível.'}"
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {previewItem.data.professional_areas?.map((a: any) => (
                        <span key={a.id} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-500">
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">{previewItem.data.title}</h4>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{previewItem.data.company}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                          <FileText size={12} /> Descrição da Vaga
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-5">
                          {previewItem.data.description || 'Sem descrição detalhada.'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                          <Star size={12} /> Requisitos Chave
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {previewItem.data.requirements?.slice(0, 5).map((req: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold uppercase">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-[0.2em]">Pressione para ver detalhes completos</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateJobModal 
        isOpen={isCreateJobOpen} 
        onClose={() => setIsCreateJobOpen(false)} 
        onRefresh={loadData}
      />
    </div>
  );
}
