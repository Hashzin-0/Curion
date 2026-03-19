
'use server';

/**
 * @fileOverview Cliente utilitário usando a SDK oficial da OpenAI configurada para o OpenRouter.
 * Suporta fallback de modelos, validação estruturada e Visão Computacional.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AI_CONFIG } from './config';

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://career-canvas.vercel.app',
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
  imageUri?: string; // Suporte para análise de imagem (Vision)
}): Promise<T> {
  const cleanModelName = (id: string) => id.replace(/^openai\//, '').replace(/^googleai\//, '');
  
  // Se houver imagem, prioriza modelos com visão (Gemini Flash no OpenRouter é excelente)
  const models = params.imageUri 
    ? ['google/gemini-flash-1.5', 'openai/gpt-4o-mini']
    : [
        cleanModelName(AI_CONFIG.primaryModel),
        ...AI_CONFIG.fallbackModels.map(cleanModelName)
      ];
  
  let lastError = null;
  const jsonSchema = params.schema ? zodToJsonSchema(params.schema) : null;

  for (const modelId of models) {
    try {
      const contentParts: any[] = [
        { type: 'text', text: params.prompt + (jsonSchema ? `\n\nResponda estritamente seguindo este esquema JSON:\n${JSON.stringify(jsonSchema)}` : '') }
      ];

      if (params.imageUri) {
        contentParts.push({
          type: 'image_url',
          image_url: { url: params.imageUri }
        });
      }

      const response = await client.chat.completions.create({
        model: modelId,
        messages: [
          ...(params.system ? [{ role: 'system' as const, content: params.system }] : []),
          { 
            role: 'user' as const, 
            content: contentParts
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
