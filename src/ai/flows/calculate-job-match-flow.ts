
'use server';
/**
 * @fileOverview Fluxo de IA para calcular a compatibilidade entre um candidato e uma vaga.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const MatchScoreOutputSchema = z.object({
  score: z.number().describe('Pontuação de 0 a 100 baseada na compatibilidade.'),
  reason: z.string().describe('Uma frase curta explicando o motivo da nota (máximo 10 palavras).'),
});

export type JobMatchScore = z.infer<typeof MatchScoreOutputSchema>;

export async function calculateJobMatch(input: {
  userProfile: {
    headline: string;
    summary: string;
    skills: string[];
    experiences: string[];
  };
  jobData: {
    title: string;
    description: string;
    requirements: string[];
  };
}): Promise<JobMatchScore> {
  return askAI({
    system: "Você é um recrutador técnico sênior. Sua tarefa é analisar friamente a compatibilidade entre um candidato e uma vaga. Seja justo e rigoroso. Retorne apenas o JSON solicitado.",
    prompt: `
      CANDIDATO:
      Título: ${input.userProfile.headline}
      Habilidades: ${input.userProfile.skills.join(', ')}
      Resumo: ${input.userProfile.summary}
      Experiências: ${input.userProfile.experiences.join(' | ')}

      VAGA:
      Cargo: ${input.jobData.title}
      Descrição: ${input.jobData.description}
      Requisitos: ${input.jobData.requirements.join(', ')}

      Calcule a porcentagem de match e dê uma justificativa curta.
    `,
    schema: MatchScoreOutputSchema
  });
}
