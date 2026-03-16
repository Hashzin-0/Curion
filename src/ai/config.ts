/**
 * @fileOverview Configuração centralizada de modelos de IA e chaves com suporte a namespaces do Genkit.
 */

export const AI_CONFIG = {
  /**
   * Modelo principal. 
   * IMPORTANTE: O Genkit exige o prefixo do plugin (openai/ para OpenRouter).
   */
  primaryModel: process.env.NEXT_PUBLIC_AI_MODEL || 'openai/stepfun/step-3.5-flash:free',
  
  /**
   * Lista de fallbacks. 
   * Modelos devem incluir o namespace do plugin: 'googleai/' ou 'openai/'.
   */
  fallbackModels: (process.env.NEXT_PUBLIC_AI_FALLBACK_MODELS || 'googleai/gemini-2.0-flash-exp,googleai/gemini-1.5-flash,openai/google/gemini-2.0-flash-001').split(','),
};
