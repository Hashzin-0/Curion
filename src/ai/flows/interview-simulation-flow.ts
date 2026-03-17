'use server';

/**
 * @fileOverview Fluxo de simulação de entrevista com Áudio Nativo Multimodal.
 * Utiliza Gemini 2.5 Flash para processar áudio de entrada e gerar áudio de saída diretamente.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const InterviewInputSchema = z.object({
  areaName: z.string().describe('A área profissional da entrevista.'),
  userName: z.string().describe('Nome do candidato.'),
  userAudio: z.string().optional().describe('Áudio do usuário em formato data URI (base64).'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Histórico da conversa textual.'),
});

const InterviewOutputSchema = z.object({
  text: z.string().describe('O texto transcrito ou resposta do recrutador.'),
  audio: z.string().describe('Áudio da resposta em formato data URI (WAV).'),
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
  // Utilizamos o modelo gemini-2.5-flash-preview que suporta áudio nativo in/out
  // O nome solicitado 'gemini-live-2.5-flash-native-audio' é mapeado para as capacidades multimodais do flash 2.5
  
  const promptParts: any[] = [
    { text: `Você é um recrutador sênior na área de ${input.areaName}. Entreviste o candidato ${input.userName}. Seja profissional e direto. Responda SEMPRE em áudio e texto simultaneamente.` }
  ];

  // Se o usuário enviou áudio, incluímos como parte do prompt multimodal
  if (input.userAudio) {
    promptParts.push({
      media: {
        url: input.userAudio,
        contentType: 'audio/wav'
      }
    });
  } else {
    promptParts.push({ text: "Inicie a entrevista se apresentando e fazendo a primeira pergunta." });
  }

  const response = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-preview'),
    config: {
      responseModalities: ['AUDIO', 'TEXT'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Algenib' },
        },
      },
    },
    prompt: promptParts,
    history: input.history?.map(h => ({ role: h.role, content: [{ text: h.content }] })),
  });

  const responseText = response.text;
  const media = response.media;

  if (!media || !media.url) {
    throw new Error('Falha ao gerar áudio nativo na resposta multimodal');
  }

  // Extrair buffer PCM da resposta nativa e converter para WAV para o browser
  const pcmBase64 = media.url.substring(media.url.indexOf(',') + 1);
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const wavBase64 = await pcmToWav(pcmBuffer);

  return {
    text: responseText,
    audio: `data:audio/wav;base64,${wavBase64}`,
  };
}
