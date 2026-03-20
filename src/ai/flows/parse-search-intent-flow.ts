'use server';
/**
 * @fileOverview Fluxo de IA para extração de entidades e expansão de query (NER).
 * Transforma uma busca simples em um termo rico para o motor vetorial.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const SearchIntentSchema = z.object({
  expandedQuery: z.string().describe('A busca otimizada com sinônimos e termos técnicos para o motor vetorial.'),
  detectedEntities: z.object({
    location: z.string().optional(),
    skills: z.array(z.string()).optional(),
    role: z.string().optional(),
    regime: z.string().optional(),
  })
});

export type SearchIntent = z.infer<typeof SearchIntentSchema>;

export async function parseSearchIntent(query: string): Promise<SearchIntent> {
  return askAI({
    system: "Você é um assistente de busca semântica para recrutamento. Sua tarefa é analisar a frase do usuário e transformá-la em uma query expandida rica para um motor de busca vetorial. Identifique também entidades como localização, habilidades e cargos.",
    prompt: `Analise a seguinte busca: "${query}"
    
    INSTRUÇÕES:
    1. Crie uma expandedQuery que inclua sinônimos do cargo e termos técnicos relacionados.
    2. Identifique entidades estruturadas.
    3. Retorne APENAS o JSON.`,
    schema: SearchIntentSchema
  });
}
