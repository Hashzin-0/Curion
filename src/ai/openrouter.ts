
'use server';

/**
 * @fileOverview Cliente utilitário usando a SDK oficial da OpenAI configurada para o OpenRouter.
 * Suporta fallback de modelos e validação estruturada com Zod-to-JSON-Schema para precisão máxima.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AI_CONFIG } from './config';

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://curion-iota.vercel.app/',
    'X-Title': 'Curion',
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
  const cleanModelName = (id: string) => id.replace(/^openai\//, '').replace(/^googleai\//, '');
  
  const models = [
    cleanModelName(AI_CONFIG.primaryModel),
    ...AI_CONFIG.fallbackModels.map(cleanModelName)
  ];
  
  let lastError = null;

  // Converte o esquema Zod em um esquema JSON padrão para a IA
  const jsonSchema = params.schema ? zodToJsonSchema(params.schema) : null;

  for (const modelId of models) {
    try {
      const response = await client.chat.completions.create({
        model: modelId,
        messages: [
          ...(params.system ? [{ role: 'system' as const, content: params.system }] : []),
          { 
            role: 'user' as const, 
            content: params.prompt + (jsonSchema ? `\n\nResponda estritamente seguindo este esquema JSON:\n${JSON.stringify(jsonSchema)}` : '') 
          }
        ],
        response_format: params.schema ? { type: 'json_object' } : undefined,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Resposta vazia da IA');

      if (params.schema) {
        const jsonString = content.replace(/```json\n?|```/g, '').trim();
        const data = JSON.parse(jsonString);
        return params.schema.parse(data);
      }

      return content as T;
    } catch (e) {
      console.warn(`[OpenRouter SDK] Falha no modelo ${modelId}:`, e);
      lastError = e;
      continue;
    }
  }

  throw lastError || new Error('Todos os modelos do OpenRouter falharam.');
}
