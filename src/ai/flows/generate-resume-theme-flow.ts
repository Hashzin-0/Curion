'use server';
/**
 * @fileOverview Fluxo de IA para gerar tema visual de currículo baseado na área profissional.
 */

import { ai } from '@/src/ai/genkit';
import { z } from 'genkit';

const ThemeInputSchema = z.object({
  profession: z.string().describe('Cargo ou área de atuação do candidato'),
  name: z.string().describe('Nome do candidato'),
  experiences: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

const ThemeOutputSchema = z.object({
  themeName: z.string().describe('Nome criativo do tema (ex: "Pizza Chef", "Código Quente")'),
  primaryColor: z.string().describe('Cor primária em hex (ex: #FFD700)'),
  secondaryColor: z.string().describe('Cor secundária em hex (ex: #CC0000)'),
  accentColor: z.string().describe('Cor de destaque em hex (ex: #1A1A1A)'),
  textOnPrimary: z.string().describe('Cor do texto sobre o fundo primário: "#000000" ou "#ffffff"'),
  headerEmoji: z.string().describe('Emoji principal temático para o cabeçalho (apenas 1 emoji)'),
  experienceEmoji: z.string().describe('Emoji para seção de experiências (apenas 1 emoji)'),
  skillEmoji: z.string().describe('Emoji para seção de competências (apenas 1 emoji)'),
  bulletEmoji: z.string().describe('Emoji para bullets/marcadores de lista (apenas 1 emoji pequeno)'),
  summaryEmoji: z.string().describe('Emoji decorativo para o resumo profissional (apenas 1 emoji)'),
  professionalSummary: z.string().describe('Resumo profissional curto e impactante (3-4 linhas) em português do Brasil, em maiúsculas'),
});

export type ResumeThemeInput = z.infer<typeof ThemeInputSchema>;
export type ResumeTheme = z.infer<typeof ThemeOutputSchema>;

const themePrompt = ai.definePrompt({
  name: 'resumeThemePrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: ThemeInputSchema },
  output: { schema: ThemeOutputSchema },
  prompt: `Você é um designer criativo especialista em currículos temáticos e vibrantes.

Baseado na profissão/área abaixo, crie um tema visual CRIATIVO e MARCANTE para o currículo:

Profissão: {{{profession}}}
Nome: {{{name}}}
{{#if experiences}}Experiências: {{#each experiences}}{{{this}}}, {{/each}}{{/if}}
{{#if skills}}Habilidades: {{#each skills}}{{{this}}}, {{/each}}{{/if}}

REGRAS PARA O TEMA:
- Para gastronomia/alimentação: cores quentes (amarelo, vermelho, laranja), emojis de comida
- Para tecnologia/TI: cores azul escuro, ciano, roxo, emojis tech
- Para saúde/medicina: cores verde, branco, azul claro, emojis médicos
- Para educação: cores azul royal, dourado, emojis acadêmicos
- Para construção/obras: cores laranja, cinza, marrom, emojis de ferramentas
- Para beleza/estética: cores rosa, roxo, dourado, emojis de beleza
- Para logística/estoque: cores laranja, azul escuro, emojis de caixa/caminhão
- Para vendas/comercial: cores verde, dourado, emojis de negócio
- Para limpeza/serviços: cores azul claro, verde, emojis de limpeza
- Para segurança: cores cinza escuro, vermelho, emojis de proteção
- Outras áreas: seja criativo com cores vibrantes e emojis temáticos

O resumo profissional deve ser EM MAIÚSCULAS, direto ao ponto, máximo 4 linhas.
Seja MUITO criativo com os emojis - cada seção deve ter seu próprio emoji temático.`,
});

export async function generateResumeTheme(input: ResumeThemeInput): Promise<ResumeTheme> {
  const { output } = await themePrompt(input);
  if (!output) throw new Error('Falha ao gerar tema do currículo');
  return output;
}
