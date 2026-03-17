'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Loader2, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type Props = {
  text: string;
  accentColor?: string;
};

export function AudioBioPlayer({ text, accentColor = '#3b82f6' }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanText = text.replace(/<[^>]*>/g, '').trim();

  const handlePlay = async () => {
    if (status === 'playing') {
      audioRef.current?.pause();
      setStatus('paused');
      return;
    }

    if (status === 'paused' && audioRef.current) {
      audioRef.current.play();
      setStatus('playing');
      return;
    }

    if (!audioUrl) {
      setStatus('loading');
      try {
        const res = await fetch('/api/profile/audio-bio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText }),
        });
        const data = await res.json();
        if (data.audio) {
          setAudioUrl(data.audio);
          const audio = new Audio(data.audio);
          audioRef.current = audio;
          audio.onended = () => setStatus('idle');
          audio.play();
          setStatus('playing');
        } else {
          throw new Error('Falha ao obter áudio');
        }
      } catch (err) {
        toast.error('Não foi possível gerar a narração agora.');
        setStatus('idle');
      }
    } else if (audioRef.current) {
      audioRef.current.play();
      setStatus('playing');
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (!cleanText) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePlay}
        disabled={status === 'loading'}
        className="group relative flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all active:scale-95 disabled:opacity-50"
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
          style={{ backgroundColor: accentColor }}
        >
          {status === 'loading' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : status === 'playing' ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" className="ml-0.5" />
          )}
        </div>
        
        <div className="flex flex-col items-start pr-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Ouvir Resumo</span>
          <span className="text-[9px] font-bold text-white/40 uppercase">AI Narrator</span>
        </div>

        <AnimatePresence>
          {status === 'playing' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="flex gap-0.5 h-3 items-end"
            >
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 6, 12, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-0.5 bg-white rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
