
'use server';
/**
 * @fileOverview Fluxo de IA para geração de resumo profissional usando o SDK do OpenRouter.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const SummaryOutputSchema = z.object({
  summary: z.string(),
});

export async function generateProfessionalSummary(input: { name: string; headline: string; experiences?: string[]; skills?: string[] }): Promise<{ summary: string }> {
  return askAI({
    system: "Você é um especialista em recrutamento. Retorne APENAS um JSON com a chave 'summary'.",
    prompt: `Gere um resumo profissional impactante de 4 linhas para:
Nome: ${input.name}
Atuação: ${input.headline}
Experiências: ${input.experiences?.join(', ')}
Habilidades: ${input.skills?.join(', ')}`,
    schema: SummaryOutputSchema
  });
}
