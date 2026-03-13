'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { MapPin, ArrowRight, Wand2, Loader2, Plus } from 'lucide-react';
import { ProfileTheme } from '@/src/ai/flows/generate-profile-theme-flow';
import { User, ProfessionalArea } from '@/lib/store';
import { Stats } from '@/components/Stats';
import { Timeline } from '@/components/Timeline';

type Props = {
  user: User;
  areas: ProfessionalArea[];
  isOwner?: boolean;
  onEditProfile?: () => void;
  onAddContent?: () => void;
  theme: ProfileTheme | null;
  isLoadingTheme: boolean;
  username: string;
};

function FloatingEmoji({ emoji, index }: { emoji: string; index: number }) {
  const positions = [
    { top: '8%', left: '5%' },
    { top: '15%', right: '8%' },
    { top: '40%', left: '2%' },
    { top: '55%', right: '4%' },
    { top: '75%', left: '10%' },
    { top: '80%', right: '12%' },
    { top: '25%', left: '45%' },
    { top: '65%', left: '50%' },
  ];
  const pos = positions[index % positions.length];
  const duration = 4 + (index * 0.7);
  const delay = index * 0.5;

  return (
    <motion.div
      className="absolute pointer-events-none select-none z-0"
      style={{ ...pos, fontSize: '2.5rem', opacity: 0.15 }}
      animate={{
        y: [0, -18, 0, 10, 0],
        rotate: [0, 8, -6, 4, 0],
        scale: [1, 1.08, 0.95, 1.04, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
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
  theme,
  isLoadingTheme,
  username,
}: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const heroStyle = theme
    ? {
        background: `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.gradientEnd} 100%)`,
      }
    : { background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' };

  const accentColor = theme?.primaryHex || '#3b82f6';
  const darkColor = theme?.darkHex || '#0f172a';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ─── HERO SECTION ─── */}
      <div
        className="relative overflow-hidden"
        style={{ ...heroStyle, minHeight: '480px' }}
      >
        {/* Floating emojis */}
        {isMounted && theme?.floatingEmojis?.map((emoji, i) => (
          <FloatingEmoji key={i} emoji={emoji} index={i} />
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
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="shrink-0 relative"
          >
            <div
              className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden relative"
              style={{
                border: `5px solid ${accentColor}`,
                boxShadow: `0 0 0 4px rgba(255,255,255,0.15), 0 20px 40px rgba(0,0,0,0.4)`,
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
            {theme?.heroEmoji && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
                className="absolute -bottom-2 -right-2 text-3xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
              >
                {theme.heroEmoji}
              </motion.div>
            )}
          </motion.div>

          {/* Text block */}
          <div className="text-center md:text-left flex-1">
            {/* Loading / Theme name badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
              style={{ backgroundColor: accentColor + '30', color: 'white', border: `1px solid ${accentColor}60` }}
            >
              {isLoadingTheme ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Gerando tema com IA...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3" />
                  {theme?.themeName || 'Perfil Profissional'}
                </>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight"
              style={{ textShadow: `2px 4px 20px ${darkColor}80` }}
            >
              {user.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white/80 text-xl font-bold mb-2"
            >
              {user.headline}
            </motion.p>

            {theme?.tagline && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 text-sm italic mb-4"
              >
                "{theme.tagline}"
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center md:justify-start gap-4 flex-wrap"
            >
              {user.location && (
                <div className="flex items-center gap-1.5 text-white/70 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </div>
              )}
              {user.summary && (
                <div
                  className="max-w-xl text-white/75 text-sm leading-relaxed border-l-2 pl-3"
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
                className="flex gap-3 mt-5 justify-center md:justify-start"
              >
                <button
                  onClick={onEditProfile}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ backgroundColor: accentColor + 'AA', backdropFilter: 'blur(8px)' }}
                >
                  <LucideIcons.Pencil className="w-3.5 h-3.5" />
                  Editar Perfil
                </button>
                <Link
                  href="/resume"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white/15 text-white hover:bg-white/25 transition-all hover:scale-105 backdrop-blur-sm"
                >
                  <LucideIcons.FileText className="w-3.5 h-3.5" />
                  Criar Currículo
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Wave bottom border */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 30C840 40 960 50 1080 50C1200 50 1320 40 1380 35L1440 30V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V60Z"
              className="fill-slate-50 dark:fill-slate-950"
            />
          </svg>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* Areas Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3"
              >
                <span
                  className="w-2 h-8 rounded-full inline-block"
                  style={{ backgroundColor: accentColor }}
                />
                Áreas de Atuação
              </motion.h2>
              <p className="text-slate-500 dark:text-slate-400 ml-5 text-sm">
                Selecione uma área para ver o currículo específico
              </p>
            </div>
            {isOwner && (
              <button
                onClick={onAddContent}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                <Plus className="w-4 h-4" />
                Adicionar Conteúdo
              </button>
            )}
          </div>

          {areas.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-slate-500 dark:text-slate-400 font-bold">Nenhuma experiência adicionada ainda</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Adicione suas experiências profissionais para começar</p>
              {isOwner && (
                <button
                  onClick={onAddContent}
                  className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Adicionar Experiência
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {areas.map((area, i) => {
                // @ts-ignore
                const Icon = LucideIcons[area.icon] || LucideIcons.Briefcase;
                const areaEmoji = theme?.areaEmojis?.[area.name] || null;

                return (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                  >
                    <Link href={`/${username}/${area.slug}`}>
                      <div
                        className="group relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl"
                        style={{
                          borderTop: `4px solid ${accentColor}`,
                        }}
                      >
                        {/* Background blob */}
                        <div
                          className="absolute top-0 right-0 w-28 h-28 -mr-10 -mt-10 rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500"
                          style={{ backgroundColor: accentColor }}
                        />

                        <div className="relative z-10">
                          {/* Icon + emoji */}
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                              style={{ backgroundColor: accentColor }}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            {areaEmoji && (
                              <span className="text-2xl">{areaEmoji}</span>
                            )}
                          </div>

                          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                            {area.name}
                          </h3>

                          <div
                            className="flex items-center text-sm font-bold transition-colors gap-1"
                            style={{ color: accentColor }}
                          >
                            Ver currículo
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-6">
            <span
              className="w-2 h-8 rounded-full inline-block"
              style={{ backgroundColor: accentColor }}
            />
            Estatísticas
          </h2>
          <Stats userId={user.id} />
        </motion.section>

        {/* Timeline Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-6">
            <span
              className="w-2 h-8 rounded-full inline-block"
              style={{ backgroundColor: accentColor }}
            />
            Linha do Tempo
          </h2>
          <Timeline userId={user.id} readOnly={!isOwner} />
        </motion.section>
      </div>
    </div>
  );
}
