'use server';
/**
 * @fileOverview Fluxo de IA para refinar descrições de atividades profissionais.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const RefineOutputSchema = z.object({
  refinedDescription: z.string(),
});

export async function refineExperienceDescription(input: { role: string; company: string; description: string }): Promise<string> {
  const result = await askAI({
    system: "Você é um especialista em escrita de currículos de alto impacto. Sua tarefa é transformar descrições simples em realizações poderosas usando verbos de ação e termos profissionais. Retorne APENAS um JSON com a chave 'refinedDescription'.",
    prompt: `Refine e rebuque a seguinte descrição de atividades profissionais para torná-la mais impactante e profissional:
Cargo: ${input.role}
Empresa: ${input.company}
Descrição Atual: ${input.description}

Dicas: Use bullet points, destaque resultados e use vocabulário sofisticado da área.`,
    schema: RefineOutputSchema
  });

  return result.refinedDescription;
}
