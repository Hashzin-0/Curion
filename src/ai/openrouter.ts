
'use server';

/**
 * @fileOverview Cliente utilitário usando a SDK oficial da OpenAI configurada para o OpenRouter.
 * Suporta fallback de modelos e validação estruturada com Zod.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { AI_CONFIG } from './config';

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://careercanvas.app',
    'X-Title': 'CareerCanvas',
  }
});

/**
 * Realiza uma chamada ao OpenRouter com suporte a fallback de modelos e retorno estruturado.
 */
export async function askAI<T>(params: {
  system?: string;
  prompt: string;
  schema?: z.ZodType<T>;
}): Promise<T> {
  // Removemos o prefixo 'openai/' se existir, pois o SDK direto não precisa dele
  const cleanModelName = (id: string) => id.replace(/^openai\//, '');
  
  const models = [
    cleanModelName(AI_CONFIG.primaryModel),
    ...AI_CONFIG.fallbackModels.map(cleanModelName)
  ];
  
  let lastError = null;

  for (const modelId of models) {
    try {
      const response = await client.chat.completions.create({
        model: modelId,
        messages: [
          ...(params.system ? [{ role: 'system' as const, content: params.system }] : []),
          { role: 'user' as const, content: params.prompt }
        ],
        // Ativa o formato JSON se um esquema for fornecido
        response_format: params.schema ? { type: 'json_object' } : undefined,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Resposta vazia da IA');

      if (params.schema) {
        // Limpeza básica para garantir que o JSON seja válido
        const jsonString = content.replace(/```json\n?|```/g, '').trim();
        const data = JSON.parse(jsonString);
        return params.schema.parse(data);
      }

      return content as T;
    } catch (e) {
      console.warn(`[OpenRouter SDK] Falha no modelo ${modelId}:`, e);
      lastError = e;
      continue; // Tenta o próximo modelo no fallback
    }
  }

  throw lastError || new Error('Todos os modelos do OpenRouter falharam através do SDK.');
}
