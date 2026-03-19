'use server';

/**
 * @fileOverview Fluxo de simulação de entrevista utilizando o modelo Gemini 2.5 Flash Native Audio.
 * Este fluxo é exclusivo e não utiliza os motores de fallback locais para garantir latência mínima e qualidade premium.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
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
  audio: z.string().describe('Áudio da resposta em formato data URI nativo do Gemini.'),
});

export type InterviewInput = z.infer<typeof InterviewInputSchema>;
export type InterviewOutput = z.infer<typeof InterviewOutputSchema>;

export async function simulateInterview(input: InterviewInput): Promise<InterviewOutput> {
  const historyMessages = input.history?.map(h => ({
    role: h.role === 'model' ? 'model' as const : 'user' as const,
    content: [{ text: h.content }]
  })) || [];

  const currentPromptParts: any[] = [];

  // Se houver áudio do usuário, enviamos como parte multimodal
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
    currentPromptParts.push({ text: "Continue a entrevista respondendo ao candidato de forma curta e direta." });
  }

  // 1. Gerar resposta usando o modelo Native Audio do Gemini
  const response = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-native-audio'),
    config: {
      responseModalities: ['TEXT', 'AUDIO'],
    },
    system: `Você é um recrutador sênior extremamente profissional na área de ${input.areaName}. 
    Seu objetivo é entrevistar o candidato ${input.userName} de forma técnica e direta. 
    Faça uma pergunta por vez. Use sua capacidade nativa de áudio para soar humano e profissional.`,
    messages: [
      ...historyMessages,
      {
        role: 'user',
        content: currentPromptParts
      }
    ]
  });

  const responseText = response.text;
  
  // Extrai a parte de áudio da resposta nativa
  const audioPart = response.message?.content.find(p => !!p.media);
  const audioUri = audioPart?.media?.url || '';

  return {
    text: responseText,
    audio: audioUri,
  };
}
