'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleGenAI } from '@google/genai';
import { Headphones, Mic, MicOff, X, MessageCircle, Loader2, Volume2 } from 'lucide-react';
import {
  LIVE_ALLOWED_ROUTES,
  LIVE_MODEL,
  LIVE_TOOL_DECLARATIONS,
  LIVE_VOICE,
  LIVE_VOICE_TOOL_GUIDANCE,
  type LivePage,
} from '@/lib/gemini/live-config';

type LiveSession = Awaited<ReturnType<GoogleGenAI['live']['connect']>>;

function encodePcm16(samples: Float32Array): string {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, value < 0 ? value * 0x8000 : value * 0x7fff, true);
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decodeAndPlayPcm(context: AudioContext, base64: string, scheduleRef: { current: number }, sourcesRef: { current: Set<AudioBufferSourceNode> }) {
  if (context.state === 'closed') return;
  const binary = atob(base64);
  const sampleCount = Math.floor(binary.length / 2);
  if (!sampleCount) return;

  const buffer = context.createBuffer(1, sampleCount, 24_000);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i += 1) {
    const sample = (binary.charCodeAt(i * 2) & 0xff) | (binary.charCodeAt(i * 2 + 1) << 8);
    channel[i] = (sample >= 0x8000 ? sample - 0x10000 : sample) / 0x8000;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  sourcesRef.current.add(source);
  source.onended = () => sourcesRef.current.delete(source);
  const startAt = Math.max(context.currentTime + 0.02, scheduleRef.current);
  source.start(startAt);
  scheduleRef.current = startAt + buffer.duration;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function SiteVoiceAgent() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState('Pronto para ajudar');
  const [transcript, setTranscript] = useState('');
  const sessionRef = useRef<LiveSession | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playbackScheduleRef = useRef(0);
  const playbackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const latestUserTranscriptRef = useRef('');

  function releaseAudio() {
    if (processorRef.current) processorRef.current.disconnect();
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    for (const source of playbackSourcesRef.current) {
      try { source.stop(); } catch { /* A fonte pode já ter terminado. */ }
    }
    playbackSourcesRef.current.clear();
    if (audioCtxRef.current) void audioCtxRef.current.close().catch(() => undefined);
    processorRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    playbackScheduleRef.current = 0;
  }

  function stopSession(message = 'Sessão encerrada') {
    const session = sessionRef.current;
    sessionRef.current = null;
    if (session) session.close();
    releaseAudio();
    setListening(false);
    setConnecting(false);
    setStatus(message);
  }

  async function handleToolCalls(message: Parameters<NonNullable<Parameters<GoogleGenAI['live']['connect']>[0]['callbacks']>['onmessage']>[0]) {
    const session = sessionRef.current;
    const calls = message.toolCall?.functionCalls ?? [];
    if (!session || calls.length === 0) return;

    const responses = calls.map((call) => {
      const args = isRecord(call.args) ? call.args : {};
      let result: Record<string, unknown>;

      if (call.name === 'navigate_to_page') {
        const requestedPage = args.page;
        const explicitIntent = /\b(abra|abrir|abre|navegue|navegar|vá para|vai para|ir para|acessar|acesse|quero ir|quero abrir|me leve|mostre)\b/i.test(latestUserTranscriptRef.current);
        const isAllowedPage = typeof requestedPage === 'string'
          && Object.prototype.hasOwnProperty.call(LIVE_ALLOWED_ROUTES, requestedPage);

        if (!explicitIntent) {
          result = { ok: false, message: 'Só navegue quando o usuário pedir explicitamente para abrir uma página.' };
        } else if (!isAllowedPage) {
          result = { ok: false, message: 'Destino não permitido. Escolha uma página suportada.' };
        } else {
          const page = requestedPage as LivePage;
          router.push(LIVE_ALLOWED_ROUTES[page]);
          result = { ok: true, message: 'Navegação solicitada iniciada.', page };
          setStatus('Abrindo a página solicitada');
        }
      } else if (call.name === 'get_site_help') {
        const topic = args.topic;
        if (typeof topic === 'string' && Object.prototype.hasOwnProperty.call(LIVE_VOICE_TOOL_GUIDANCE, topic)) {
          result = { ok: true, guidance: LIVE_VOICE_TOOL_GUIDANCE[topic] };
        } else {
          result = { ok: false, message: 'Esse tópico não está disponível na base de ajuda.' };
        }
      } else {
        result = { ok: false, message: 'Ferramenta desconhecida ou não autorizada.' };
      }

      return {
        id: call.id ?? call.name,
        name: call.name,
        response: { result },
      };
    });

    try {
      session.sendToolResponse({ functionResponses: responses });
    } catch (error) {
      console.error('Falha ao responder ferramenta do assistente:', error instanceof Error ? error.message : 'erro desconhecido');
      setStatus('Não foi possível concluir a ferramenta solicitada.');
    }
  }

  async function startSession() {
    if (connecting || listening) return;
    setConnecting(true);
    setStatus('Preparando sessão segura…');
    setTranscript('');
    latestUserTranscriptRef.current = '';

    try {
      const response = await fetch('/api/gemini/live-token', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json() as { token?: string; error?: string };
      if (!response.ok || !data.token) throw new Error(data.error || 'Não foi possível obter a sessão Gemini Live.');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const context = new AudioContext();
      audioCtxRef.current = context;
      await context.resume();

      const client = new GoogleGenAI({ apiKey: data.token, httpOptions: { apiVersion: 'v1beta' } });
      const session = await client.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: ['AUDIO'],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: LIVE_VOICE } } },
          systemInstruction: {
            parts: [{
              text: `Você é o assistente de voz do Curion. Converse em português brasileiro, de forma clara e concisa. Ajude a pessoa a entender e usar as ferramentas profissionais do site. Use get_site_help para explicar funcionalidades quando for útil. Use navigate_to_page somente quando a pessoa pedir explicitamente para abrir ou navegar para uma página; não navegue por iniciativa própria. Nunca diga que executou uma ação se a ferramenta não confirmar. Não solicite nem revele senhas, chaves ou tokens. Você só pode navegar para home, profile, interview ou explore. Para currículo e vagas, explique o fluxo confirmado sem inventar uma rota.`,
            }],
          },
          tools: [{ functionDeclarations: [...LIVE_TOOL_DECLARATIONS] }],
        },
        callbacks: {
          onmessage: (message) => {
            const serverContent = message.serverContent;
            const inputText = serverContent?.inputTranscription?.text;
            if (inputText) {
              latestUserTranscriptRef.current += inputText;
              setTranscript((current) => `${current}${current ? '\n' : ''}Você: ${inputText}`);
            }

            const outputText = serverContent?.outputTranscription?.text;
            if (outputText) {
              setTranscript((current) => `${current}${current ? '\n' : ''}Curion: ${outputText}`);
            }

            for (const part of serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data && audioCtxRef.current) {
                try {
                  decodeAndPlayPcm(audioCtxRef.current, part.inlineData.data, playbackScheduleRef, playbackSourcesRef);
                } catch (error) {
                  console.error('Falha ao reproduzir resposta do assistente:', error instanceof Error ? error.message : 'erro desconhecido');
                }
              }
            }

            if (serverContent?.interrupted) {
              playbackScheduleRef.current = 0;
              for (const source of playbackSourcesRef.current) {
                try { source.stop(); } catch { /* A fonte pode já ter terminado. */ }
              }
              playbackSourcesRef.current.clear();
            }

            if (message.toolCall?.functionCalls?.length) void handleToolCalls(message);
            if (serverContent?.turnComplete) {
              latestUserTranscriptRef.current = '';
              setStatus('Conectado — pode falar');
            }
          },
          onerror: (event) => {
            console.error('Gemini Live voice agent error:', event.message);
            stopSession('Falha na conexão. Tente iniciar novamente.');
          },
          onclose: () => {
            sessionRef.current = null;
            releaseAudio();
            setListening(false);
            setConnecting(false);
            setStatus('Sessão encerrada');
          },
        },
      });
      sessionRef.current = session;

      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      const silentGain = context.createGain();
      silentGain.gain.value = 0;
      processorRef.current = processor;
      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(context.destination);

      processor.onaudioprocess = (event) => {
        const activeSession = sessionRef.current;
        if (!activeSession || audioCtxRef.current?.state !== 'running') return;
        try {
          activeSession.sendRealtimeInput({
            audio: {
              data: encodePcm16(event.inputBuffer.getChannelData(0)),
              mimeType: `audio/pcm;rate=${context.sampleRate}`,
            },
          });
        } catch (error) {
          console.error('Falha ao transmitir voz ao Gemini Live:', error instanceof Error ? error.message : 'erro desconhecido');
          setStatus('Problema ao enviar áudio. Tente encerrar e reconectar.');
        }
      };

      setListening(true);
      setConnecting(false);
      setStatus('Conectado — pode falar');
    } catch (error) {
      console.error('Não foi possível iniciar o assistente de voz:', error instanceof Error ? error.message : 'erro desconhecido');
      stopSession(error instanceof Error ? error.message : 'Não foi possível iniciar o assistente.');
    }
  }

  useEffect(() => () => {
    const session = sessionRef.current;
    sessionRef.current = null;
    if (session) session.close();
    releaseAudio();
  }, []);

  function closePanel() {
    stopSession('Pronto para ajudar');
    setOpen(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80]">
      {open && (
        <section aria-label="Assistente de voz Curion" className="mb-3 w-[min(23rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <header className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Headphones size={18} /><strong>Assistente Curion</strong></div>
            <button onClick={closePanel} aria-label="Fechar assistente"><X size={18} /></button>
          </header>
          <p className="text-xs text-slate-500" aria-live="polite">{status}</p>
          <div className="my-3 max-h-44 min-h-16 overflow-y-auto rounded-xl bg-slate-50 p-3 text-sm whitespace-pre-wrap dark:bg-slate-800">
            {transcript || 'Peça ajuda para usar o Curion ou diga qual página deseja abrir.'}
          </div>
          <div className="flex gap-2">
            {!listening ? (
              <button onClick={startSession} disabled={connecting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {connecting ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                {connecting ? 'Conectando…' : 'Iniciar conversa'}
              </button>
            ) : (
              <button onClick={() => stopSession()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
                <MicOff size={16} /> Encerrar conversa
              </button>
            )}
            <span className="flex items-center rounded-xl border border-slate-200 px-3 text-slate-500 dark:border-slate-700" aria-label="Áudio nativo Gemini Live"><Volume2 size={17} /></span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">O áudio é enviado ao Gemini Live para conversa em tempo real. O microfone só é ativado após você iniciar a conversa.</p>
        </section>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Fechar assistente de voz' : 'Abrir assistente de voz'}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-500"
      >
        {open ? <X /> : <span className="relative"><MessageCircle /><Headphones className="absolute -bottom-1 -right-2 h-4 w-4 rounded-full bg-blue-600" /></span>}
      </button>
    </div>
  );
}
