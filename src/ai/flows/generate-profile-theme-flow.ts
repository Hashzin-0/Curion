
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
    system: "Você é um designer criativo. Retorne APENAS um objeto JSON válido.",
    prompt: `Crie uma identidade visual vibrante para:
Nome: ${input.name}
${input.headline ? `Título: ${input.headline}` : ''}
${input.areas ? `Áreas: ${input.areas.join(', ')}` : ''}

REQUISITOS:
- themeName: Nome criativo.
- primaryHex, secondaryHex, darkHex: Cores vibrantes em HEX.
- floatingEmojis: 8 emojis temáticos.
- tagline: Frase inspiradora curta.
- areaEmojis: Um emoji para cada área citada.`,
    schema: ProfileThemeOutputSchema
  });
}
