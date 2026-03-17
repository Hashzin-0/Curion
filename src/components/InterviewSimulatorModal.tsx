'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal, Button } from './ui/SharedUI';
import { Mic, Send, Loader2, Volume2, VolumeX, User, Bot, PlayCircle, Square, Sparkles } from 'lucide-react';
import { simulateInterview } from '@/ai/flows/interview-simulation-flow';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: 'user' | 'model';
  content: string;
  audio?: string;
  isAudioInput?: boolean;
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
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await sendAudioMessage(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error('Permissão de microfone negada.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioMessage = async (base64Audio: string) => {
    if (!currentUser || isLoading) return;

    setIsLoading(true);
    const newMessages = [...messages, { role: 'user', content: '🎤 Resposta em áudio...', isAudioInput: true } as Message];
    setMessages(newMessages);

    try {
      const result = await simulateInterview({
        areaName,
        userName: currentUser.name,
        userAudio: base64Audio,
        history: messages.map(m => ({ role: m.role, content: m.content })),
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Simulador Native Audio: ${areaName}`} maxWidth="max-w-3xl">
      <div className="flex flex-col h-[600px]">
        <div className="bg-blue-600/10 p-3 flex items-center justify-between border-b dark:border-slate-800">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">IA Multimodal Ativa</span>
           </div>
           <button onClick={() => setIsMuted(!isMuted)} className="text-slate-500 hover:text-blue-600 transition-colors">
             {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800'}`}>
                    {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                  </div>
                  <div className={`p-5 rounded-3xl text-sm font-medium shadow-sm relative ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                    {msg.isAudioInput && <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase opacity-70"><Mic size={10} /> Áudio Enviado</div>}
                    <p className="leading-relaxed">{msg.content}</p>
                    {msg.audio && (
                      <button 
                        onClick={() => playAudio(msg.audio!)}
                        className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <PlayCircle size={14} className="text-blue-600" /> Reproduzir Pergunta
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">IA Processando Áudio...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              title="Segure para falar"
            >
              {isRecording ? <Square size={24} /> : <Mic size={24} />}
            </button>
            
            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isRecording ? "Gravando áudio..." : "Segure o botão para falar ou digite..."}
                disabled={isRecording}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
              <Button type="submit" disabled={isLoading || isRecording || !inputValue.trim()} className="rounded-2xl w-14 h-14 p-0">
                <Send size={20} />
              </Button>
            </form>
          </div>
          <div className="flex justify-center mt-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Sparkles size={12} className="text-blue-500" />
               Segure o microfone para responder por voz
             </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
