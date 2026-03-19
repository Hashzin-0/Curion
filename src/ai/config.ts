
/**
 * @fileOverview Configuração centralizada de modelos de IA para uso com o SDK do OpenRouter.
 */

export const AI_CONFIG = {
  /**
   * Modelo principal padrão definido via env ou fallback para step-3.5-flash.
   */
  primaryModel: process.env.NEXT_PUBLIC_AI_MODEL || 'stepfun/step-3.5-flash:free',
  
  /**
   * Lista de fallbacks ordenada por preferência para processamento de texto.
   */
  fallbackModels: (process.env.NEXT_PUBLIC_AI_FALLBACK_MODELS || 'google/gemini-2.0-flash-001,google/gemini-flash-1.5,openai/gpt-4o-mini').split(','),

  /**
   * Lista de modelos otimizados para Visão Computacional (processamento de imagens).
   * Configurada com fallbacks automáticos para garantir alta disponibilidade.
   */
  visionModels: (process.env.NEXT_PUBLIC_AI_VISION_MODELS || 'google/gemini-2.0-flash-001,google/gemini-flash-1.5,openai/gpt-4o-mini,anthropic/claude-3-haiku').split(','),
};
