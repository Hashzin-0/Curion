
import { NextRequest, NextResponse } from 'next/server';
import { refineExperienceDescription } from '@/ai/flows/refine-experience-flow';

export async function POST(req: NextRequest) {
  try {
    const { role, company, description } = await req.json();
    if (!description) return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });

    const refined = await refineExperienceDescription({ role, company, description });
    return NextResponse.json({ refinedDescription: refined });
  } catch (error) {
    console.error('Erro ao refinar experiência:', error);
    return NextResponse.json({ error: 'Erro ao processar com IA' }, { status: 500 });
  }
}
