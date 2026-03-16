
/**
 * @fileOverview Configuração centralizada de modelos de IA para uso com o SDK do OpenRouter.
 */

export const AI_CONFIG = {
  /**
   * Modelo principal padrão.
   */
  primaryModel: process.env.NEXT_PUBLIC_AI_MODEL || 'stepfun/step-3.5-flash:free',
  
  /**
   * Lista de fallbacks ordenada por preferência.
   */
  fallbackModels: (process.env.NEXT_PUBLIC_AI_FALLBACK_MODELS || 'google/gemini-2.0-flash-001,google/gemini-flash-1.5,openai/gpt-4o-mini').split(','),
};
