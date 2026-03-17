
'use server';
/**
 * @fileOverview Fluxo de IA para gerar cartas de apresentação personalizadas.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const CoverLetterOutputSchema = z.object({
  letter: z.string().describe('O corpo da carta de apresentação formatado profissionalmente.'),
  subject: z.string().describe('Um assunto de e-mail sugerido para enviar a carta.'),
});

export type CoverLetterResult = z.infer<typeof CoverLetterOutputSchema>;

export async function generateCoverLetter(input: {
  jobDescription: string;
  userName: string;
  userHeadline: string;
  userSummary: string;
  userExperiences: string[];
}): Promise<CoverLetterResult> {
  return askAI({
    system: "Você é um consultor de carreira sênior e copywriter profissional. Sua tarefa é escrever uma carta de apresentação extremamente persuasiva e personalizada que destaque os pontos fortes do candidato em relação aos requisitos da vaga.",
    prompt: `Escreva uma carta de apresentação para:
Candidato: ${input.userName}
Título: ${input.userHeadline}
Resumo Profissional: ${input.userSummary}
Experiências Principais: ${input.userExperiences.join(', ')}

Para a seguinte vaga:
Descrição da Vaga: ${input.jobDescription}

REQUISITOS DA CARTA:
1. Tom profissional, mas entusiasta.
2. Conecte explicitamente as experiências do candidato aos requisitos da vaga.
3. Mantenha o texto conciso (máximo 4 parágrafos).
4. Inclua uma saudação profissional e um encerramento com chamada para ação (entrevista).
5. Escreva em Português do Brasil.`,
    schema: CoverLetterOutputSchema
  });
}
