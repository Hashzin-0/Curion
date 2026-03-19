'use server';

/**
 * @fileOverview Fluxo de IA para converter texto de resumo profissional em áudio MP3 otimizado.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { PassThrough } from 'stream';

// Configurar o caminho do binário FFmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Converte dados PCM brutos (retornados pelo Gemini) para MP3 usando FFmpeg.
 */
async function pcmToMp3(pcmBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputStream = new PassThrough();
    const chunks: Buffer[] = [];

    outputStream.on('data', (chunk) => chunks.push(chunk));
    outputStream.on('end', () => {
      const mp3Buffer = Buffer.concat(chunks);
      resolve(mp3Buffer.toString('base64'));
    });
    outputStream.on('error', reject);

    const inputStream = new PassThrough();
    inputStream.end(pcmBuffer);

    // O Gemini Native Audio retorna áudio em 24kHz, 16-bit Mono (s16le)
    ffmpeg(inputStream)
      .inputFormat('s16le')
      .inputOptions(['-ar 24000', '-ac 1'])
      .toFormat('mp3')
      .audioBitrate('128k')
      .on('error', (err) => {
        console.error('FFmpeg Conversion Error:', err);
        reject(err);
      })
      .pipe(outputStream);
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

  // O Gemini retorna PCM. Convertemos para MP3 para economizar banda e armazenamento.
  const pcmBase64 = media.url.substring(media.url.indexOf(',') + 1);
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const mp3Base64 = await pcmToMp3(pcmBuffer);

  return {
    audio: `data:audio/mpeg;base64,${mp3Base64}`,
  };
}
