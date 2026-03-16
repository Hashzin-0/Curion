'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { MapPin, ArrowRight, Wand as Wand2, Loader as Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { ProfileTheme } from '@/src/ai/flows/generate-profile-theme-flow';
import { User, ProfessionalArea } from '@/lib/store';
import { Stats } from '@/components/Stats';
import { Timeline } from '@/components/Timeline';
import { generatePremiumTheme } from '@/lib/premium-themes';

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

function PremiumParticle({ emoji, x, y, size, speed, delay }: { 
  emoji: string; 
  x: number; 
  y: number; 
  size: number; 
  speed: number; 
  delay: number 
}) {
  return (
    <div
      className="absolute pointer-events-none select-none z-0 animate-float-premium"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${size}px`,
        opacity: 0.15,
        animationDuration: `${speed}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {emoji}
    </div>
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determinar área principal para o tema premium
  const mainArea = areas[0]?.name || "tecnologia";
  
  // Gerar tema premium determinístico
  const premium = useMemo(() => generatePremiumTheme(user.name, mainArea), [user.name, mainArea]);

  // Combinar tema da IA com tema Premium (priorizando o visual premium para mesh e partículas)
  const heroBackground = premium.meshGradient;
  const accentColor = theme?.primaryHex || premium.palette.primary;
  const darkColor = theme?.darkHex || premium.palette.dark;
  const heroEmoji = theme?.heroEmoji || premium.heroEmoji;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ─── HERO SECTION ─── */}
      <div
        className="relative overflow-hidden"
        style={{ background: heroBackground, minHeight: '520px' }}
      >
        {/* Premium Animated Particles */}
        {isMounted && premium.particles.map((p, i) => (
          <PremiumParticle 
            key={i} 
            emoji={p.emoji} 
            x={p.x} 
            y={p.y} 
            size={p.size} 
            speed={p.speed} 
            delay={p.delay} 
          />
        ))}

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-10">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="shrink-0 relative"
          >
            <div
              className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden relative"
              style={{
                border: `6px solid ${accentColor}`,
                boxShadow: `0 0 0 6px rgba(255,255,255,0.1), 0 25px 50px rgba(0,0,0,0.5)`,
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
            {/* Hero emoji badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
              className="absolute -bottom-2 -right-2 text-4xl bg-white dark:bg-slate-900 rounded-full w-14 h-14 flex items-center justify-center shadow-2xl border-2 border-slate-100 dark:border-slate-800"
            >
              {heroEmoji}
            </motion.div>
          </motion.div>

          {/* Text block */}
          <div className="text-center md:text-left flex-1">
            {/* Status Badge */}
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
                  Sincronizando IA...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3 text-yellow-400" />
                  Premium {theme?.themeName || 'Portfolio'}
                </>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tighter"
              style={{ textShadow: `0 10px 30px ${darkColor}` }}
            >
              {user.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white/90 text-2xl font-bold mb-3 tracking-tight"
            >
              {user.headline}
            </motion.p>

            {theme?.tagline && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 text-base italic mb-6 max-w-lg"
              >
                "{theme.tagline}"
              </motion.p>
            )}

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
                  className="max-w-xl text-white/80 text-sm leading-relaxed border-l-4 pl-4 font-medium"
                  style={{ borderColor: accentColor }}
                >
                  {user.summary}
                </div>
              )}
            </motion.div>

            {/* Owner actions */}
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

        {/* Dynamic bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden line-height-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 70C840 80 960 100 1080 105C1200 110 1320 100 1380 95L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
              className="fill-slate-50 dark:fill-slate-950"
            />
          </svg>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">

        {/* Areas Section */}
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
              <p className="text-slate-500 dark:text-slate-400 ml-7 text-base font-medium">
                Explore meus currículos por especialidade
              </p>
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

          {areas.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/50 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] transition-all hover:border-slate-200 dark:hover:border-slate-700">
              <div className="text-7xl mb-6">📁</div>
              <p className="text-slate-500 dark:text-slate-400 text-xl font-black">Nenhuma experiência catalogada</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 max-w-sm mx-auto">Comece a construir seu portfólio adicionando suas primeiras vivências profissionais.</p>
              {isOwner && (
                <button
                  onClick={onAddContent}
                  className="mt-8 px-8 py-3 rounded-full text-sm font-black text-white shadow-lg transition-transform hover:scale-110"
                  style={{ backgroundColor: accentColor }}
                >
                  Cadastrar Experiência
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {areas.map((area, i) => {
                // @ts-ignore
                const Icon = LucideIcons[area.icon] || LucideIcons.Briefcase;
                const areaEmoji = theme?.areaEmojis?.[area.name] || premium.particles[i % premium.particles.length].emoji;

                return (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/${username}/${area.slug}`} className="block relative group h-full">
                      <div
                        className="relative overflow-hidden rounded-[2.5rem] p-8 h-full cursor-pointer transition-all duration-500 bg-white dark:bg-slate-900 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 border border-slate-100 dark:border-slate-800"
                        style={{
                          borderTop: `6px solid ${accentColor}`,
                        }}
                      >
                        {/* Background blob */}
                        <div
                          className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-5 group-hover:opacity-15 group-hover:scale-150 transition-all duration-700"
                          style={{ backgroundColor: accentColor }}
                        />

                        {/* Management Buttons (Only for Owner) */}
                        {isOwner && (
                          <div className="absolute top-6 right-6 flex gap-2 z-20">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEditArea?.(area);
                              }}
                              className="p-2.5 bg-slate-50/90 dark:bg-slate-800/90 rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm hover:scale-110 transition-all border border-slate-200 dark:border-slate-700"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDeleteArea?.(area);
                              }}
                              className="p-2.5 bg-slate-50/90 dark:bg-slate-800/90 rounded-2xl text-red-600 dark:text-red-400 shadow-sm hover:scale-110 transition-all border border-slate-200 dark:border-slate-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="relative z-10 flex flex-col h-full">
                          {/* Icon + emoji */}
                          <div className="flex items-center gap-4 mb-6">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl"
                              style={{ backgroundColor: accentColor }}
                            >
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
            </div>
          )}
        </section>

        {/* Stats Section with spacing */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-10"
        >
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
            <span
              className="w-3 h-10 rounded-full inline-block shadow-lg"
              style={{ backgroundColor: accentColor }}
            />
            Analytics de Carreira
          </h2>
          <div className="bg-white dark:bg-slate-900/50 p-6 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <Stats userId={user.id} />
          </div>
        </motion.section>

        {/* Timeline Section with spacing */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-10"
        >
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
            <span
              className="w-3 h-10 rounded-full inline-block shadow-lg"
              style={{ backgroundColor: accentColor }}
            />
            Jornada Profissional
          </h2>
          <div className="bg-white dark:bg-slate-900/50 p-6 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <Timeline userId={user.id} readOnly={!isOwner} />
          </div>
        </motion.section>
      </div>

      <footer className="mt-20 py-16 border-t border-slate-200 dark:border-slate-800 text-center bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-4">
            {user.name}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">
            © {new Date().getFullYear()} — CareerCanvas. Criado com inteligência.
          </p>
          <div className="flex justify-center gap-6 text-slate-400">
            {/* Links sociais fictícios ou Reais do user podem ir aqui */}
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <LucideIcons.Linkedin className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <LucideIcons.Github className="w-5 h-5" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
