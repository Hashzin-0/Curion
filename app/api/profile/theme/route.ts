import { NextRequest, NextResponse } from 'next/server';
import { generateProfileTheme } from '@/src/ai/flows/generate-profile-theme-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, headline, areas } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const theme = await generateProfileTheme({ name, headline, areas });
    return NextResponse.json(theme);
  } catch (error) {
    console.error('Erro ao gerar tema de perfil:', error);
    return NextResponse.json({ error: 'Erro ao gerar tema' }, { status: 500 });
  }
}
