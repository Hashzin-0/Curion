'use server';
/**
 * @fileOverview Fluxo de IA para gerar tema visual de currículo usando o SDK do OpenRouter.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

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

export type ResumeTheme = z.infer<typeof ThemeOutputSchema>;

export async function generateResumeTheme(input: { profession: string; name: string; experiences?: string[]; skills?: string[] }): Promise<ResumeTheme> {
  return askAI({
    system: "Você é um designer gráfico especializado em currículos profissionais e temáticos. Retorne APENAS um objeto JSON válido contendo todos os campos do esquema.",
    prompt: `Crie um tema visual exclusivo para o currículo de:
Profissão: ${input.profession}
Nome: ${input.name}

O JSON deve conter OBRIGATORIAMENTE os seguintes campos:
1. themeName: Nome do tema.
2. layoutStyle: Escolha "vibrant" (para áreas criativas/serviços) ou "sidebar" (para tecnologia/corporativo).
3. primaryColor: Cor principal em HEX.
4. secondaryColor: Cor secundária em HEX.
5. accentColor: Cor de destaque em HEX.
6. sidebarColor: Cor da barra lateral em HEX.
7. sidebarTextColor: Cor do texto sobre a barra lateral em HEX.
8. textOnPrimary: Cor do texto sobre a cor primária em HEX.
9. headerEmoji: Emoji principal do cabeçalho.
10. decorationEmoji: Emoji de marca d'água/fundo.
11. experienceEmoji: Emoji para a seção de experiências.
12. educationEmoji: Emoji para a seção de educação.
13. courseEmoji: Emoji para a seção de cursos.
14. skillEmoji: Emoji para a seção de competências.
15. bulletEmoji: Emoji para marcadores de lista.
16. summaryEmoji: Emoji para o resumo profissional.
17. professionalSummary: Um resumo de 3 linhas em português, focado na profissão informada, escrito EM LETRAS MAIÚSCULAS.`,
    schema: ThemeOutputSchema
  });
}
