
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Componente de Avatar com efeito de brilho e partículas premium.
 */

type Status = 'searching' | 'open' | 'busy';

const CONFIG = {
  searching: { color: '#10b981', shadow: 'rgba(16, 185, 129, 0.4)' },
  open: { color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.4)' },
  busy: { color: '#64748b', shadow: 'rgba(100, 116, 139, 0.4)' },
};

function Sparkle({ color }: { color: string }) {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const duration = 2 + Math.random() * 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
        x: [`${randomX}%`, `${randomX + (Math.random() * 20 - 10)}%`],
        y: [`${randomY}%`, `${randomY + (Math.random() * 20 - 10)}%`]
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-1 h-1 rounded-full z-0"
      style={{ backgroundColor: color }}
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
  useEffect(() => setMounted(true), []);

  const config = CONFIG[status as keyof typeof CONFIG] || CONFIG.open;
  
  const borderSize = size === 'sm' ? 'border-2' : size === 'lg' ? 'border-4' : 'border-2';
  const padding = size === 'lg' ? 'p-1.5' : 'p-1';

  return (
    <div className={cn("relative group", className)}>
      {/* Glow de fundo pulsante */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 rounded-[inherit] blur-xl z-0"
        style={{ backgroundColor: config.shadow }}
      />

      {/* Partículas orbitais */}
      {mounted && (
        <div className="absolute inset-[-20%] z-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <Sparkle key={i} color={config.color} />
          ))}
        </div>
      )}

      {/* Container principal com borda rotativa simulada */}
      <div 
        className={cn(
          "relative z-10 rounded-[inherit] overflow-hidden",
          padding
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-0 opacity-40 group-hover:opacity-100 transition-opacity"
          style={{ 
            background: `conic-gradient(from 0deg, transparent, ${config.color}, transparent 40%, ${config.color}, transparent)` 
          }}
        />
        
        <div className="relative z-10 rounded-[inherit] bg-white dark:bg-slate-900 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
