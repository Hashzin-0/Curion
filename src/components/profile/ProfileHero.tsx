
'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Wand as Wand2, Pencil, FileUp, Sparkles, Mail, Headphones, Zap, MessageSquare, Moon, CreditCard } from 'lucide-react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import { PremiumCard3D } from '@/components/PremiumCard3D';
import { User, ProfessionalArea } from '@/lib/store';
import { ProfileTheme } from '@/ai/flows/generate-profile-theme-flow';
import { SmartExportModal } from '@/components/SmartExportModal';
import { CoverLetterModal } from '@/components/CoverLetterModal';
import { InterviewSimulatorModal } from '@/components/InterviewSimulatorModal';
import { DigitalWalletPass } from '@/components/profile/DigitalWalletPass';
import { AudioBioPlayer } from './AudioBioPlayer';
import { cn } from '@/lib/utils';
import { AvatarGlow } from '@/components/shared/AvatarGlow';

type Props = {
  user: User;
  theme: ProfileTheme | null;
  isOwner?: boolean;
  onEdit?: () => void;
  accentColor: string;
  darkColor: string;
  areas?: ProfessionalArea[];
};

function AvailabilityBadge({ status }: { status?: string }) {
  if (!status) return null;

  const configs = {
    searching: { icon: Zap, label: 'Buscando Oportunidades', color: 'emerald' },
    open: { icon: MessageSquare, label: 'Aberto a Propostas', color: 'blue' },
    busy: { icon: Moon, label: 'Não estou buscando', color: 'slate' },
  };

  const config = configs[status as keyof typeof configs] || configs.open;
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border backdrop-blur-md",
      `bg-${config.color}-500/10 text-${config.color}-400 border-${config.color}-500/20`
    )}>
      <Icon size={10} className="animate-pulse" />
      {config.label}
    </div>
  );
}

export function ProfileHero({ user, theme, isOwner, onEdit, accentColor, darkColor, areas = [] }: Props) {
  const [isSmartExportOpen, setIsSmartExportOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const mainArea = areas[0]?.name || "Geral";

  return (
    <>
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-10">
        <PremiumCard3D>
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            className="shrink-0 relative"
          >
            <AvatarGlow status={user.availability_status} size="lg" className="rounded-[2.5rem]">
              <div
                className="w-40 h-40 md:w-48 md:h-48 rounded-[2.2rem] overflow-hidden relative"
                style={{
                  boxShadow: `0 25px 50px rgba(0,0,0,0.5)`,
                }}
              >
                <Image
                  src={user.avatar_path || `https://picsum.photos/seed/${user.id}/200/200`}
                  alt={user.name || 'Profile'}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </AvatarGlow>
            <div className="absolute -bottom-2 -right-2 text-4xl bg-white dark:bg-slate-900 rounded-2xl w-14 h-14 flex items-center justify-center shadow-2xl border-2 border-slate-100 dark:border-slate-800 z-20">
              {theme?.heroEmoji || '✨'}
            </div>
          </motion.div>
        </PremiumCard3D>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 text-white border border-white/20 backdrop-blur-md">
              <Wand2 className="w-3 h-3 text-yellow-400" />
              {theme?.themeName || 'Premium Portfolio'}
            </div>
            <AvailabilityBadge status={user.availability_status} />
            {user.summary && (
              <AudioBioPlayer text={user.summary} accentColor={accentColor} />
            )}
          </div>

          <RoughNotationGroup show={true}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tighter" style={{ textShadow: `0 10px 30px ${darkColor}` }}>
              <RoughNotation type="underline" color={accentColor} strokeWidth={4} padding={10}>
                {user.name || 'Seu Nome'}
              </RoughNotation>
            </h1>
            <p className="text-white/90 text-2xl font-bold mb-3 tracking-tight">
              <RoughNotation type="box" color="white" strokeWidth={1} padding={4}>
                {user.headline || 'Profissional'}
              </RoughNotation>
            </p>
          </RoughNotationGroup>

          <div className="flex items-center justify-center md:justify-start gap-5 flex-wrap mt-6">
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
                dangerouslySetInnerHTML={{ __html: user.summary || '' }}
              />
            )}
          </div>

          <div className="flex gap-3 mt-8 justify-center md:justify-start flex-wrap">
            {isOwner && (
              <>
                <button onClick={onEdit} className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black text-white shadow-xl hover:scale-105 transition-all" style={{ backgroundColor: accentColor }}>
                  <Pencil className="w-4 h-4" /> Editar Perfil
                </button>
                <button onClick={() => setIsInterviewOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xl">
                  <Headphones className="w-4 h-4" /> Simular Entrevista
                </button>
                <button onClick={() => setIsSmartExportOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl">
                  <Sparkles className="w-4 h-4" /> Currículo IA
                </button>
                <button onClick={() => setIsCoverLetterOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xl">
                  <Mail className="w-4 h-4" /> Carta de Apresentação
                </button>
                <Link href="/import" className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-xl">
                  <FileUp className="w-4 h-4" /> Importar
                </Link>
              </>
            )}
            <button onClick={() => setIsWalletOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all shadow-xl backdrop-blur-md">
              <CreditCard className="w-4 h-4" /> Identidade Digital
            </button>
          </div>
        </div>
      </div>

      <SmartExportModal isOpen={isSmartExportOpen} onClose={() => setIsSmartExportOpen(false)} />
      <CoverLetterModal isOpen={isCoverLetterOpen} onClose={() => setIsCoverLetterOpen(false)} />
      <InterviewSimulatorModal isOpen={isInterviewOpen} onClose={() => setIsInterviewOpen(false)} areaName={mainArea} />
      <DigitalWalletPass user={user} isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} accentColor={accentColor} />
    </>
  );
}
