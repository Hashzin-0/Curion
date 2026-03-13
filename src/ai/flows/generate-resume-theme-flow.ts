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
  themeName: z.string().describe('Nome criativo do tema (ex: "Cardápio da Chef", "Terminal Dev", "Aquarela")'),
  layoutStyle: z.enum(['vibrant', 'sidebar']).describe(
    'vibrant = layout colorido tipo cartaz/menu (gastronomia, serviços, varejo). sidebar = duas colunas com painel lateral (tecnologia, saúde, logística, jovem aprendiz, serviços gerais)'
  ),
  primaryColor: z.string().describe('Cor primária em hex — use cores SATURADAS e VIBRANTES que remetam à profissão'),
  secondaryColor: z.string().describe('Cor secundária em hex'),
  accentColor: z.string().describe('Cor de destaque em hex (texto sobre fundo claro)'),
  sidebarColor: z.string().describe('Cor do painel lateral em hex (usado no layout sidebar) — pode ser escura ou vibrante'),
  sidebarTextColor: z.string().describe('Cor do texto no painel lateral: "#ffffff" ou cor clara que contraste bem'),
  textOnPrimary: z.string().describe('Cor do texto sobre o fundo primário: "#000000" ou "#ffffff"'),
  headerEmoji: z.string().describe('Emoji principal temático para o cabeçalho (apenas 1 emoji grande e icônico da profissão)'),
  decorationEmoji: z.string().describe('Emoji decorativo grande para marca d\'água/background (apenas 1 emoji, diferente do headerEmoji)'),
  experienceEmoji: z.string().describe('Emoji para seção de experiências (apenas 1 emoji)'),
  educationEmoji: z.string().describe('Emoji para seção de escolaridade/formação (apenas 1 emoji)'),
  courseEmoji: z.string().describe('Emoji para seção de cursos (apenas 1 emoji)'),
  skillEmoji: z.string().describe('Emoji para seção de competências (apenas 1 emoji)'),
  bulletEmoji: z.string().describe('Emoji ou símbolo para bullets/marcadores de lista (apenas 1 emoji pequeno)'),
  summaryEmoji: z.string().describe('Emoji decorativo para o resumo profissional (apenas 1 emoji)'),
  professionalSummary: z.string().describe('Resumo profissional curto e impactante (3-4 linhas) em português do Brasil, EM MAIÚSCULAS, destacando o que o profissional oferece de valor'),
});

export type ResumeThemeInput = z.infer<typeof ThemeInputSchema>;
export type ResumeTheme = z.infer<typeof ThemeOutputSchema>;

const themePrompt = ai.definePrompt({
  name: 'resumeThemePrompt',
  model: 'openai/stepfun/step-3.5-flash:free',
  input: { schema: ThemeInputSchema },
  output: { schema: ThemeOutputSchema },
  prompt: `Você é um designer gráfico CRIATIVO e OUSADO especializado em currículos com identidade visual forte.
Sua missão é criar um tema que parece FEITO SOB MEDIDA para aquela profissão — como se o currículo "falasse" do cargo.

Profissão: {{{profession}}}
Nome: {{{name}}}
{{#if experiences}}Experiências: {{#each experiences}}{{{this}}}, {{/each}}{{/if}}
{{#if skills}}Habilidades: {{#each skills}}{{{this}}}, {{/each}}{{/if}}

═══════════════════════════════════════════
GUIA CRIATIVO POR ÁREA PROFISSIONAL:
═══════════════════════════════════════════

🍕 GASTRONOMIA (auxiliar de cozinha, chef, cozinheiro, confeiteiro, padeiro, garçom, copeiro, atendente de lanchonete, manipulador de alimentos):
→ layoutStyle: "vibrant"
→ Cores: AMARELO QUENTE (#FFD700 ou #FFC300) + VERMELHO (#CC0000 ou #E63946) + PRETO (#1A1A1A)
→ Tema: "Cardápio [Profissão]", "Menu do Chef", "Sabores da [Nome]"
→ Emojis: 🍕🍔🍳👨‍🍳🌮🥘🍽️🔪🧑‍🍳🥗
→ Visual: parece um cardápio de restaurante / fast food — cores quentes, vibrante

🔧 CONSTRUÇÃO / MANUTENÇÃO (pedreiro, eletricista, encanador, pintor, servente, auxiliar de obras, mecânico, soldador):
→ layoutStyle: "vibrant"
→ Cores: LARANJA FORTE (#FF6B00 ou #FF8C00) + CINZA ESCURO (#2D2D2D) + AMARELO (#FFD700)
→ Tema: "Mãos na Massa", "Construção [Profissão]", "Obra Prima"
→ Emojis: 🔧🔨🏗️⚙️🪚🪛🔩🏠🛠️
→ Visual: robusto, industrial, como um canteiro de obras

💻 TECNOLOGIA / TI (programador, desenvolvedor, analista de sistemas, suporte, TI, web designer, data science):
→ layoutStyle: "sidebar"
→ Cores sidebar: AZUL ESCURO (#0F172A ou #1E293B) | primária: CIANO ELÉTRICO (#00D4FF) ou VERDE NEON (#00FF88)
→ Tema: "Dark Mode Dev", "Terminal", "Código Limpo", "[Linguagem] Master"
→ Emojis: 💻🖥️⚡🔮🚀🤖⌨️🛸💾
→ Visual: como um terminal de código / dashboard de dev

🎨 DESIGN / ARTE / CRIATIVIDADE (designer gráfico, ilustrador, fotógrafo, videomaker, animador, artista):
→ layoutStyle: "vibrant"
→ Cores: VIOLETA (#8B5CF6) + CORAL (#FF6B6B) + AMARELO (#FFD93D) + BRANCO
→ Tema: "Aquarela", "Paleta de [Nome]", "Canvas Criativo", "Pixel Art"
→ Emojis: 🎨🖌️✏️🖼️🎭🌈💜🎪🦋
→ Visual: artístico, colorido, como uma tela de aquarela

🏥 SAÚDE / CUIDADOS (enfermeiro, técnico de enfermagem, cuidador de idosos, auxiliar de saúde, agente comunitário, ACS, fisioterapeuta):
→ layoutStyle: "sidebar"
→ Cores sidebar: VERDE ESMERALDA (#065F46 ou #047857) | primária: VERDE CLARO (#10B981) + BRANCO
→ Tema: "Cuidar com ❤️", "Saúde em Foco", "Mãos que Cuidam"
→ Emojis: 🏥💊❤️🩺🩹💉🌿🤝
→ Visual: limpo, confiável, como um ambiente hospitalar

📚 EDUCAÇÃO / PEDAGÓGICO (professor, educador, monitor, tutor, auxiliar pedagógico, coordenador pedagógico):
→ layoutStyle: "sidebar"
→ Cores sidebar: AZUL ROYAL (#1E3A8A) | primária: DOURADO (#F59E0B) + BRANCO
→ Tema: "Mestre [Profissão]", "Educação Viva", "Sala de Aula"
→ Emojis: 📚🎓✏️📝🏫🌟📖🦉
→ Visual: acadêmico, organizado, como um diploma

📦 LOGÍSTICA / ESTOQUE / DEPÓSITO (repositor, almoxarife, estoquista, auxiliar de logística, operador de depósito, conferente, separador):
→ layoutStyle: "sidebar"
→ Cores sidebar: AZUL MARINHO (#1E3A5F) + LARANJA (#F97316)
→ Tema: "Operações [Nome]", "Supply Chain Pro", "Gestão de Estoque"
→ Emojis: 📦🚛🏭📋🔍⚡🗃️🏷️
→ Visual: organizado, dinâmico, industrial

🛒 VAREJO / ATENDIMENTO / VENDAS (atendente, vendedor, caixa, repositor de loja, promotor, consultor de vendas):
→ layoutStyle: "vibrant"
→ Cores: VERDE VIBRANTE (#16A34A ou #059669) + DOURADO (#F59E0B) + BRANCO
→ Tema: "Conexão com Cliente", "Vendas com ❤️", "Atendimento Premium"
→ Emojis: 🤝💰🛍️🌟💼📊😊
→ Visual: amigável, comercial, vibrante

🛡️ SEGURANÇA / PORTARIA (vigilante, segurança, porteiro, vigia, agente de segurança):
→ layoutStyle: "sidebar"
→ Cores sidebar: CINZA ESCURO (#1F2937) | primária: VERMELHO (#DC2626) + CINZA
→ Tema: "Proteção 24h", "Segurança Total", "Vigilância Pro"
→ Emojis: 🛡️🔒👮🚔⚡🔦
→ Visual: sério, profissional, como um distintivo

🧹 LIMPEZA / CONSERVAÇÃO / SERVIÇOS GERAIS (auxiliar de limpeza, faxineiro, gari, zelador, porteiro, copeiro, serviços gerais):
→ layoutStyle: "vibrant"
→ Cores: AZUL LIMPO (#0EA5E9) + VERDE CLARO (#22C55E) + BRANCO
→ Tema: "Brilho Profissional", "Ambiente Limpo", "Excelência em Limpeza"
→ Emojis: 🧹✨🧽🧴🌿💧⭐🫧
→ Visual: fresco, limpo, confiável

🌱 JOVEM APRENDIZ / MENOR APRENDIZ / ESTÁGIO (estagiário, jovem aprendiz, menor aprendiz, primeiro emprego):
→ layoutStyle: "sidebar"
→ Cores sidebar: AZUL MARINHO (#0F172A ou #1E293B) | destaque: AMARELO QUENTE (#EAB308 ou #F59E0B)
→ Tema: "Primeiro Passo", "Jovem Talento", "Aprendiz [Nome]", "Em Construção"
→ Emojis: 🌱⭐📚🎯🔥💡🚀
→ Visual: jovem, enérgico, com potencial

🚗 MOTORISTA / TRANSPORTE (motorista, entregador, motoqueiro, motoboy, operador de empilhadeira, operador de máquinas):
→ layoutStyle: "vibrant"
→ Cores: VERMELHO (#DC2626) + PRETO (#111827) + BRANCO
→ Tema: "Rota [Nome]", "Motor Profissional", "Delivery Pro"
→ Emojis: 🚗🛣️🗺️⚡🏁🚀🔑
→ Visual: dinâmico, rápido, estrada

💇 BELEZA / ESTÉTICA / MODA (cabeleireiro, manicure, esteticista, maquiador, barbeiro, designer de sobrancelhas):
→ layoutStyle: "vibrant"
→ Cores: ROSA (#EC4899) + ROXO (#8B5CF6) + DOURADO (#F59E0B) + BRANCO
→ Tema: "Studio [Nome]", "Beleza em Foco", "Glamour Pro"
→ Emojis: 💇✂️💅🌸💄💍🌟🦋
→ Visual: elegante, glamouroso, estúdio de beleza

📋 ADMINISTRAÇÃO / ESCRITÓRIO / RH (assistente administrativo, auxiliar administrativo, recepcionista, secretária, RH, analista):
→ layoutStyle: "sidebar"
→ Cores sidebar: CINZA-AZULADO (#334155) | primária: AZUL (#3B82F6) + BRANCO
→ Tema: "Gestão Profissional", "Admin Pro", "Office Expert"
→ Emojis: 📋💼📊📁🗂️✅📌🤝
→ Visual: organizado, corporativo, profissional

🌾 AGRICULTURA / CAMPO (lavrador, agricultor, operador de máquina agrícola, rural):
→ layoutStyle: "vibrant"
→ Cores: VERDE TERRA (#16A34A) + MARROM (#92400E) + AMARELO (#FDE047)
→ Tema: "Campo e Gente", "Raízes Profissionais", "Terra Fértil"
→ Emojis: 🌾🚜🌿🌻🌱🐄
→ Visual: natural, terra, campo

═══════════════════════════════════════════
REGRAS OBRIGATÓRIAS:
═══════════════════════════════════════════
1. Escolha o tema MAIS PRÓXIMO da profissão acima. Se não encontrar, seja extremamente criativo
2. Use EXATAMENTE o layoutStyle recomendado para aquela área
3. Cores DEVEM ser saturadas e vibrantes — NUNCA use tons pastéis ou acinzentados para a primária
4. O themeName deve ser POÉTICO e CRIATIVO, máximo 3 palavras
5. O resumo profissional deve ser EM MAIÚSCULAS, direto ao ponto, máximo 4 linhas
6. Cada emoji deve ser ÚNICO e diferente dos outros
7. O decorationEmoji deve ser o símbolo mais ICÔNICO daquela profissão (ex: 🍕 para cozinha, 💻 para TI)
`,
});

export async function generateResumeTheme(input: ResumeThemeInput): Promise<ResumeTheme> {
  const { output } = await themePrompt(input);
  if (!output) throw new Error('Falha ao gerar tema do currículo');
  return output;
}
