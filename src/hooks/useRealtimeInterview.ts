'use client';

import { useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from '@/config/ai';
import { LIVE_MODEL, LIVE_VOICE } from '@/lib/gemini/live-config';
import { analyzeAnswer } from './useInterviewAnalysis';
import { toast } from 'sonner';

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

export function useRealtimeInterview() {
  const sessionRef = useRef<LiveSession | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextPlaybackTimeRef = useRef(0);
  const candidateTranscriptRef = useRef('');

  const [isInterviewing, setIsInterviewing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<unknown[]>([]);
  const [transcript, setTranscript] = useState('');

  function releaseAudio() {
    if (processorRef.current) processorRef.current.disconnect();
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    if (audioCtxRef.current) void audioCtxRef.current.close().catch(() => undefined);
    processorRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    nextPlaybackTimeRef.current = 0;
  }

  function playPcmAudio(base64: string) {
    const context = audioCtxRef.current;
    if (!context || context.state === 'closed') return;

    try {
      const binary = atob(base64);
      const sampleCount = Math.floor(binary.length / 2);
      const audioBuffer = context.createBuffer(1, sampleCount, 24_000);
      const channel = audioBuffer.getChannelData(0);
      for (let i = 0; i < sampleCount; i += 1) {
        const sample = (binary.charCodeAt(i * 2) & 0xff) | (binary.charCodeAt(i * 2 + 1) << 8);
        const signedSample = sample >= 0x8000 ? sample - 0x10000 : sample;
        channel[i] = signedSample / 0x8000;
      }

      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      const startAt = Math.max(context.currentTime + 0.02, nextPlaybackTimeRef.current);
      source.start(startAt);
      nextPlaybackTimeRef.current = startAt + audioBuffer.duration;
    } catch (error) {
      console.error('Falha ao reproduzir áudio da entrevista:', error instanceof Error ? error.message : 'erro desconhecido');
    }
  }

  async function start(userName: string, areaName: string) {
    stop();
    setIsInterviewing(true);
    setAnalysisResults([]);
    setTranscript('');
    candidateTranscriptRef.current = '';

    let context: AudioContext | null = null;

    try {
      const tokenResponse = await fetch('/api/gemini/live-token', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });
      const tokenData = await tokenResponse.json() as { token?: string; error?: string };
      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error(tokenData.error || 'Não foi possível iniciar o Gemini Live.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      context = new AudioContext();
      audioCtxRef.current = context;
      await context.resume();

      const client = new GoogleGenAI({ apiKey: tokenData.token, httpOptions: { apiVersion: 'v1beta' } });
      const session = await client.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: ['AUDIO'],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: LIVE_VOICE } },
          },
          systemInstruction: {
            parts: [{
              text: `Você é um recrutador sênior profissional na área de ${areaName}.
Entreviste ${userName} em português brasileiro, com conversa por voz natural e uma pergunta por vez.
Comece com uma breve saudação e a primeira pergunta. Faça perguntas objetivas e técnicas, escute a resposta inteira, peça esclarecimentos quando necessário e avance como em uma entrevista real.
Não invente fatos sobre o candidato. Ao final, avise que a sessão pode ser encerrada para gerar a análise.`,
            }],
          },
        },
        callbacks: {
          onmessage: (message) => {
            const serverContent = message.serverContent;
            const incomingTranscript = serverContent?.inputTranscription?.text;
            if (incomingTranscript) {
              candidateTranscriptRef.current += incomingTranscript;
              setTranscript((current) => `${current}${current ? '\n' : ''}Candidato: ${incomingTranscript}`);
            }

            const outgoingTranscript = serverContent?.outputTranscription?.text;
            if (outgoingTranscript) {
              setTranscript((current) => `${current}${current ? '\n' : ''}Recrutador: ${outgoingTranscript}`);
            }

            for (const part of serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) playPcmAudio(part.inlineData.data);
            }

            if (serverContent?.interrupted) nextPlaybackTimeRef.current = 0;

            if (serverContent?.turnComplete) {
              const answer = candidateTranscriptRef.current.trim();
              candidateTranscriptRef.current = '';
              if (answer) {
                void analyzeAnswer(answer)
                  .then((result) => setAnalysisResults((previous) => [...previous, result]))
                  .catch((error: unknown) => {
                    console.error('Falha ao analisar resposta da entrevista:', error instanceof Error ? error.message : 'erro desconhecido');
                    toast.error('Não foi possível analisar uma resposta. A entrevista pode continuar.');
                  });
              }
            }
          },
          onerror: (event) => {
            console.error('Gemini Live interview error:', event.message);
            toast.error('A conexão de voz falhou. Verifique a configuração Gemini e tente novamente.');
            setIsInterviewing(false);
            releaseAudio();
          },
          onclose: () => {
            setIsInterviewing(false);
            releaseAudio();
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
        if (!sessionRef.current || audioCtxRef.current?.state !== 'running') return;
        const samples = event.inputBuffer.getChannelData(0);
        try {
          sessionRef.current.sendRealtimeInput({
            audio: {
              data: encodePcm16(samples),
              mimeType: `audio/pcm;rate=${context?.sampleRate ?? 48_000}`,
            },
          });
        } catch (error) {
          console.error('Falha ao enviar áudio ao Gemini Live:', error instanceof Error ? error.message : 'erro desconhecido');
        }
      };
    } catch (error) {
      console.error('Não foi possível iniciar a entrevista Gemini Live:', error instanceof Error ? error.message : 'erro desconhecido');
      sessionRef.current?.close();
      sessionRef.current = null;
      releaseAudio();
      setIsInterviewing(false);
      toast.error(error instanceof Error ? error.message : 'Falha ao iniciar microfone ou sessão Gemini Live.');
    }
  }

  function stop() {
    const session = sessionRef.current;
    sessionRef.current = null;
    if (session) session.close();
    releaseAudio();
    setIsInterviewing(false);
  }

  return { start, stop, isInterviewing, analysisResults, transcript };
}
