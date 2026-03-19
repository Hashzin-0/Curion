import { NextRequest, NextResponse } from 'next/server';
import { googleAI } from '@genkit-ai/google-genai';
import { ai } from '@/ai/genkit';
import { AI_CONFIG } from '@/config/ai';

export async function POST(req: NextRequest) {
  try {
    const { answer } = await req.json();

    // Utilizamos gemini-1.5-flash por ser estável e suportado
    const result = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `
${AI_CONFIG.evaluationPrompt}

Resposta do candidato:
"${answer}"
      `,
    });

    let parsed;
    try {
      const text = result.text.replace(/```json\n?|```/g, '').trim();
      parsed = JSON.parse(text);
    } catch {
      parsed = { feedback: result.text };
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Erro na rota analyze:', error);
    return NextResponse.json({ error: 'Falha interna na análise' }, { status: 500 });
  }
}
