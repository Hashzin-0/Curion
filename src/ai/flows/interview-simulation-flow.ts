'use server';

/**
 * @fileOverview Fluxo de simulação de entrevista refatorado para usar TTS de Fallback.
 * Separa a geração de texto (IA) da geração de áudio (Motores Locais).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateAudioBio } from './generate-audio-bio-flow';
import { AI_CONFIG } from '@/ai/config';

const InterviewInputSchema = z.object({
  areaName: z.string().describe('A área profissional da entrevista.'),
  userName: z.string().describe('Nome do candidato.'),
  userAudio: z.string().optional().describe('Áudio do usuário em formato data URI (base64) ou URL.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Histórico da conversa textual.'),
});

const InterviewOutputSchema = z.object({
  text: z.string().describe('O texto transcrito ou resposta do recrutador.'),
  audio: z.string().describe('Áudio da resposta em formato data URI (MP3).'),
});

export type InterviewInput = z.infer<typeof InterviewInputSchema>;
export type InterviewOutput = z.infer<typeof InterviewOutputSchema>;

export async function simulateInterview(input: InterviewInput): Promise<InterviewOutput> {
  const historyMessages = input.history?.map(h => ({
    role: h.role === 'model' ? 'model' as const : 'user' as const,
    content: [{ text: h.content }]
  })) || [];

  const currentPromptParts: any[] = [];

  if (input.userAudio) {
    currentPromptParts.push({
      media: {
        url: input.userAudio,
        contentType: 'audio/wav'
      }
    });
  } else if (historyMessages.length === 0) {
    currentPromptParts.push({ text: "Inicie a entrevista se apresentando e fazendo a primeira pergunta relevante para a vaga." });
  } else {
    currentPromptParts.push({ text: "Continue a entrevista respondendo ao candidato." });
  }

  // 1. Gerar resposta em TEXTO usando o modelo configurado no AI_CONFIG (ex: OpenRouter)
  const response = await ai.generate({
    model: 'openai/' + process.env.NEXT_PUBLIC_AI_MODEL || 'google/gemini-2.0-flash-001',
    system: `Você é um recrutador sênior extremamente profissional na área de ${input.areaName}. 
    Seu objetivo é entrevistar o candidato ${input.userName} de forma técnica e direta. 
    Faça uma pergunta por vez. Analise as respostas com profundidade.`,
    messages: [
      ...historyMessages,
      {
        role: 'user',
        content: currentPromptParts
      }
    ]
  });

  const responseText = response.text;

  // 2. Gerar áudio usando a nova arquitetura de fallbacks locais
  try {
    const { audio } = await generateAudioBio(responseText);
    return {
      text: responseText,
      audio: audio,
    };
  } catch (err) {
    // Se o TTS falhar, retornamos o texto e uma string vazia no áudio.
    // O frontend detectará a falta de áudio e acionará o Web Speech API se necessário.
    console.warn('Interview Simulation: Falha no áudio premium, sinalizando fallback.');
    return {
      text: responseText,
      audio: '',
    };
  }
}
