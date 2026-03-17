import { NextRequest, NextResponse } from 'next/server';
import { matchJobRequirements } from '@/src/ai/flows/match-job-requirements-flow';

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, profile } = await req.json();
    if (!jobDescription || !profile) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    const result = await matchJobRequirements({ jobDescription, profile });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro no Match IA:', error);
    return NextResponse.json({ error: 'Erro ao processar match com IA' }, { status: 500 });
  }
}
