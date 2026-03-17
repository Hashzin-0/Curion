
import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/ai/flows/generate-cover-letter-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobDescription, profile } = body;

    if (!jobDescription || !profile) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    const result = await generateCoverLetter({
      jobDescription,
      userName: profile.name,
      userHeadline: profile.headline,
      userSummary: profile.summary || '',
      userExperiences: profile.experiences?.map((e: any) => `${e.role} na ${e.company_name}`) || []
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao gerar carta de apresentação:', error);
    return NextResponse.json({ error: 'Erro ao processar com IA' }, { status: 500 });
  }
}
