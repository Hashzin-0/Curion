'use server';

/**
 * @fileOverview Fluxo para geração de vetores (embeddings) de texto.
 * Utilizado para busca semântica e recomendação de perfis.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';

export async function generateTextEmbedding(text: string): Promise<number[]> {
  const result = await ai.embed({
    embedder: googleAI.embedder('text-embedding-04'),
    content: text,
  });

  /**
   * O compilador no ambiente Vercel detectou o retorno como um array de objetos:
   * { embedding: number[], metadata?: Record<string, unknown> }[]
   * Realizamos a extração segura do vetor numérico.
   */
  if (Array.isArray(result) && result.length > 0) {
    const first = result[0] as any;
    if (first && first.embedding) {
      return first.embedding as number[];
    }
  }

  // Fallback caso o retorno seja o vetor direto
  return result as number[];
}
