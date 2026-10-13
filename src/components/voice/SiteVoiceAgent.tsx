'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, Mic, MicOff, X, MessageCircle, Loader2 } from 'lucide-react';

type LiveMessage = { setupComplete?: boolean; serverContent?: { modelTurn?: { parts?: Array<{ text?: string }> }; turnComplete?: boolean } };
type SpeechRecognitionResultEvent = Event & { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecognitionInstance = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start(): void; stop(): void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
declare global {
  interface Window { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
}

const ALLOWED_ROUTES = ['/profile', '/resume', '/interview', '/jobs', '/settings'] as const;

export function SiteVoiceAgent() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState('Pronto para ajudar');
  const [transcript, setTranscript] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const responseRef = useRef('');

  useEffect(() => () => {
    recognitionRef.current?.stop();
    socketRef.current?.close();
  }, []);

  function speak(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  }

  async function connect() {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    setConnecting(true);
    setStatus('Conectando ao Gemini Live…');
    try {
      const response = await fetch('/api/gemini/live-token', { method: 'POST', cache: 'no-store' });
      const data = await response.json() as { token?: string; error?: string };
      if (!response.ok || !data.token) throw new Error(data.error || 'Não foi possível obter a sessão.');
      const socket = new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?access_token=${encodeURIComponent(data.token)}`);
      socketRef.current = socket;
      socket.onopen = () => socket.send(JSON.stringify({ setup: {
        model: 'models/gemini-2.5-flash-native-audio-latest',
        systemInstruction: { parts: [{ text: 'Você é o assistente de voz do Curion. Responda em português brasileiro, com instruções curtas e úteis sobre currículos, perfil profissional e ferramentas deste site. Quando o usuário pedir para abrir uma página, sugira uma destas rotas permitidas: /profile, /resume, /interview, /jobs, /settings. Não afirme que navegou; responda no formato NAVIGATE:/rota somente quando houver pedido explícito de navegação. Caso contrário, responda normalmente.' }] },
        generationConfig: { responseModalities: ['TEXT'] },
      } }));
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as LiveMessage;
          if (message.setupComplete) setStatus('Conectado ao Gemini Live');
          const parts = message.serverContent?.modelTurn?.parts || [];
          for (const part of parts) if (part.text) responseRef.current += part.text;
          if (message.serverContent?.turnComplete && responseRef.current.trim()) {
            const answer = responseRef.current.trim();
            responseRef.current = '';
            const navigation = answer.match(/^NAVIGATE:(\/[^\s]*)$/);
            if (navigation && (ALLOWED_ROUTES as readonly string[]).includes(navigation[1])) {
              router.push(navigation[1]);
              setTranscript('Abrindo a página solicitada.');
              speak('Abrindo a página solicitada.');
            } else {
              setTranscript(answer);
              speak(answer);
            }
            setStatus('Pronto para ajudar');
          }
        } catch { setStatus('Não foi possível interpretar a resposta do assistente.'); }
      };
      socket.onerror = () => setStatus('Falha na conexão com Gemini Live');
      socket.onclose = () => { setConnecting(false); setListening(false); setStatus('Sessão encerrada'); };
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Falha ao conectar');
    } finally { setConnecting(false); }
  }

  async function startListening() {
    await connect();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('Este navegador não oferece reconhecimento de voz. Use um navegador compatível.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript?.trim();
      if (!text) return;
      setTranscript(text);
      setStatus('Consultando o Gemini Live…');
      socketRef.current?.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true } }));
    };
    recognition.onerror = () => { setStatus('Não foi possível captar a fala. Verifique a permissão do microfone.'); setListening(false); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try { recognition.start(); setListening(true); setStatus('Ouvindo…'); }
    catch { setStatus('Não foi possível iniciar o microfone.'); setListening(false); }
  }

  function close() {
    recognitionRef.current?.stop();
    socketRef.current?.close();
    socketRef.current = null;
    window.speechSynthesis?.cancel();
    setOpen(false); setListening(false); setStatus('Pronto para ajudar');
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80]">
      {open && <section aria-label="Assistente de voz Curion" className="mb-3 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        <header className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Headphones size={18}/><strong>Assistente Curion</strong></div><button onClick={close} aria-label="Fechar assistente"><X size={18}/></button></header>
        <p className="text-xs text-slate-500" aria-live="polite">{status}</p>
        <p className="my-4 min-h-12 text-sm">{transcript || 'Pergunte como usar o site ou peça para abrir uma ferramenta.'}</p>
        <div className="flex gap-2">
          <button onClick={startListening} disabled={connecting || listening} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{connecting ? <Loader2 size={16} className="animate-spin"/> : <Mic size={16}/>} {listening ? 'Ouvindo…' : 'Falar'}</button>
          <button onClick={() => { recognitionRef.current?.stop(); socketRef.current?.close(); socketRef.current = null; setListening(false); setStatus('Sessão encerrada'); }} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"><MicOff size={16}/></button>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">A fala é reconhecida pelo navegador e enviada ao Gemini Live. O microfone só é ativado após sua ação.</p>
      </section>}
      <button onClick={() => setOpen(value => !value)} aria-label={open ? 'Fechar assistente de voz' : 'Abrir assistente de voz'} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-500">{open ? <X/> : <span className="relative"><MessageCircle/><Headphones className="absolute -bottom-1 -right-2 h-4 w-4 rounded-full bg-blue-600"/></span>}</button>
    </div>
  );
}
