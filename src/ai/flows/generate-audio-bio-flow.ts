'use server';

/**
 * @fileOverview Fluxo de IA para converter texto de resumo profissional em áudio narrado.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

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

export async function generateAudioBio(text: string): Promise<{ audio: string }> {
  // Utilizamos o modelo gemini-2.5-flash-preview-tts para gerar áudio de alta qualidade
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
    prompt: `Narrate este resumo profissional com um tom calmo, profissional e inspirador em Português do Brasil: ${text}`,
  });

  if (!media || !media.url) {
    throw new Error('Falha ao gerar áudio da bio');
  }

  // O Gemini retorna PCM. Convertemos para WAV para compatibilidade com navegadores.
  const pcmBase64 = media.url.substring(media.url.indexOf(',') + 1);
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const wavBase64 = await pcmToWav(pcmBuffer);

  return {
    audio: `data:audio/wav;base64,${wavBase64}`,
  };
}
