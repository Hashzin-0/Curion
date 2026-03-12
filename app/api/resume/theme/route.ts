import { NextRequest, NextResponse } from 'next/server';
import { generateResumeTheme } from '@/src/ai/flows/generate-resume-theme-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profession, name, experiences, skills } = body;

    if (!profession || !name) {
      return NextResponse.json({ error: 'Profissão e nome são obrigatórios' }, { status: 400 });
    }

    const theme = await generateResumeTheme({ profession, name, experiences, skills });
    return NextResponse.json(theme);
  } catch (error) {
    console.error('Erro ao gerar tema:', error);
    return NextResponse.json({ error: 'Erro ao gerar tema com IA' }, { status: 500 });
  }
}
