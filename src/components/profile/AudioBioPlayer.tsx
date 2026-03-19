
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';

type Props = {
  text: string;
  accentColor?: string;
  userId?: string;
};

export function AudioBioPlayer({ text, accentColor = '#3b82f6', userId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isNativeFallback, setIsNativeFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isTransitioning = useRef(false);
  
  const { currentUser, setIsAudioPlaying } = useStore();
  const cleanText = text.replace(/<[^>]*>/g, '').trim();

  // Sincroniza estado global de reprodução
  useEffect(() => {
    setIsAudioPlaying(status === 'playing');
  }, [status, setIsAudioPlaying]);

  // Reset player when text changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setAudioUrl(null);
    setStatus('idle');
    setIsNativeFallback(false);
  }, [text]);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onplay = null;
      audioRef.current.onpause = null;
      audioRef.current.onerror = null;
    }
  }, []);

  const setupAudio = useCallback((url: string) => {
    cleanupAudio();
    const audio = new Audio(url);
    
    audio.onplay = () => setStatus('playing');
    audio.onpause = () => setStatus('paused');
    audio.onended = () => setStatus('idle');
    audio.onerror = () => {
      console.warn('AudioBioPlayer: Erro no arquivo remoto, tentando fallback nativo...');
      handleNativeSpeak();
    };

    audioRef.current = audio;
    return audio;
  }, [cleanupAudio]);

  const handleNativeSpeak = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Navegador não suporta voz nativa.');
      return;
    }

    if (status === 'playing' && isNativeFallback) {
      window.speechSynthesis.cancel();
      setStatus('idle');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setStatus('playing');
      setIsNativeFallback(true);
    };
    utterance.onend = () => {
      setStatus('idle');
      setIsNativeFallback(false);
    };
    utterance.onerror = () => setStatus('idle');

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = async () => {
    if (isTransitioning.current || status === 'loading') return;
    isTransitioning.current = true;

    try {
      if (status === 'playing') {
        if (isNativeFallback) {
          window.speechSynthesis.cancel();
          setStatus('idle');
        } else {
          audioRef.current?.pause();
        }
        isTransitioning.current = false;
        return;
      }

      if (status === 'paused' && audioRef.current && !isNativeFallback) {
        await audioRef.current.play();
        isTransitioning.current = false;
        return;
      }

      // Tenta carregar do Cache/Servidor
      if (!audioUrl) {
        setStatus('loading');
        try {
          const res = await fetch('/api/profile/audio-bio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: cleanText,
              userId: userId || currentUser?.id
            }),
          });
          
          if (!res.ok) throw new Error('API Error');
          
          const data = await res.json();
          if (data.audio) {
            setAudioUrl(data.audio);
            const audio = setupAudio(data.audio);
            await audio.play();
          } else {
            throw new Error('No audio returned');
          }
        } catch (err) {
          console.warn('AudioBioPlayer: Falha na IA Premium, usando Web Speech API.');
          handleNativeSpeak();
        }
      } else if (audioRef.current) {
        await audioRef.current.play();
      }
    } catch (err) {
      console.error('Audio playback failed:', err);
      handleNativeSpeak();
    } finally {
      isTransitioning.current = false;
    }
  };

  // Global cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsAudioPlaying(false);
    };
  }, [setIsAudioPlaying]);

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
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
            {status === 'loading' ? 'Sincronizando IA...' : isNativeFallback ? 'Voz Local' : 'Ouvir Perfil'}
          </span>
          <span className="text-[9px] font-bold text-white/40 uppercase">
            {status === 'loading' ? 'Gerando Áudio' : isNativeFallback ? 'Web Speech API' : 'Gemini Premium'}
          </span>
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
