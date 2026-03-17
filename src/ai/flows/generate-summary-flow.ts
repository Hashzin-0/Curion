'use server';
/**
 * @fileOverview Fluxo de IA para geração de resumo profissional inteligente usando o SDK do OpenRouter.
 * O sistema agora diferencia perfis experientes de iniciantes (Jovem Aprendiz).
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const SummaryOutputSchema = z.object({
  summary: z.string(),
});

export type SummaryInput = {
  name: string;
  headline: string;
  experiences?: { role: string; company: string; duration: string }[];
  skills?: string[];
  education?: { course: string; institution: string }[];
};

export async function generateProfessionalSummary(input: SummaryInput): Promise<{ summary: string }> {
  const hasHistory = (input.experiences && input.experiences.length > 0) || (input.education && input.education.length > 0);

  const prompt = hasHistory 
    ? `Gere um resumo profissional impactante e bem estruturado de aproximadamente 4 a 5 linhas para o seguinte perfil:
Nome: ${input.name}
Atuação/Headline: ${input.headline}

DADOS DO HISTÓRICO:
- Experiências: ${input.experiences?.map(e => `${e.role} na ${e.company} (${e.duration})`).join('; ')}
- Habilidades: ${input.skills?.join(', ')}
- Formação: ${input.education?.map(e => `${e.course} na ${e.institution}`).join('; ')}

REQUISITOS:
1. Comece com uma frase forte sobre a especialidade e tempo total de atuação (considere as durações listadas).
2. Destaque as principais competências técnicas e diferenciais sugeridos pelo histórico.
3. Mencione a base acadêmica como sustentação profissional.
4. Use um tom profissional, direto e focado em resultados.
5. Escreva em parágrafo único (texto corrido).`
    : `Gere um resumo profissional motivador e estratégico para um JOVEM APRENDIZ ou profissional em INÍCIO DE CARREIRA:
Nome: ${input.name}
Objetivo/Headline: ${input.headline}
Habilidades/Interesses: ${input.skills?.join(', ') || 'Proatividade, facilidade com tecnologia, vontade de aprender'}

REQUISITOS:
1. Foque no potencial de crescimento, facilidade de aprendizado e compromisso com o desenvolvimento profissional.
2. Destaque habilidades interpessoais (soft skills) e entusiasmo.
3. Não invente experiências falsas, mas valorize a formação acadêmica (se houver) e o desejo de contribuir com a organização.
4. Use um tom proativo, educado e profissional.
5. Escreva em parágrafo único (aprox. 4 linhas).`;

  return askAI({
    system: "Você é um especialista sênior em recrutamento e consultor de carreira. Sua especialidade é criar resumos profissionais que capturam a atenção de recrutadores em poucos segundos.",
    prompt,
    schema: SummaryOutputSchema
  });
}
