import { NextRequest, NextResponse } from 'next/server';
import { generateSystemResumeTheme } from '@/lib/premium-themes';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profession, name } = body;

    if (!profession || !name) {
      return NextResponse.json({ error: 'Profissão e nome são obrigatórios' }, { status: 400 });
    }

    // Agora usa o gerador de sistema determinístico em vez de IA para o visual
    const theme = generateSystemResumeTheme(name, profession);
    return NextResponse.json(theme);
  } catch (error) {
    console.error('Erro ao gerar tema:', error);
    return NextResponse.json({ error: 'Erro ao gerar tema' }, { status: 500 });
  }
}
