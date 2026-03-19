
'use server';

/**
 * @fileOverview Fluxo para geração de vetores (embeddings) de texto.
 * Utilizado para busca semântica e recomendação de perfis.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';

export async function generateTextEmbedding(text: string): Promise<number[]> {
  const embedding = await ai.embed({
    embedder: googleAI.embedder('text-embedding-04'),
    content: text,
  });

  return embedding;
}
