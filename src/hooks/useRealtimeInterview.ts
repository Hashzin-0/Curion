'use client';

import { useRef, useState } from 'react';
import { AI_CONFIG } from '@/config/ai';
import { analyzeAnswer } from './useInterviewAnalysis';
import { toast } from 'sonner';

/**
 * @fileOverview Hook de Entrevista Realtime otimizado para latência zero.
 * Conecta o cliente diretamente ao Gemini via WebSocket.
 */

export function useRealtimeInterview() {
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  async function start(userName: string, areaName: string) {
    stop();
    
    setIsInterviewing(true);
    setAnalysisResults([]);
    
    const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!geminiKey) {
      console.error('RealtimeInterview: NEXT_PUBLIC_GOOGLE_API_KEY não encontrada.');
      toast.error('Erro de Configuração: Verifique a variável NEXT_PUBLIC_GOOGLE_API_KEY.');
      setIsInterviewing(false);
      return;
    }

    let isSpeaking = false;
    let silenceTimer: any = null;
    let transcriptBuffer = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // Usando v1beta para Multimodal Live
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.StreamGenerateContent?key=${geminiKey}`;
      console.log('RealtimeInterview: Conectando...', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('RealtimeInterview: WebSocket aberto.');
        
        const systemPrompt = `Você é um recrutador sênior profissional na área de ${areaName}. 
        Seu objetivo é entrevistar o candidato ${userName}. 
        Faça perguntas diretas e técnicas. Reaja ao tom de voz do candidato.`;

        // Payload de setup conforme especificação do Multimodal Live
        ws.send(JSON.stringify({
          setup: {
            model: `models/${AI_CONFIG.model}`,
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            generationConfig: {
              responseModalities: ['AUDIO', 'TEXT'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: AI_CONFIG.voice,
                  },
                },
              },
            },
          },
        }));
      };

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        const input = e.inputBuffer.getChannelData(0);
        const volume = input.reduce((sum, x) => sum + Math.abs(x), 0) / input.length;

        if (volume > 0.01) {
          if (!isSpeaking) {
            isSpeaking = true;
          }
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
          }
          sendAudio(input);
        } else if (isSpeaking && !silenceTimer) {
          silenceTimer = setTimeout(() => {
            isSpeaking = false;
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ realtimeInput: { mediaChunks: [] }, inputAudioEnd: true }));
            }
          }, 1500);
        }
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.serverContent?.modelTurn?.parts) {
            for (const part of msg.serverContent.modelTurn.parts) {
              if (part.text) transcriptBuffer += part.text;
              if (part.inlineData?.data) playAudio(part.inlineData.data);
            }
          }

          if (msg.serverContent?.turnComplete) {
            if (transcriptBuffer.trim()) {
              const result = await analyzeAnswer(transcriptBuffer);
              setAnalysisResults(prev => [...prev, result]);
              transcriptBuffer = '';
            }
          }
        } catch (err) {
          console.error('RealtimeInterview: Erro na mensagem:', err);
        }
      };

      ws.onerror = (ev) => {
        console.error('RealtimeInterview: Erro no WebSocket. Verifique sua chave e o modelo.', ev);
        toast.error('Erro na conexão. Verifique se o modelo ' + AI_CONFIG.model + ' está disponível na sua região.');
        stop();
      };

      ws.onclose = (ev) => {
        console.warn('RealtimeInterview: WebSocket fechado.', ev.code);
        setIsInterviewing(false);
      };

    } catch (err: any) {
      console.error('RealtimeInterview: Falha ao iniciar:', err);
      toast.error(`Falha no microfone: ${err.message}`);
      setIsInterviewing(false);
    }
  }

  function sendAudio(float32: Float32Array) {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      pcm16[i] = Math.max(-1, Math.min(1, float32[i])) * 0x7fff;
    }
    
    wsRef.current?.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{
          data: btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer))),
          mimeType: 'audio/pcm;rate=24000',
        }]
      }
    }));
  }

  function playAudio(base64: string) {
    if (!audioCtxRef.current) return;
    const audioCtx = audioCtxRef.current;
    
    try {
      const binary = atob(base64);
      const buffer = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
      }
      
      audioCtx.decodeAudioData(buffer.buffer, (decoded) => {
        const src = audioCtx.createBufferSource();
        src.buffer = decoded;
        src.connect(audioCtx.destination);
        src.start();
      });
    } catch (err) {
      console.error('RealtimeInterview: Erro ao tocar áudio.', err);
    }
  }

  function stop() {
    if (processorRef.current) processorRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    if (wsRef.current) wsRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

    wsRef.current = null;
    audioCtxRef.current = null;
    processorRef.current = null;
    streamRef.current = null;
    setIsInterviewing(false);
  }

  return { start, stop, isInterviewing, analysisResults };
}
