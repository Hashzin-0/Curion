
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

/**
 * @fileOverview Componente de Avatar Evolutivo com Máquina de Estados.
 * Reage ao áudio e ao status do usuário com animações de alta fidelidade.
 */

type Status = 'searching' | 'open' | 'busy';

const CONFIG = {
  searching: { color: '#10b981', shadow: 'rgba(16, 185, 129, 0.4)', orbitSpeed: 3 },
  open: { color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.4)', orbitSpeed: 5 },
  busy: { color: '#64748b', shadow: 'rgba(100, 116, 139, 0.4)', orbitSpeed: 8 },
};

function Sparkle({ color, isPlaying }: { color: string; isPlaying: boolean }) {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const duration = isPlaying ? 1 + Math.random() : 3 + Math.random() * 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: isPlaying ? [0, 1.5, 0] : [0, 1, 0],
        x: [`${randomX}%`, `${randomX + (Math.random() * 40 - 20)}%`],
        y: [`${randomY}%`, `${randomY + (Math.random() * 40 - 20)}%`]
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-1 h-1 rounded-full z-0"
      style={{ backgroundColor: color, filter: isPlaying ? 'blur(1px)' : 'none' }}
    />
  );
}

export function AvatarGlow({ 
  children, 
  status = 'open', 
  className,
  size = 'md'
}: { 
  children: React.ReactNode; 
  status?: Status; 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [mounted, setMounted] = useState(false);
  const isPlaying = useStore(state => state.isAudioPlaying);
  
  useEffect(() => setMounted(true), []);

  const config = CONFIG[status as keyof typeof CONFIG] || CONFIG.open;
  const padding = size === 'lg' ? 'p-1.5' : 'p-1';

  return (
    <div className={cn("relative group", className)}>
      {/* 1. Glow de Fundo Evolutivo */}
      <motion.div
        animate={{ 
          scale: isPlaying ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: isPlaying ? [0.6, 0.9, 0.6] : [0.4, 0.7, 0.4],
          filter: isPlaying ? 'blur(30px)' : 'blur(20px)'
        }}
        transition={{ duration: isPlaying ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[-10%] rounded-[inherit] z-0"
        style={{ backgroundColor: config.shadow }}
      />

      {/* 2. Partículas Orbitais Reativas */}
      {mounted && (
        <div className="absolute inset-[-30%] z-0 pointer-events-none">
          {Array.from({ length: isPlaying ? 12 : 6 }).map((_, i) => (
            <Sparkle key={i} color={config.color} isPlaying={isPlaying} />
          ))}
        </div>
      )}

      {/* 3. Borda Rotativa Inteligente (Conic Gradient) */}
      <div 
        className={cn(
          "relative z-10 rounded-[inherit] overflow-hidden transition-all duration-500",
          padding,
          isPlaying ? "scale-105" : "scale-100"
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: isPlaying ? 2 : config.orbitSpeed, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute inset-0 z-0 opacity-40 group-hover:opacity-100 transition-opacity"
          style={{ 
            background: `conic-gradient(from 0deg, transparent, ${config.color}, transparent 30%, ${config.color}, transparent)` 
          }}
        />
        
        {/* 4. Container de Conteúdo com Efeito Glassmorphism Interno */}
        <div className="relative z-10 rounded-[inherit] bg-white dark:bg-slate-900 overflow-hidden shadow-inner">
          {children}
          
          {/* Overlay de Áudio Ativo */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none flex items-end justify-center pb-4"
              >
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-white rounded-full shadow-glow"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
