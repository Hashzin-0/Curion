
/**
 * @fileOverview Layout de perfil temático atualizado com suporte ao modo Career Orbit 3D.
 */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'motion/react';
import { Plus, ArrowRight, Briefcase, ChevronDown, Boxes, LayoutGrid } from 'lucide-react';
import { ProfileTheme } from '@/ai/flows/generate-profile-theme-flow';
import { User, ProfessionalArea, Education, PortfolioItem, Experience } from '@/lib/store';
import { Stats } from '@/components/Stats';
import { Timeline } from '@/components/Timeline';
import { generatePremiumTheme } from '@/lib/premium-themes';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { getTheme } from '@/styles/themes';
import { useStore } from '@/lib/store';
import { useQueryState } from 'nuqs';
import Link from 'next/link';
import { cn, slugify } from '@/lib/utils';
import { CardActions } from '@/components/shared/CardActions';
import { DatabaseService } from '@/lib/services/database';
import dynamic from 'next/dynamic';

// Sub-componentes modularizados
import { ProfileHero } from './profile/ProfileHero';
import { EducationSection, PortfolioSection } from './profile/ProfileSections';

// Importação dinâmica para evitar peso no bundle inicial e erros de SSR com Three.js
const CareerOrbit3D = dynamic(() => import('./profile/CareerOrbit3D').then(m => m.CareerOrbit3D), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-slate-900 animate-pulse rounded-[3rem] flex items-center justify-center text-white font-black uppercase text-xs tracking-widest">Inicializando Motor 3D...</div>
});

type Props = {
  user: User;
  areas: ProfessionalArea[];
  education?: Education[];
  portfolio?: PortfolioItem[];
  isOwner?: boolean;
  onEditProfile?: () => void;
  onAddContent?: () => void;
  onEditArea?: (area: ProfessionalArea) => void;
  onDeleteArea?: (id: string) => void;
  onEditEducation?: (edu: Education) => void;
  onDeleteEducation?: (id: string) => void;
  onEditPortfolio?: (item: PortfolioItem) => void;
  onDeletePortfolio?: (id: string) => void;
  onEditExperience?: (exp: Experience) => void;
  onDeleteExperience?: (id: string) => void;
  theme: ProfileTheme | null;
  isLoadingTheme: boolean;
  username: string;
};

function Particle({ emoji, x, size, speed, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: '110%' }}
      animate={{ 
        opacity: [0, 0.2, 0.2, 0],
        y: ['110%', '-20%'],
        x: [`${x}%`, `${x + (Math.random() * 10 - 5)}%`]
      }}
      transition={{ duration: speed * 2.5, repeat: Infinity, ease: "linear", delay }}
      className="absolute pointer-events-none select-none z-0"
      style={{ left: `${x}%`, fontSize: `${size}px` }}
    >
      {emoji}
    </motion.div>
  );
}

export function ThemedProfileLayout(props: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [areaFilter] = useQueryState('area');
  const { areaSkills, skills, experiences } = useStore();
  const [expandedExpId, setExpandedExpId] = useState<string | null>(null);
  const [is3DMode, setIs3DMode] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const mainAreaName = props.areas[0]?.name || "Tecnologia";
  const premium = useMemo(() => generatePremiumTheme(props.user.name || '', mainAreaName), [props.user.name, mainAreaName]);
  const accentColor = props.theme?.primaryHex || premium.palette.primary;
  
  const filteredAreas = useMemo(() => {
    if (!areaFilter) return props.areas;
    return props.areas.filter(a => slugify(a.name) === areaFilter);
  }, [props.areas, areaFilter]);

  const waterfallEmojis = useMemo(() => {
    if (props.areas.length === 0) return premium.particles.map(p => p.emoji);
    return props.areas.map(a => getTheme(slugify(a.name)).emoji);
  }, [props.areas, premium.particles]);

  const userAreaSkills = useMemo(() => {
    const validAreaIds = props.areas.map(a => a.id);
    return areaSkills.filter(as => validAreaIds.includes(as.area_id));
  }, [areaSkills, props.areas]);

  const userExperiences = useMemo(() => {
    return experiences.filter(e => e.user_id === props.user.id);
  }, [experiences, props.user.id]);

  const hasEducation = props.education && props.education.length > 0;
  const hasPortfolio = props.portfolio && props.portfolio.length > 0;
  const hasSkills = userAreaSkills.length > 0;
  const hasTimeline = userExperiences.length > 0 || hasEducation;

  const toggleExpand = (id: string) => {
    setExpandedExpId(expandedExpId === id ? null : id);
  };

  const handleTrackArea = (areaName: string) => {
    if (!props.isOwner) {
      DatabaseService.recordProfileView(props.user.id, 'view_area', { areaName });
    }
  };

  const handleTrackSkill = (skillName: string) => {
    if (!props.isOwner) {
      DatabaseService.recordProfileView(props.user.id, 'skill_hover', { skillName });
    }
  };

  return (
    <SimpleBar style={{ maxHeight: '100vh' }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <LayoutGroup>
          <div className="relative overflow-hidden" style={{ background: premium.meshGradient, minHeight: '520px' }}>
            {isMounted && Array.from({ length: 15 }).map((_, i) => (
              <Particle key={i} emoji={waterfallEmojis[i % waterfallEmojis.length]} x={(i * 7.5) % 100} size={20 + (i * 5) % 30} speed={5 + (i * 2) % 10} delay={i * 0.8} />
            ))}
            <div className="absolute inset-0 bg-black/30 z-0" />
            <ProfileHero 
              user={props.user} 
              theme={props.theme} 
              isOwner={props.isOwner} 
              onEdit={props.onEditProfile} 
              accentColor={accentColor} 
              darkColor={premium.palette.dark} 
              areas={props.areas}
            />
          </div>

          <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                  <span className="w-3 h-10 rounded-full inline-block shadow-lg" style={{ backgroundColor: accentColor }} />
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Áreas de Atuação</h2>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Explore o ecossistema profissional</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Toggle Mode 3D vs Grid */}
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={() => setIs3DMode(false)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2",
                        !is3DMode ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <LayoutGrid size={14} /> Grid
                    </button>
                    <button 
                      onClick={() => setIs3DMode(true)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2",
                        is3DMode ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <Boxes size={14} /> Career Orbit
                    </button>
                  </div>

                  {props.isOwner && (
                    <button onClick={props.onAddContent} className="px-6 py-3 rounded-2xl text-xs font-black text-white shadow-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-105 transition-all">
                      <Plus className="w-4 h-4 inline mr-2" /> Adicionar
                    </button>
                  )}
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {is3DMode ? (
                  <motion.div
                    key="3d-mode"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                  >
                    <CareerOrbit3D areas={props.areas} experiences={userExperiences} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid-mode"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    {props.areas.length > 0 ? (
                      filteredAreas.map((area) => {
                        const areaExps = userExperiences.filter(e => e.area_id === area.id);
                        const areaSlug = slugify(area.name);
                        const theme = getTheme(areaSlug);
                        
                        return (
                          <motion.div 
                            key={area.id} 
                            layout
                            className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col"
                          >
                            <div className="h-2 w-full" style={{ backgroundColor: area.theme_color || theme.hex }} />
                            
                            {props.isOwner && (
                              <CardActions 
                                onEdit={() => props.onEditArea?.(area)}
                                onDelete={() => props.onDeleteArea?.(area.id)}
                                variant="floating"
                              />
                            )}

                            <div className="p-8 flex flex-col h-full">
                              <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: area.theme_color || theme.hex }}>
                                    <Briefcase className="w-7 h-7" />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">{area.name}</h3>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{areaExps.length} Registro{areaExps.length !== 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                                <span className="text-4xl filter drop-shadow-md">{theme.emoji}</span>
                              </div>

                              <div className="space-y-3 mb-8 flex-1">
                                {areaExps.slice(0, 3).map((exp) => {
                                  const isExpanded = expandedExpId === exp.id;
                                  const hasDescription = !!exp.description && exp.description.replace(/<[^>]*>/g, '').trim().length > 0;

                                  return (
                                    <motion.div 
                                      key={exp.id} 
                                      layout
                                      className={cn(
                                        "w-full rounded-2xl transition-all border overflow-hidden relative group/item",
                                        isExpanded 
                                          ? "bg-slate-100/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-inner" 
                                          : "bg-slate-50 dark:bg-slate-800/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                      )}
                                    >
                                      {props.isOwner && (
                                        <CardActions 
                                          onEdit={() => props.onEditExperience?.(exp)}
                                          onDelete={() => props.onDeleteExperience?.(exp.id)}
                                          className="top-2 right-10"
                                          variant="small"
                                        />
                                      )}

                                      <button 
                                        onClick={() => hasDescription && toggleExpand(exp.id)}
                                        className={cn(
                                          "w-full flex items-center justify-between p-4 text-left transition-all",
                                          hasDescription ? "cursor-pointer" : "cursor-default"
                                        )}
                                      >
                                        <div className="flex flex-col">
                                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{exp.role}</span>
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.company_name}</span>
                                        </div>
                                        {hasDescription && (
                                          <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="text-slate-300 group-hover/item:text-blue-500"
                                          >
                                            <ChevronDown size={16} />
                                          </motion.div>
                                        )}
                                      </button>

                                      <AnimatePresence initial={false}>
                                        {isExpanded && hasDescription && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ 
                                              height: { type: "spring", stiffness: 400, damping: 30 },
                                              opacity: { duration: 0.2 }
                                            }}
                                            className="overflow-hidden"
                                          >
                                            <div className="px-4 pb-4 pt-2">
                                              <div 
                                                className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium prose prose-sm dark:prose-invert"
                                                dangerouslySetInnerHTML={{ __html: exp.description || '' }}
                                              />
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </motion.div>
                                  );
                                })}
                              </div>

                              <Link 
                                href={`/${props.username}/${areaSlug}`} 
                                onClick={() => handleTrackArea(area.name)}
                                className="mt-auto w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all hover:gap-4" 
                                style={{ backgroundColor: (area.theme_color || theme.hex) + '15', color: area.theme_color || theme.hex }}
                              >
                                Ver Portfólio da Área
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500 font-bold">Nenhuma área profissional definida.</p>
                        {props.isOwner && <p className="text-xs text-slate-400 mt-2">Adicione experiências para gerar áreas automaticamente.</p>}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {hasSkills && (
              <section>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
                  <span className="w-3 h-10 rounded-full inline-block shadow-lg" style={{ backgroundColor: '#3b82f6' }} />
                  Habilidades & Competências
                </h2>
                <div className="flex flex-wrap gap-3">
                  {userAreaSkills.map((as) => {
                    const skill = skills.find(s => s.id === as.skill_id);
                    const area = props.areas.find(a => a.id === as.area_id);
                    const theme = getTheme(slugify(area?.name || 'default'));
                    return (
                      <div 
                        key={`${as.area_id}-${as.skill_id}`} 
                        onMouseEnter={() => handleTrackSkill(skill?.name || '')}
                        className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-all hover:scale-105"
                      >
                        <span className="text-xl">{theme.emoji}</span>
                        <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">{skill?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {hasEducation && (
              <section>
                <EducationSection 
                  education={props.education || []} 
                  isOwner={props.isOwner} 
                  onEditEdu={props.onEditEducation} 
                  onDeleteEdu={props.onDeleteEducation} 
                />
              </section>
            )}

            {hasPortfolio && (
              <section>
                <PortfolioSection 
                  portfolio={props.portfolio || []} 
                  isOwner={props.isOwner} 
                  onEditPort={props.onEditPortfolio} 
                  onDeletePort={props.onDeletePortfolio} 
                />
              </section>
            )}

            {(userExperiences.length > 0 || hasSkills) && (
              <section><Stats userId={props.user.id} /></section>
            )}

            {hasTimeline && (
              <section><Timeline userId={props.user.id} readOnly={!props.isOwner} /></section>
            )}
          </div>
        </LayoutGroup>
      </div>
    </SimpleBar>
  );
}
