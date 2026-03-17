
'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal, Button } from './ui/SharedUI';
import { Mic, Send, Loader2, Volume2, VolumeX, User, Bot, PlayCircle } from 'lucide-react';
import { simulateInterview } from '@/ai/flows/interview-simulation-flow';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: 'user' | 'model';
  content: string;
  audio?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  areaName: string;
};

export function InterviewSimulatorModal({ isOpen, onClose, areaName }: Props) {
  const { currentUser } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleStart();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleStart = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const result = await simulateInterview({
        areaName,
        userName: currentUser.name,
      });
      const newMessage: Message = { role: 'model', content: result.text, audio: result.audio };
      setMessages([newMessage]);
      if (!isMuted) playAudio(result.audio);
    } catch (e) {
      toast.error('Erro ao iniciar simulador.');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.play();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading || !currentUser) return;

    const userMsg = inputValue;
    setInputValue('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);

    setIsLoading(true);
    try {
      const result = await simulateInterview({
        areaName,
        userName: currentUser.name,
        history: newMessages.map(m => ({ role: m.role, content: m.content })),
        lastMessage: userMsg
      });

      const aiMsg: Message = { role: 'model', content: result.text, audio: result.audio };
      setMessages(prev => [...prev, aiMsg]);
      if (!isMuted) playAudio(result.audio);
    } catch (e) {
      toast.error('Erro na resposta da IA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Simulador: ${areaName}`} maxWidth="max-w-3xl">
      <div className="flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                    {msg.content}
                    {msg.audio && (
                      <button 
                        onClick={() => playAudio(msg.audio!)}
                        className="block mt-2 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 flex items-center gap-1"
                      >
                        <PlayCircle size={12} /> Ouvir Novamente
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              className="px-3"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua resposta..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              <Send size={18} />
            </Button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2 font-bold uppercase tracking-widest">
            A IA está treinando você para perguntas de alto impacto.
          </p>
        </div>
      </div>
    </Modal>
  );
}
