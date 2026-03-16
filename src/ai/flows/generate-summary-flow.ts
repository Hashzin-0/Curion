'use server';
/**
 * @fileOverview Fluxo de IA para geração de resumo profissional com fallback de modelos.
 */

import { ai } from '@/src/ai/genkit';
import { z } from 'genkit';
import { AI_CONFIG } from '../config';

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
  input: { schema: SummaryInputSchema },
  output: { schema: SummaryOutputSchema },
  prompt: `Você é um especialista em recrutamento. Gere um resumo profissional curto e impactante (máximo 4 linhas) para:
Nome: {{{name}}}
Atuação: {{{headline}}}
Experiências: {{#each experiences}}{{{this}}}, {{/each}}
Habilidades: {{#each skills}}{{{this}}}, {{/each}}
O tom deve ser profissional e focado em resultados.`,
});

export async function generateProfessionalSummary(input: SummaryInput): Promise<SummaryOutput> {
  const models = [AI_CONFIG.primaryModel, ...AI_CONFIG.fallbackModels];
  let lastError = null;

  for (const modelId of models) {
    try {
      const { output } = await summaryPrompt(input, { model: modelId });
      if (output) return output;
    } catch (e) {
      console.warn(`Tentativa com modelo ${modelId} falhou. Erro:`, e);
      lastError = e;
    }
  }

  throw lastError || new Error('Não foi possível gerar o resumo com nenhum dos modelos disponíveis.');
}
