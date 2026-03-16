'use server';
/**
 * @fileOverview Fluxo de IA para gerar tema visual de perfil usando o SDK do OpenRouter.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const ProfileThemeOutputSchema = z.object({
  themeName: z.string(),
  primaryHex: z.string(),
  secondaryHex: z.string(),
  darkHex: z.string(),
  gradientStart: z.string(),
  gradientEnd: z.string(),
  floatingEmojis: z.array(z.string()),
  heroEmoji: z.string(),
  tagline: z.string(),
  areaEmojis: z.record(z.string()),
});

export type ProfileTheme = z.infer<typeof ProfileThemeOutputSchema>;

export async function generateProfileTheme(input: { name: string; headline?: string; areas?: string[] }): Promise<ProfileTheme> {
  return askAI({
    system: "Você é um designer criativo especializado em interfaces modernas. Retorne APENAS um objeto JSON válido seguindo estritamente o esquema solicitado.",
    prompt: `Crie uma identidade visual vibrante para:
Nome: ${input.name}
${input.headline ? `Título: ${input.headline}` : ''}
${input.areas ? `Áreas de atuação: ${input.areas.join(', ')}` : ''}

REQUISITOS DO JSON (Todos os campos são obrigatórios):
- themeName: Um nome criativo para o estilo visual.
- primaryHex: Cor principal vibrante (Ex: #3b82f6).
- secondaryHex: Cor secundária harmônica (Ex: #10b981).
- darkHex: Cor de fundo escura profunda (Ex: #0f172a).
- gradientStart: Cor de início do gradiente do cabeçalho.
- gradientEnd: Cor de fim do gradiente do cabeçalho.
- floatingEmojis: Uma lista com exatamente 8 emojis relacionados às áreas citadas.
- heroEmoji: O emoji principal que representa o perfil.
- tagline: Uma frase inspiradora curta de uma linha.
- areaEmojis: Um objeto mapeando cada área enviada para um emoji único correspondente.`,
    schema: ProfileThemeOutputSchema
  });
}
