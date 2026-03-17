
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { MapPin, ArrowRight, Wand as Wand2, Loader as Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { ProfileTheme } from '@/src/ai/flows/generate-profile-theme-flow';
import { User, ProfessionalArea } from '@/lib/store';
import { Stats } from '@/components/Stats';
import { Timeline } from '@/components/Timeline';
import { generatePremiumTheme } from '@/lib/premium-themes';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import { PremiumCard3D } from '@/components/PremiumCard3D';
import { useQueryState } from 'nuqs';
import SimpleBar from 'simplebar-react';
import dynamic from 'next/dynamic';
import { getTheme } from '@/styles/themes';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type Props = {
  user: User;
  areas: ProfessionalArea[];
  isOwner?: boolean;
  onEditProfile?: () => void;
  onAddContent?: () => void;
  onEditArea?: (area: ProfessionalArea) => void;
  onDeleteArea?: (area: ProfessionalArea) => void;
  theme: ProfileTheme | null;
  isLoadingTheme: boolean;
  username: string;
};

function PremiumParticle({ emoji, x, size, speed, delay }: { 
  emoji: string; 
  x: number; 
  size: number; 
  speed: number; 
  delay: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: '110%' }}
      animate={{ 
        opacity: [0, 0.2, 0.2, 0],
        y: ['110%', '-20%'],
        x: [`${x}%`, `${x + (Math.random() * 10 - 5)}%`]
      }}
      transition={{ 
        duration: speed * 2.5, 
        repeat: Infinity, 
        ease: "linear", 
        delay: delay 
      }}
      className="absolute pointer-events-none select-none z-0"
      style={{
        left: `${x}%`,
        fontSize: `${size}px`,
      }}
    >
      {emoji}
    </motion.div>
  );
}

export function ThemedProfileLayout({
  user,
  areas,
  isOwner,
  onEditProfile,
  onAddContent,
  onEditArea,
  onDeleteArea,
  theme,
  isLoadingTheme,
  username,
}: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [showNotations, setShowNotations] = useState(false);
  const [areaFilter, setAreaFilter] = useQueryState('area');

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setShowNotations(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const mainArea = areas[0]?.name || "tecnologia";
  const premium = useMemo(() => generatePremiumTheme(user.name, mainArea), [user.name, mainArea]);

  const filteredAreas = useMemo(() => {
    if (!areaFilter) return areas;
    return areas.filter(a => a.slug === areaFilter);
  }, [areas, areaFilter]);

  // Emojis das áreas para o waterfall
  const waterfallEmojis = useMemo(() => {
    if (areas.length === 0) return premium.particles.map(p => p.emoji);
    return areas.map(a => getTheme(a.slug).emoji);
  }, [areas, premium.particles]);

  const heroBackground = premium.meshGradient;
  const accentColor = theme?.primaryHex || premium.palette.primary;
  const darkColor = theme?.darkHex || premium.palette.dark;
  const heroEmoji = theme?.heroEmoji || premium.heroEmoji;

  return (
    <SimpleBar style={{ maxHeight: '100vh' }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <LayoutGroup>
          <div
            className="relative overflow-hidden"
            style={{ background: heroBackground, minHeight: '520px' }}
          >
            {isMounted && Array.from({ length: 15 }).map((_, i) => (
              <PremiumParticle 
                key={i} 
                emoji={waterfallEmojis[i % waterfallEmojis.length]} 
                x={(i * 7.5) % 100} 
                size={20 + (i * 5) % 30} 
                speed={5 + (i * 2) % 10} 
                delay={i * 0.8} 
              />
            ))}

            <div className="absolute inset-0 bg-black/30 z-0" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-10">
              <PremiumCard3D>
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                  className="shrink-0 relative"
                >
                  <div
                    className="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] overflow-hidden relative"
                    style={{
                      border: `6px solid ${accentColor}`,
                      boxShadow: `0 25px 50px rgba(0,0,0,0.5)`,
                    }}
                  >
                    <Image
                      src={user.photo_url || `https://picsum.photos/seed/${user.id}/200/200`}
                      alt={user.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
                    className="absolute -bottom-2 -right-2 text-4xl bg-white dark:bg-slate-900 rounded-2xl w-14 h-14 flex items-center justify-center shadow-2xl border-2 border-slate-100 dark:border-slate-800"
                  >
                    {heroEmoji}
                  </motion.div>
                </motion.div>
              </PremiumCard3D>

              <div className="text-center md:text-left flex-1">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
                >
                  {isLoadingTheme ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      IA Sincronizada
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3 text-yellow-400" />
                      Premium {theme?.themeName || 'Portfolio'}
                    </>
                  )}
                </motion.div>

                <RoughNotationGroup show={showNotations}>
                  <motion.h1
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tighter"
                    style={{ textShadow: `0 10px 30px ${darkColor}` }}
                  >
                    <RoughNotation type="underline" color={accentColor} strokeWidth={4} padding={10}>
                      {user.name}
                    </RoughNotation>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-white/90 text-2xl font-bold mb-3 tracking-tight"
                  >
                    <RoughNotation type="box" color="white" strokeWidth={1} padding={4}>
                      {user.headline}
                    </RoughNotation>
                  </motion.p>
                </RoughNotationGroup>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center md:justify-start gap-5 flex-wrap"
                >
                  {user.location && (
                    <div className="flex items-center gap-2 text-white/70 text-sm font-bold bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-md">
                      <MapPin className="w-4 h-4 text-red-400" />
                      {user.location}
                    </div>
                  )}
                  {user.summary && (
                    <div
                      className="max-w-xl text-white/80 text-sm leading-relaxed border-l-4 pl-4 font-medium prose prose-sm prose-invert"
                      style={{ borderColor: accentColor }}
                      dangerouslySetInnerHTML={{ __html: user.summary }}
                    />
                  )}
                </motion.div>

                {isOwner && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-4 mt-8 justify-center md:justify-start"
                  >
                    <button
                      onClick={onEditProfile}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-105 shadow-xl"
                      style={{ backgroundColor: accentColor, backdropFilter: 'blur(8px)' }}
                    >
                      <LucideIcons.Pencil className="w-4 h-4" />
                      Editar Perfil
                    </button>
                    <Link
                      href="/resume"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-md border border-white/20"
                    >
                      <LucideIcons.FileText className="w-4 h-4" />
                      Criar Currículo
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">
            {/* 1. ÁREAS DE ATUAÇÃO (PRIORIDADE) */}
            <section>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4"
                  >
                    <span
                      className="w-3 h-10 rounded-full inline-block shadow-lg"
                      style={{ backgroundColor: accentColor }}
                    />
                    Áreas de Atuação
                  </motion.h2>
                  <div className="flex gap-2 mt-4 ml-7">
                    <button onClick={() => setAreaFilter(null)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!areaFilter ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Tudo</button>
                    {areas.map(a => (
                      <button key={a.id} onClick={() => setAreaFilter(a.slug)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${areaFilter === a.slug ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{a.name}</button>
                    ))}
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={onAddContent}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all hover:scale-105 shadow-xl"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Conteúdo
                  </button>
                )}
              </div>

              {filteredAreas.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white dark:bg-slate-900/50 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]"
                >
                  <p className="text-slate-500 dark:text-slate-400 text-xl font-black">Nenhum resultado para este filtro</p>
                  <button onClick={() => setAreaFilter(null)} className="mt-4 text-blue-600 font-bold underline">Limpar filtros</button>
                </motion.div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredAreas.map((area, i) => {
                      const Icon = (LucideIcons as any)[area.icon] || LucideIcons.Briefcase;
                      const areaEmoji = getTheme(area.slug).emoji;

                      return (
                        <motion.div
                          key={area.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative"
                        >
                          {isOwner && (
                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditArea?.(area); }}
                                className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteArea?.(area); }}
                                className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                          <Link href={`/${username}/${area.slug}`} className="block relative group h-full">
                            <div
                              className="relative overflow-hidden rounded-[2.5rem] p-8 h-full cursor-pointer transition-all duration-500 bg-white dark:bg-slate-900 shadow-sm group-hover:shadow-2xl border border-slate-100 dark:border-slate-800"
                              style={{ borderTop: `6px solid ${accentColor}` }}
                            >
                              <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-6">
                                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: accentColor }}>
                                    <Icon className="w-7 h-7" />
                                  </div>
                                  <span className="text-4xl filter drop-shadow-md group-hover:scale-125 transition-transform duration-500">
                                    {areaEmoji}
                                  </span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {area.name}
                                </h3>
                                <div className="mt-auto pt-6 flex items-center text-sm font-black transition-all gap-2" style={{ color: accentColor }}>
                                  <span className="tracking-widest uppercase text-[10px]">Acessar Currículo</span>
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-500" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </section>

            {/* 2. GRÁFICOS E ESTATÍSTICAS */}
            <section>
              <Stats userId={user.id} />
            </section>

            {/* 3. JORNADA PROFISSIONAL (TIMELINE) */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="pt-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
                <span className="w-3 h-10 rounded-full inline-block shadow-lg" style={{ backgroundColor: accentColor }} />
                Jornada Profissional
              </h2>
              <div className="bg-white dark:bg-slate-900/50 p-6 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <Timeline userId={user.id} readOnly={!isOwner} />
              </div>
            </motion.section>
          </div>
        </LayoutGroup>
      </div>
    </SimpleBar>
  );
}
