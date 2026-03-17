import { NextRequest, NextResponse } from 'next/server';
import { googleAI } from '@genkit-ai/google-genai';
import { ai } from '@/ai/genkit';
import { AI_CONFIG } from '@/config/ai';

export async function POST(req: NextRequest) {
  const { answer } = await req.json();

  const result = await ai.generate({
    model: googleAI.model('gemini-2.5-flash'),
    prompt: `
${AI_CONFIG.evaluationPrompt}

Resposta do candidato:
"${answer}"
    `,
  });

  let parsed;

  try {
    // No Genkit 1.x, o texto é uma propriedade direta do resultado
    const text = result.text.replace(/```json\n?|```/g, '').trim();
    parsed = JSON.parse(text);
  } catch {
    parsed = { feedback: result.text };
  }

  return NextResponse.json(parsed);
}
