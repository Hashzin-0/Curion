/**
 * @fileOverview Cliente utilitário para o OpenRouter configurado para Curion X.
 * Executa exclusivamente no servidor para garantir segurança da API Key e compatibilidade com Server Actions.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const getClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('OpenRouter: OPENROUTER_API_KEY não configurada no ambiente.');
  }
  
  return new OpenAI({
    apiKey: apiKey || 'placeholder',
    baseURL: 'https://openrouter.ai/api/v1',
    // dangerouslyAllowBrowser removido pois agora roda apenas no servidor
    defaultHeaders: {
      'HTTP-Referer': 'https://curionx.vercel.app',
      'X-Title': 'Curion X',
    }
  });
};

export async function askAI<T>(params: {
  system?: string;
  prompt: string;
  schema?: z.ZodType<T>;
  imageUri?: string;
}): Promise<T> {
  const client = getClient();
  const primaryModel = process.env.NEXT_PUBLIC_AI_MODEL || 'stepfun/step-3.5-flash:free';
  
  const models = params.imageUri 
    ? ['google/gemini-flash-1.5', 'openai/gpt-4o-mini']
    : [primaryModel, 'google/gemini-2.0-flash-001', 'openai/gpt-4o-mini'];
  
  let lastError = null;
  const jsonSchema = params.schema ? zodToJsonSchema(params.schema) : null;

  for (const modelId of models) {
    try {
      const contentParts: any[] = [
        { 
          type: 'text', 
          text: params.prompt + (jsonSchema ? `\n\nResponda estritamente seguindo este esquema JSON:\n${JSON.stringify(jsonSchema)}` : '') 
        }
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
      if (!content) throw new Error('IA retornou conteúdo vazio');

      if (params.schema) {
        try {
          const jsonString = content.replace(/```json\n?|```/g, '').trim();
          const data = JSON.parse(jsonString);
          return params.schema.parse(data);
        } catch (parseError) {
          console.error('OpenRouter: Falha ao parsear JSON:', content);
          throw new Error('Resposta da IA não é um JSON válido');
        }
      }

      return content as T;
    } catch (e: any) {
      console.warn(`OpenRouter: Erro no modelo ${modelId}:`, e.message);
      lastError = e;
      continue;
    }
  }

  throw lastError || new Error('Todos os modelos de IA falharam.');
}
