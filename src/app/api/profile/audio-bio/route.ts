import { NextRequest, NextResponse } from 'next/server';
import { generateAudioBio } from '@/ai/flows/generate-audio-bio-flow';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });

    const result = await generateAudioBio(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao gerar áudio bio:', error);
    return NextResponse.json({ error: 'Erro ao processar áudio com IA' }, { status: 500 });
  }
}
