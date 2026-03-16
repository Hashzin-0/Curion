'use server';
/**
 * @fileOverview Fluxo de IA para gerar tema visual de currículo com fallback de modelos.
 */

import { ai } from '@/src/ai/genkit';
import { z } from 'genkit';
import { AI_CONFIG } from '../config';

const ThemeInputSchema = z.object({
  profession: z.string().describe('Cargo ou área de atuação do candidato'),
  name: z.string().describe('Nome do candidato'),
  experiences: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

const ThemeOutputSchema = z.object({
  themeName: z.string().describe('Nome criativo do tema (ex: "Cardápio da Chef", "Terminal Dev")'),
  layoutStyle: z.enum(['vibrant', 'sidebar']).describe('vibrant ou sidebar'),
  primaryColor: z.string().describe('Cor primária em hex'),
  secondaryColor: z.string().describe('Cor secundária em hex'),
  accentColor: z.string().describe('Cor de destaque em hex'),
  sidebarColor: z.string().describe('Cor do painel lateral em hex'),
  sidebarTextColor: z.string().describe('Cor do texto no painel lateral'),
  textOnPrimary: z.string().describe('Cor do texto sobre o fundo primário'),
  headerEmoji: z.string().describe('Emoji principal temático'),
  decorationEmoji: z.string().describe('Emoji decorativo grande'),
  experienceEmoji: z.string().describe('Emoji para experiências'),
  educationEmoji: z.string().describe('Emoji para escolaridade'),
  courseEmoji: z.string().describe('Emoji para cursos'),
  skillEmoji: z.string().describe('Emoji para competências'),
  bulletEmoji: z.string().describe('Emoji para marcadores'),
  summaryEmoji: z.string().describe('Emoji para o resumo'),
  professionalSummary: z.string().describe('Resumo profissional curto (3-4 linhas) EM MAIÚSCULAS'),
});

export type ResumeThemeInput = z.infer<typeof ThemeInputSchema>;
export type ResumeTheme = z.infer<typeof ThemeOutputSchema>;

const themePrompt = ai.definePrompt({
  name: 'resumeThemePrompt',
  input: { schema: ThemeInputSchema },
  output: { schema: ThemeOutputSchema },
  prompt: `Você é um designer gráfico especializado em currículos temáticos.
Crie um tema visual que combine perfeitamente com a profissão abaixo.

Profissão: {{{profession}}}
Nome: {{{name}}}

Use layoutStyle "vibrant" para gastronomia, beleza, artes e serviços.
Use layoutStyle "sidebar" para tecnologia, saúde, educação e administrativo.
Cores devem ser fortes e representativas. O resumo deve ser impactante e EM MAIÚSCULAS.`,
});

export async function generateResumeTheme(input: ResumeThemeInput): Promise<ResumeTheme> {
  const models = [AI_CONFIG.primaryModel, ...AI_CONFIG.fallbackModels];
  let lastError = null;

  for (const modelId of models) {
    try {
      const { output } = await themePrompt(input, { model: modelId });
      if (output) return output;
    } catch (e) {
      console.warn(`Tentativa com modelo ${modelId} falhou. Erro:`, e);
      lastError = e;
    }
  }

  throw lastError || new Error('Falha crítica: Todos os modelos de IA falharam na geração do tema do currículo.');
}
