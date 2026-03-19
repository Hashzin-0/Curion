
/**
 * @fileOverview Configuração centralizada de modelos de IA para uso com o SDK do OpenRouter.
 */

export const AI_CONFIG = {
  /**
   * Modelo principal padrão definido via env ou fallback para step-3.5-flash.
   */
  primaryModel: process.env.NEXT_PUBLIC_AI_MODEL || 'stepfun/step-3.5-flash:free',
  
  /**
   * Lista de fallbacks ordenada por preferência, extraída da variável NEXT_PUBLIC_AI_FALLBACK_MODELS.
   * Espera uma string separada por vírgulas.
   */
  fallbackModels: (process.env.NEXT_PUBLIC_AI_FALLBACK_MODELS || 'google/gemini-2.0-flash-001,google/gemini-flash-1.5,openai/gpt-4o-mini').split(','),
};
