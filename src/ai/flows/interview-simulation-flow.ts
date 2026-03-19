'use server';

/**
 * @fileOverview Fluxo de simulação de entrevista com Áudio Nativo Multimodal.
 * Utiliza Gemini 2.5 Flash para processar áudio de entrada e gerar áudio de saída em MP3.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { PassThrough } from 'stream';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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

async function pcmToMp3(pcmBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputStream = new PassThrough();
    const chunks: Buffer[] = [];
    outputStream.on('data', (chunk) => chunks.push(chunk));
    outputStream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    outputStream.on('error', reject);

    const inputStream = new PassThrough();
    inputStream.end(pcmBuffer);

    ffmpeg(inputStream)
      .inputFormat('s16le')
      .inputOptions(['-ar 24000', '-ac 1'])
      .toFormat('mp3')
      .audioBitrate('128k')
      .on('error', reject)
      .pipe(outputStream);
  });
}

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

  const response = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-preview'),
    system: `Você é um recrutador sênior extremamente profissional na área de ${input.areaName}. 
    Seu objetivo é entrevistar o candidato ${input.userName} de forma técnica e direta. 
    Faça uma pergunta por vez. Analise as respostas com profundidade.`,
    config: {
      responseModalities: ['AUDIO', 'TEXT'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Algenib' },
        },
      },
    },
    messages: [
      ...historyMessages,
      {
        role: 'user',
        content: currentPromptParts
      }
    ]
  });

  const responseText = response.text;
  const media = response.media;

  if (!media || !media.url) {
    throw new Error('Falha ao gerar áudio nativo na resposta multimodal');
  }

  const pcmBase64 = media.url.substring(media.url.indexOf(',') + 1);
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const mp3Base64 = await pcmToMp3(pcmBuffer);

  return {
    text: responseText,
    audio: `data:audio/mpeg;base64,${mp3Base64}`,
  };
}
