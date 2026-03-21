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
    // Limpeza prévia de qualquer sessão pendente
    stop();
    
    setIsInterviewing(true);
    setAnalysisResults([]);
    
    const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!geminiKey) {
      console.error('RealtimeInterview: NEXT_PUBLIC_GOOGLE_API_KEY não configurada no .env.local');
      toast.error('Erro de Configuração: Chave de API do Google não encontrada.');
      setIsInterviewing(false);
      return;
    }

    let isSpeaking = false;
    let silenceTimer: any = null;
    let transcriptBuffer = '';

    try {
      console.log('RealtimeInterview: Solicitando acesso ao microfone...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;

      // Retomar contexto se estiver suspenso (regra de segurança do navegador)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // URL do serviço Multimodal Live do Gemini
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.StreamGenerateContent?key=${geminiKey}`;
      console.log('RealtimeInterview: Conectando ao WebSocket do Gemini...');
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('RealtimeInterview: Conexão estabelecida. Enviando setup...');
        
        const systemPrompt = `Você é um recrutador sênior extremamente profissional na área de ${areaName}. 
        Seu objetivo é entrevistar o candidato ${userName} de forma técnica e direta. 
        Faça uma pergunta por vez. Use sua capacidade nativa de áudio para soar humano e profissional.`;

        // O modelo no WebSocket deve seguir o formato models/gemini-2.0-flash-exp ou similar
        // Se o modelo 2.5 falhar, sugerimos gemini-2.0-flash-exp para maior compatibilidade atual
        const modelName = AI_CONFIG.model.includes('2.5') ? AI_CONFIG.model : 'gemini-2.0-flash-exp';

        ws.send(JSON.stringify({
          setup: {
            model: `models/${modelName}`,
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
        // Cálculo simples de volume para detecção de silêncio/fala
        const volume = input.reduce((sum, x) => sum + Math.abs(x), 0) / input.length;

        if (volume > 0.01) {
          if (!isSpeaking) {
            isSpeaking = true;
            console.log('RealtimeInterview: Usuário começou a falar...');
          }
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
          }
          sendAudio(input);
        } else if (isSpeaking && !silenceTimer) {
          // Detecta fim da fala após 1 segundo de silêncio
          silenceTimer = setTimeout(() => {
            isSpeaking = false;
            console.log('RealtimeInterview: Silêncio detectado. Encerrando turno de áudio.');
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ inputAudioEnd: true }));
            }
          }, 1000);
        }
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.text) {
            transcriptBuffer += msg.text;
          }

          if (msg.audio?.data) {
            playAudio(msg.audio.data);
          }

          if (msg.turnComplete) {
            console.log('RealtimeInterview: Turno da IA concluído. Analisando transcrição...');
            if (transcriptBuffer.trim()) {
              const result = await analyzeAnswer(transcriptBuffer);
              setAnalysisResults(prev => [...prev, result]);
              transcriptBuffer = '';
            }
          }
        } catch (err) {
          console.error('RealtimeInterview: Erro ao processar mensagem do servidor:', err);
        }
      };

      ws.onerror = (ev) => {
        console.error('RealtimeInterview: Erro no WebSocket:', ev);
        toast.error('Erro na conexão com o servidor de IA.');
        stop();
      };

      ws.onclose = (ev) => {
        console.warn('RealtimeInterview: WebSocket fechado:', ev.code, ev.reason);
        if (isInterviewing) {
          if (ev.code === 1006) {
            toast.error('Conexão interrompida. Verifique sua internet ou a chave de API.');
          }
          setIsInterviewing(false);
        }
      };

    } catch (err: any) {
      console.error('RealtimeInterview: Falha crítica ao iniciar:', err);
      toast.error(`Não foi possível iniciar o áudio: ${err.message}`);
      setIsInterviewing(false);
    }
  }

  function sendAudio(float32: Float32Array) {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    
    // Converte Float32 para PCM 16-bit conforme esperado pelo Gemini
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
      }, (err) => {
        console.error('RealtimeInterview: Erro ao decodificar áudio recebido:', err);
      });
    } catch (err) {
      console.error('RealtimeInterview: Falha no processamento de áudio base64:', err);
    }
  }

  function stop() {
    console.log('RealtimeInterview: Encerrando sessão...');
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(console.error);
      audioCtxRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsInterviewing(false);
  }

  return { start, stop, isInterviewing, analysisResults };
}
