
/**
 * @fileOverview Cliente utilitário para o OpenRouter configurado para Curion X.
 * Executa exclusivamente no servidor para garantir segurança da API Key e compatibilidade com Server Actions.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AI_CONFIG } from './config';

const getClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('OpenRouter: OPENROUTER_API_KEY não configurada no ambiente.');
  }
  
  return new OpenAI({
    apiKey: apiKey || 'placeholder',
    baseURL: 'https://openrouter.ai/api/v1',
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
  
  /**
   * Unifica a lista de modelos: tenta o primário e depois a lista de fallbacks da configuração.
   * Removida a priorização estática de modelos de imagem para respeitar a hierarquia definida pelo usuário.
   */
  const models = [AI_CONFIG.primaryModel, ...AI_CONFIG.fallbackModels];
  
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

      // Se houver imagem, ela é incluída no payload multimodal
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
          console.error(`OpenRouter [${modelId}]: Falha ao parsear JSON:`, content);
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

  throw lastError || new Error('Todos os modelos de IA configurados falharam.');
}
