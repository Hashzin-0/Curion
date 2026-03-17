
'use server';

/**
 * @fileOverview Fluxo de simulação de entrevista com áudio nativo.
 * Utiliza Gemini 2.5 Flash Preview TTS para gerar voz.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const InterviewInputSchema = z.object({
  areaName: z.string().describe('A área profissional da entrevista.'),
  userName: z.string().describe('Nome do candidato.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Histórico da conversa.'),
  lastMessage: z.string().optional().describe('Última mensagem do usuário.'),
});

const InterviewOutputSchema = z.object({
  text: z.string().describe('O texto da pergunta ou resposta do recrutador.'),
  audio: z.string().describe('Áudio em formato data URI (WAV).'),
});

export type InterviewInput = z.infer<typeof InterviewInputSchema>;
export type InterviewOutput = z.infer<typeof InterviewOutputSchema>;

/**
 * Converte dados PCM brutos para o formato WAV.
 */
async function pcmToWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

export async function simulateInterview(input: InterviewInput): Promise<InterviewOutput> {
  // 1. Gerar o texto da resposta primeiro para garantir qualidade no diálogo
  const chat = await ai.generate({
    model: googleAI.model('gemini-1.5-flash'),
    system: `Você é um recrutador sênior especializado na área de ${input.areaName}. 
    Seu objetivo é entrevistar o candidato ${input.userName}. 
    Seja profissional, desafiador e faça perguntas situacionais. 
    Mantenha as respostas curtas (máximo 2 sentenças) para facilitar a audição.`,
    prompt: input.lastMessage || 'Comece a entrevista se apresentando e fazendo a primeira pergunta.',
    history: input.history?.map(h => ({ role: h.role, content: [{ text: h.content }] })),
  });

  const responseText = chat.text;

  // 2. Gerar o áudio nativo a partir do texto gerado
  const { media } = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-preview-tts'),
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Algenib' },
        },
      },
    },
    prompt: responseText,
  });

  if (!media || !media.url) {
    throw new Error('Falha ao gerar áudio nativo');
  }

  // Extrair buffer PCM e converter para WAV
  const pcmBase64 = media.url.substring(media.url.indexOf(',') + 1);
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const wavBase64 = await pcmToWav(pcmBuffer);

  return {
    text: responseText,
    audio: `data:audio/wav;base64,${wavBase64}`,
  };
}
