/**
 * @fileOverview Configuração centralizada de modelos de IA e chaves.
 * Permite mudar o modelo principal e definir fallbacks sem alterar a lógica dos fluxos.
 */

export const AI_CONFIG = {
  // Modelo principal (Chave: key)
  primaryModel: process.env.NEXT_PUBLIC_AI_MODEL || 'stepfun/step-3.5-flash:free',
  
  // Lista de fallbacks para testar caso o principal falhe
  fallbackModels: (process.env.NEXT_PUBLIC_AI_FALLBACK_MODELS || 'googleai/gemini-2.0-flash-exp,googleai/gemini-1.5-flash,googleai/gemini-1.5-pro').split(','),
};
