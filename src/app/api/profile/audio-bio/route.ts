
import { NextRequest, NextResponse } from 'next/server';
import { generateAudioBio } from '@/ai/flows/generate-audio-bio-flow';
import { DatabaseService } from '@/lib/services/database';
import crypto from 'crypto';

/**
 * @fileOverview API de Bio em Áudio com Cache Inteligente e Upload para Storage.
 */

export async function POST(req: NextRequest) {
  try {
    const { text, userId } = await req.json();
    if (!text) return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });

    // 1. Calcular Hash MD5 do texto para controle de versão
    const textHash = crypto.createHash('md5').update(text).digest('hex');

    // 2. Verificar se o usuário já tem um áudio para esse texto (Cache Hit)
    if (userId) {
      const user = await DatabaseService.getUserById(userId);
      if (user?.audio_bio_hash === textHash && user?.audio_bio_path) {
        return NextResponse.json({ audio: user.audio_bio_path, cached: true });
      }
    }

    // 3. Gerar novo áudio via IA (Gemini 2.5 Flash Native Audio)
    const result = await generateAudioBio(text);
    
    // 4. Se tivermos um userId, vamos persistir no Supabase Storage e DB
    if (userId && result.audio) {
      // Converter data URI para Buffer para upload direto
      const base64Data = result.audio.split(',')[1];
      const audioBuffer = Buffer.from(base64Data, 'base64');
      
      // Upload para pasta dedicada 'audio-bios'
      const publicUrl = await DatabaseService.uploadFile(
        new Blob([audioBuffer], { type: 'audio/wav' }),
        'audio-bios',
        'wav'
      );

      // Atualizar registro do usuário com a nova URL e o novo Hash
      await DatabaseService.updateUser(userId, {
        audio_bio_path: publicUrl,
        audio_bio_hash: textHash
      });

      return NextResponse.json({ audio: publicUrl, cached: false });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao processar áudio bio:', error);
    return NextResponse.json({ error: 'Erro ao processar áudio com IA', details: error.message }, { status: 500 });
  }
}
