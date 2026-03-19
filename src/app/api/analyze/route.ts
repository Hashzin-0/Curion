import { NextRequest, NextResponse } from 'next/server';
import { askAI } from '@/ai/openrouter';
import { AI_CONFIG } from '@/config/ai';
import { z } from 'zod';

const AnalysisSchema = z.object({
  score: z.number(),
  communication: z.number(),
  technical: z.number(),
  confidence: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  feedback: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const { answer } = await req.json();

    if (!answer) {
      return NextResponse.json({ error: 'Resposta não fornecida' }, { status: 400 });
    }

    const result = await askAI({
      system: AI_CONFIG.evaluationPrompt,
      prompt: `Analise a seguinte resposta do candidato e retorne a avaliação estruturada:\n\n"${answer}"`,
      schema: AnalysisSchema
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Analyze] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno na análise da IA via OpenRouter', details: error.message }, 
      { status: 500 }
    );
  }
}
