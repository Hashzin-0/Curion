'use server';

/**
 * @fileOverview Fluxo de IA para conversão de texto em áudio usando arquitetura de fallbacks locais.
 * Tenta sequencialmente: ESPnet -> Kokoro -> Piper.
 * Requer que os binários/scripts estejam disponíveis no ambiente do servidor.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const execAsync = promisify(exec);
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Converte dados de um arquivo WAV para MP3 usando FFmpeg para otimização de espaço.
 */
async function wavToMp3(wavPath: string): Promise<string> {
  const mp3Path = wavPath.replace('.wav', '.mp3');
  
  return new Promise((resolve, reject) => {
    ffmpeg(wavPath)
      .toFormat('mp3')
      .audioBitrate('128k')
      .on('error', (err) => {
        console.error('FFmpeg Conversion Error:', err);
        reject(err);
      })
      .on('end', () => {
        const buffer = fs.readFileSync(mp3Path);
        const base64 = buffer.toString('base64');
        // Limpeza do MP3 temporário
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
        resolve(base64);
      })
      .save(mp3Path);
  });
}

/**
 * Tenta executar um comando de TTS e verifica se o arquivo foi gerado.
 */
async function tryRunTTS(command: string, outputPath: string): Promise<boolean> {
  try {
    await execAsync(command);
    return fs.existsSync(outputPath);
  } catch (err) {
    return false;
  }
}

export async function generateAudioBio(text: string): Promise<{ audio: string }> {
  const id = crypto.randomUUID();
  const wavPath = path.join(os.tmpdir(), `${id}.wav`);
  const escapedText = text.replace(/"/g, '\\"');
  
  let generated = false;

  // 1. 🧠 ESPnet (Qualidade Máxima)
  console.log('TTS: Tentando ESPnet...');
  generated = await tryRunTTS(`python3 espnet_tts.py "${escapedText}" ${wavPath}`, wavPath);

  // 2. 🔥 Kokoro (Fallback 1)
  if (!generated) {
    console.warn('TTS: ESPnet falhou, tentando Kokoro...');
    generated = await tryRunTTS(`python3 kokoro_tts.py "${escapedText}" ${wavPath}`, wavPath);
  }

  // 3. 🚀 Piper (Fallback 2)
  if (!generated) {
    console.warn('TTS: Kokoro falhou, tentando Piper...');
    generated = await tryRunTTS(`piper --text "${escapedText}" --output_file ${wavPath}`, wavPath);
  }

  // Se nenhum motor de servidor funcionou, sinalizamos para o frontend usar Web Speech API
  if (!generated) {
    console.error('TTS: Todos os motores locais falharam.');
    throw new Error('USE_BROWSER_TTS');
  }

  try {
    // Converte o resultado para MP3 para economizar banda
    const mp3Base64 = await wavToMp3(wavPath);
    
    // Limpeza do arquivo WAV temporário
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);

    return {
      audio: `data:audio/mpeg;base64,${mp3Base64}`,
    };
  } catch (err) {
    throw new Error('Erro na conversão de áudio para MP3');
  }
}
