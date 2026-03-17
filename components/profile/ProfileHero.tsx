
'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { MapPin, Wand as Wand2, Pencil, FileText } from 'lucide-react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import { PremiumCard3D } from '@/components/PremiumCard3D';
import { User } from '@/lib/store';
import { ProfileTheme } from '@/src/ai/flows/generate-profile-theme-flow';
import Link from 'next/link';

type Props = {
  user: User;
  theme: ProfileTheme | null;
  isOwner?: boolean;
  onEdit?: () => void;
  accentColor: string;
  darkColor: string;
};

export function ProfileHero({ user, theme, isOwner, onEdit, accentColor, darkColor }: Props) {
  return (
    <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-10">
      <PremiumCard3D>
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
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
              data-ai-hint="professional profile"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 text-4xl bg-white dark:bg-slate-900 rounded-2xl w-14 h-14 flex items-center justify-center shadow-2xl border-2 border-slate-100 dark:border-slate-800">
            {theme?.heroEmoji || '✨'}
          </div>
        </motion.div>
      </PremiumCard3D>

      <div className="text-center md:text-left flex-1">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 text-white border border-white/20 backdrop-blur-md">
          <Wand2 className="w-3 h-3 text-yellow-400" />
          {theme?.themeName || 'Premium Portfolio'}
        </div>

        <RoughNotationGroup show={true}>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tighter" style={{ textShadow: `0 10px 30px ${darkColor}` }}>
            <RoughNotation type="underline" color={accentColor} strokeWidth={4} padding={10}>
              {user.name}
            </RoughNotation>
          </h1>
          <p className="text-white/90 text-2xl font-bold mb-3 tracking-tight">
            <RoughNotation type="box" color="white" strokeWidth={1} padding={4}>
              {user.headline}
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
              dangerouslySetInnerHTML={{ __html: user.summary }}
            />
          )}
        </div>

        {isOwner && (
          <div className="flex gap-4 mt-8 justify-center md:justify-start">
            <button onClick={onEdit} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white shadow-xl hover:scale-105 transition-all" style={{ backgroundColor: accentColor }}>
              <Pencil className="w-4 h-4" /> Editar Perfil
            </button>
            <Link href="/resume" className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20 backdrop-blur-md">
              <FileText className="w-4 h-4" /> Criar Currículo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
