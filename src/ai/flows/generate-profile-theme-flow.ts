'use server';
/**
 * @fileOverview Fluxo de IA para gerar tema visual completo para páginas de perfil com fallback.
 */

import { ai } from '@/src/ai/genkit';
import { z } from 'genkit';
import { AI_CONFIG } from '../config';

const ProfileThemeInputSchema = z.object({
  name: z.string(),
  headline: z.string().optional(),
  areas: z.array(z.string()).optional(),
});

const ProfileThemeOutputSchema = z.object({
  themeName: z.string().describe('Nome criativo do tema (ex: "Fogo na Cozinha", "Circuito Elétrico")'),
  primaryHex: z.string().describe('Cor primária vibrante em hex (ex: #FF6B35)'),
  secondaryHex: z.string().describe('Cor secundária em hex (ex: #FFD700)'),
  darkHex: z.string().describe('Cor escura para contraste em hex (ex: #1A0A00)'),
  gradientStart: z.string().describe('Cor inicial do gradiente hero em hex'),
  gradientEnd: z.string().describe('Cor final do gradiente hero em hex'),
  floatingEmojis: z.array(z.string()).describe('Exatamente 8 emojis temáticos para flutuar no fundo do hero'),
  heroEmoji: z.string().describe('Emoji principal gigante para o hero (1 emoji)'),
  tagline: z.string().describe('Frase criativa e curta que representa o profissional (máx 8 palavras, em pt-BR)'),
  areaEmojis: z.record(z.string()).describe('Objeto onde a chave é o nome da área e o valor é 1 emoji temático para ela'),
});

export type ProfileThemeInput = z.infer<typeof ProfileThemeInputSchema>;
export type ProfileTheme = z.infer<typeof ProfileThemeOutputSchema>;

const profileThemePrompt = ai.definePrompt({
  name: 'profileThemePrompt',
  model: AI_CONFIG.primaryModel,
  input: { schema: ProfileThemeInputSchema },
  output: { schema: ProfileThemeOutputSchema },
  prompt: `Você é um designer criativo que cria identidades visuais vibrantes para profissionais.

Crie um tema visual CRIATIVO, COLORIDO e EXPRESSIVO para este perfil profissional:

Nome: {{{name}}}
{{#if headline}}Título: {{{headline}}}{{/if}}
{{#if areas}}Áreas de atuação: {{#each areas}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

REGRAS DE TEMA POR ÁREA:
- Gastronomia/Cozinha: laranja/vermelho/amarelo, emojis 🍕🍳🔥
- Tecnologia: azul/roxo/verde neon, emojis 💻⚡🚀
- Saúde: verde/azul claro, emojis ❤️🏥💊
- Educação: azul royal/dourado, emojis 📚🎓✏️
- Construção/Obras: laranja forte/cinza, emojis 🔨🏗️⚙️
- Beleza/Estética: rosa/roxo, emojis 💅✨💄
- Logística/Estoque: azul escuro/laranja, emojis 📦🚚⚙️
- Vendas/Comercial: verde/dourado, emojis 💰🤝📊
- Limpeza: azul claro/verde, emojis 🧹✨🫧
- Segurança: cinza escuro/vermelho, emojis 🛡️🔒👮
- Arte/Design: multicolorido, emojis 🎨🖌️✨
- Agricultura: verde escuro/marrom, emojis 🌱🚜🌾

Seja MUITO criativo! A tagline deve ser inspiradora. Os emojis devem ser temáticos e variados.`,
});

export async function generateProfileTheme(input: ProfileThemeInput): Promise<ProfileTheme> {
  const models = [AI_CONFIG.primaryModel, ...AI_CONFIG.fallbackModels];
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Tentando gerar tema de perfil com modelo: ${model}`);
      const { output } = await profileThemePrompt(input, { model });
      if (output) return output;
    } catch (e) {
      console.warn(`Modelo ${model} falhou ou está offline. Tentando próximo...`);
      lastError = e;
    }
  }

  throw lastError || new Error('Todos os modelos de IA falharam na geração do tema de perfil.');
}
