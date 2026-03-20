'use client';

import { useRef, useState } from 'react';
import { AI_CONFIG } from '@/config/ai';
import { analyzeAnswer } from './useInterviewAnalysis';

/**
 * @fileOverview Hook de Entrevista Realtime otimizado para latência zero.
 * Conecta o cliente diretamente ao Gemini 2.5 Flash Native Audio via WebSocket.
 */

export function useRealtimeInterview() {
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  async function start(userName: string, areaName: string) {
    setIsInterviewing(true);
    setAnalysisResults([]);
    
    const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!geminiKey) {
      console.error('RealtimeInterview: NEXT_PUBLIC_GOOGLE_API_KEY não configurada.');
      setIsInterviewing(false);
      return;
    }

    let isSpeaking = false;
    let silenceTimer: any = null;
    let transcriptBuffer = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      const ws = new WebSocket(
        `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.StreamGenerateContent?key=${geminiKey}`
      );

      wsRef.current = ws;

      ws.onopen = () => {
        const systemPrompt = `Você é um recrutador sênior extremamente profissional na área de ${areaName}. 
        Seu objetivo é entrevistar o candidato ${userName} de forma técnica e direta. 
        Faça uma pergunta por vez. Use sua capacidade nativa de áudio para soar humano e profissional.`;

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
        const input = e.inputBuffer.getChannelData(0);
        const volume = input.reduce((sum, x) => sum + Math.abs(x), 0) / input.length;

        if (volume > 0.01) {
          isSpeaking = true;
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
          }
          sendAudio(input);
        } else if (isSpeaking && !silenceTimer) {
          silenceTimer = setTimeout(() => {
            isSpeaking = false;
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ inputAudioEnd: true }));
            }
          }, 500);
        }
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        if (msg.text) {
          transcriptBuffer += msg.text;
        }

        if (msg.audio?.data) {
          playAudio(msg.audio.data);
        }

        if (msg.turnComplete) {
          const result = await analyzeAnswer(transcriptBuffer);
          setAnalysisResults(prev => [...prev, result]);
          transcriptBuffer = '';
        }
      };

      ws.onerror = () => stop();
      ws.onclose = () => setIsInterviewing(false);
    } catch (err) {
      console.error('Falha ao iniciar áudio:', err);
      setIsInterviewing(false);
    }
  }

  function sendAudio(float32: Float32Array) {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      pcm16[i] = float32[i] * 0x7fff;
    }
    wsRef.current?.send(JSON.stringify({
      inputAudio: {
        data: btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer))),
        mimeType: 'audio/pcm',
      },
    }));
  }

  function playAudio(base64: string) {
    if (!audioCtxRef.current) return;
    const audioCtx = audioCtxRef.current;
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
  }

  function stop() {
    processorRef.current?.disconnect();
    audioCtxRef.current?.close();
    wsRef.current?.close();
    setIsInterviewing(false);
  }

  return { start, stop, isInterviewing, analysisResults };
}
