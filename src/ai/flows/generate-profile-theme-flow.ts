'use server';
/**
 * @fileOverview Fluxo de IA para gerar tema visual completo para páginas de perfil.
 */

import { ai } from '@/src/ai/genkit';
import { z } from 'genkit';

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
  model: 'stepfun/step-3.5-flash:free',
  input: { schema: ProfileThemeInputSchema },
  output: { schema: ProfileThemeOutputSchema },
  prompt: `Você é um designer criativo que cria identidades visuais vibrantes para profissionais.

Crie um tema visual CRIATIVO, COLORIDO e EXPRESSIVO para este perfil profissional:

Nome: {{{name}}}
{{#if headline}}Título: {{{headline}}}{{/if}}
{{#if areas}}Áreas de atuação: {{#each areas}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

REGRAS DE TEMA POR ÁREA:
- Gastronomia/Cozinha/Alimentação: tons quentes (laranja/vermelho/amarelo), emojis de comida 🍕🍔🍳🔥👨‍🍳🌶️🍽️🥘
- Tecnologia/Programação/TI: tons de neon azul/roxo/verde, emojis tech 💻⚡🚀🤖🔧⌨️🖥️🌐
- Saúde/Medicina/Enfermagem: verde/azul claro/branco, emojis saúde ❤️🏥💊🩺🌿🫀💉🩻
- Educação/Professor: azul royal/dourado, emojis academia 📚🎓✏️🏫📐🔬🎯📖
- Construção/Obras/Elétrica: laranja forte/cinza/preto, emojis obra 🔨🏗️⚙️🔌🪛🔩🏠🪚
- Beleza/Estética/Cabelereiro: rosa/roxo/dourado, emojis beleza 💅✨💄💇‍♀️🌸💋🪞👑
- Logística/Estoque/Transporte: azul escuro/laranja, emojis logística 📦🚚⚙️🏭📋🔄🗂️🚛
- Vendas/Comercial: verde/dourado/preto, emojis negócios 💰🤝📊💼🏆📈🎯💡
- Limpeza/Serviços Gerais: azul claro/verde/branco, emojis limpeza 🧹✨🫧🧽🌊🏡🫙✅
- Segurança: cinza escuro/vermelho, emojis proteção 🛡️🔒👮🚨🔐💪🏋️🦅
- Arte/Design/Criativo: multicolorido vibrante, emojis arte 🎨🖌️✨🌈🎭💫🖼️🎬
- Agricultura/Campo: verde escuro/marrom, emojis natureza 🌱🚜🌾🌻🌿🐄🍃🌍

Seja MUITO criativo! A tagline deve ser inspiradora. Os emojis devem ser temáticos e variados.
Para gradiente, escolha cores que combinem entre si e criem um visual impactante.`,
});

export async function generateProfileTheme(input: ProfileThemeInput): Promise<ProfileTheme> {
  const { output } = await profileThemePrompt(input);
  if (!output) throw new Error('Falha ao gerar tema de perfil');
  return output;
}
