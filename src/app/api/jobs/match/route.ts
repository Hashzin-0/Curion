
import { NextRequest, NextResponse } from 'next/server';
import { calculateJobMatch } from '@/ai/flows/calculate-job-match-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userProfile, jobData } = body;

    if (!userProfile || !jobData) {
      return NextResponse.json({ error: 'Dados insuficientes para cálculo' }, { status: 400 });
    }

    const result = await calculateJobMatch({ userProfile, jobData });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Job Match] Erro:', error.message);
    return NextResponse.json({ error: 'Falha ao calcular match' }, { status: 500 });
  }
}
