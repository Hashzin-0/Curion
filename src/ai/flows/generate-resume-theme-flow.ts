
'use server';
/**
 * @fileOverview Fluxo de IA para gerar tema visual de currículo usando o SDK do OpenRouter.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const ThemeInputSchema = z.object({
  profession: z.string(),
  name: z.string(),
  experiences: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

const ThemeOutputSchema = z.object({
  themeName: z.string(),
  layoutStyle: z.enum(['vibrant', 'sidebar']),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  sidebarColor: z.string(),
  sidebarTextColor: z.string(),
  textOnPrimary: z.string(),
  headerEmoji: z.string(),
  decorationEmoji: z.string(),
  experienceEmoji: z.string(),
  educationEmoji: z.string(),
  courseEmoji: z.string(),
  skillEmoji: z.string(),
  bulletEmoji: z.string(),
  summaryEmoji: z.string(),
  professionalSummary: z.string(),
});

export type ResumeThemeInput = z.infer<typeof ThemeInputSchema>;
export type ResumeTheme = z.infer<typeof ThemeOutputSchema>;

export async function generateResumeTheme(input: ResumeThemeInput): Promise<ResumeTheme> {
  return askAI({
    system: "Você é um designer gráfico especializado em currículos temáticos. Retorne APENAS um objeto JSON válido.",
    prompt: `Crie um tema visual para o currículo de:
Profissão: ${input.profession}
Nome: ${input.name}

REGRAS:
- layoutStyle: "vibrant" (gastronomia, beleza, artes) ou "sidebar" (tecnologia, saúde, adm).
- professionalSummary: Resumo de 3 linhas EM MAIÚSCULAS.
- Cores em HEX.
- Emojis divertidos e temáticos.`,
    schema: ThemeOutputSchema
  });
}
