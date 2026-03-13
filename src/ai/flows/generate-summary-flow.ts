
'use server';
/**
 * @fileOverview Fluxo de IA para geração de resumo profissional usando OpenRouter.
 * 
 * - generateProfessionalSummary - Gera um resumo impactante baseado nas experiências do usuário.
 */

import { ai } from '@/src/ai/genkit';
import { z } from 'genkit';

const SummaryInputSchema = z.object({
  name: z.string(),
  headline: z.string(),
  experiences: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

const SummaryOutputSchema = z.object({
  summary: z.string().describe('Um parágrafo profissional e impactante para o resumo do currículo.'),
});

export type SummaryInput = z.infer<typeof SummaryInputSchema>;
export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;

const summaryPrompt = ai.definePrompt({
  name: 'summaryPrompt',
  model: 'stepfun/step-3.5-flash:free',
  input: { schema: SummaryInputSchema },
  output: { schema: SummaryOutputSchema },
  prompt: `Você é um especialista em recrutamento e branding pessoal.
Gere um resumo profissional curto e impactante (máximo 4 linhas) para o seguinte perfil:

Nome: {{{name}}}
Atuação: {{{headline}}}
Experiências principais: {{#each experiences}} - {{{this}}} {{/each}}
Habilidades: {{#each skills}} - {{{this}}} {{/each}}

O tom deve ser profissional, direto e focado em resultados. Escreva em português do Brasil.`,
});

export async function generateProfessionalSummary(input: SummaryInput): Promise<SummaryOutput> {
  const { output } = await summaryPrompt(input);
  if (!output) throw new Error('Falha ao gerar resumo');
  return output;
}
