import { useRef } from 'react';
import { AI_CONFIG } from '@/config/ai';
import { analyzeAnswer } from './useInterviewAnalysis';

export function useRealtimeInterview() {
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  let isSpeaking = false;
  let silenceTimer: any = null;
  let transcriptBuffer = '';
  let scores: any[] = [];

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const audioCtx = new AudioContext({ sampleRate: 24000 });
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    source.connect(processor);
    processor.connect(audioCtx.destination);

    const ws = new WebSocket(
      `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.StreamGenerateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        setup: {
          model: `models/${AI_CONFIG.model}`,
          systemInstruction: {
            parts: [{ text: AI_CONFIG.systemPrompt }],
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

      const volume =
        input.reduce((sum, x) => sum + Math.abs(x), 0) / input.length;

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
          ws.send(JSON.stringify({ inputAudioEnd: true }));
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

      if (isSpeaking && msg.audio) {
        stopAI();
      }

      if (msg.turnComplete) {
        const result = await analyzeAnswer(transcriptBuffer);

        scores.push(result);

        console.log('📊 Avaliação:', result);

        const avg =
          scores.reduce((acc, s) => acc + (s.score || 0), 0) /
          scores.length;

        console.log('⭐ Média geral:', avg.toFixed(1));

        transcriptBuffer = '';
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
      reconnect();
    };
    ws.onclose = () => reconnect();
  }

  function sendAudio(float32: Float32Array) {
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
    const audioCtx = audioCtxRef.current!;
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }

    // Nota: decodeAudioData espera um container (WAV/MP3). 
    // Se o modelo retornar PCM puro, pode ser necessário criar o buffer manualmente.
    audioCtx.decodeAudioData(buffer.buffer, (decoded) => {
      const src = audioCtx.createBufferSource();
      src.buffer = decoded;
      src.connect(audioCtx.destination);
      src.start();
    }).catch(err => {
      console.warn('Erro ao decodificar áudio nativo:', err);
    });
  }

  function stopAI() {
    wsRef.current?.send(JSON.stringify({
      interrupt: true,
    }));
  }

  function reconnect() {
    stop();
    setTimeout(start, 1000);
  }

  function stop() {
    processorRef.current?.disconnect();
    audioCtxRef.current?.close();
    wsRef.current?.close();
  }

  return { start, stop };
}